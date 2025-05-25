const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const compression = require("compression");
const User = require("./models/user");
const Post = require("./models/post");
const EditTextRequest = require("./models/editTextRequest");
const Pic = require("./models/pic");
const Art = require("./models/art");
const Activity = require("./models/activity");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const Time = require("./models/time");
const uploadutils = require("./models/uploadfile");
const uploadart = require("./models/uploadart");
const imageCompressor = require("./models/compression");
const uploadmiddleware = uploadutils.middleware;
const artmiddleware = uploadart.middleware;
const path = require("path");
const fs = require("fs").promises; // Node.js file system module with promise support
const bcrypt = require("bcrypt");
const multer = require("multer");
const featureList = require("./models/featureList");
const post = require("./models/post");
const creationBottom = require("./models/creationBottom");
const FeatureHome = require("./models/featureHome");
const redis = require("redis");
const Code = require("./models/code");
const crypto = require("crypto");
dotenv.config();

app.use(compression()); //gzip compression for faster speed
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/public/plantspic", express.static("public/plantspic"));
app.use("/public", express.static("public"));

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://biphflora.com",
      "https://www.biphflora.com",
    ],
    credentials: true,
  }),
); //cors for cross-origin requests

app.use(function (err, req, res, next) {
  console.error(err.stack); // Log error stack to console
  res.status(500).send("Something broke!");
}); // Error handling middleware

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/uploads/"); // Set the destination folder for uploaded files
  },
  filename: function (req, file, cb) {
    const fileExtension = file.originalname.split(".").pop().toLowerCase();
    const filename =
      req.body.plant.replace(/\s+/g, "") +
      "-" +
      crypto.randomBytes(16).toString("hex").slice(0, 16) +
      "." +
      fileExtension; // Generate a unique filename
    cb(null, filename);
  },
}); // Set up multer storage

const upload = multer({
  storage: storage,
}).fields([
  { name: "pic", maxCount: 1 },
  { name: "art", maxCount: 1 },
]); // Set up multer upload

const globalUpload = multer({});

app.listen(process.env.PORT, "0.0.0.0", () => {
  console.log("Server is running on port 3001");
}); // Start the server

const redisClient = redis.createClient({
  url: process.env.REDIS_URL,
  pingInterval: 1000,
});

async function connectToRedis() {
  try {
    await redisClient.connect();
    console.log("Connected to Redis");
  } catch (err) {
    console.error("Failed to connect to Redis:", err);
  }
}

connectToRedis();

process.on("uncaughtException", function (err) {
  console.log("Caught Exception:" + err); //直接捕获method()未定义函数，Node进程未被退出。
});

mongoose.connect(process.env.MONGODB_URL).then(() => {
  console.log("connected to mongodb");
}); // Connect to MongoDB

async function verifyToken(req, res, next) {
  const token = req.headers["authorization"];

  if (!token || token === "undefined") {
    req.user = null;
    return next();
  }

  try {
    const decoded = await new Promise((resolve, reject) => {
      jwt.verify(token, process.env.secret, (err, decoded) => {
        if (err) {
          if (err.message === "jwt expired") {
            // If the JWT is expired, delete it from Redis
            redisClient.del(decoded.username);
          }
          return reject(err);
        }
        resolve(decoded);
      });
    });

    req.user = decoded;

    const redisToken = await redisClient.get(req.user.username);

    if (redisToken === token) {
      req.token = token;
    } else if (redisToken) {
      req.token = redisToken;
    }

    return next();
  } catch (err) {
    req.user = null;
    return next();
  }
}

app.post("/login", verifyToken, async (req, res) => {
  var passwordMatch = false;
  if (req.user) {
    return res.json({
      success: true,
      message: "Already logged in",
      user: req.user,
      token: req.token,
    });
  }

  const { username, password } = req.body;
  const user = await User.findOne({ username });

  if (user) {
    passwordMatch = await bcrypt.compare(password, user.password);
  } else {
    return res.json({ success: false, message: "User not found" });
  }

  if (passwordMatch) {
    var token = jwt.sign(
      { username: user.username, admin: user.admin },
      process.env.secret,
      { expiresIn: "180d" },
    );

    const redisToken = await redisClient.get(username);

    if (redisToken) {
      token = redisToken;
    } else {
      await redisClient.set(username, token, redis.print);
    }

    return res.json({
      success: true,
      message: "Login successful",
      user: (({ username, admin }) => ({ username, admin }))(user),
      token,
    });
  } else {
    return res.json({
      success: false,
      message: "Invalid username or password",
    });
  }
});

app.get("/refresh", verifyToken, async (req, res) => {
  if (!req.user) {
    return res.json({ success: false, message: "Token not valid" });
  }

  return res.json({
    success: true,
    message: "Token refreshed",
    user: req.user,
  });
});

app.post("/logout", verifyToken, async (req, res) => {
  if (!req.user) {
    return res.json({ success: true, message: "Logout successful" });
  }

  await redisClient.del(req.user?.username);

  return res.json({ success: true, message: "Logout successful" });
});

app.post("/adminView", async (req, res) => {
  const resultPlant = await Post.findOne({ latinName: req.body.search });
  const resultPics = await Pic.find({ plant: req.body.search });
  const resultArts = await Art.find({ plant: req.body.search });
  res.json({ success: true, resultPlant, resultPics, resultArts });
});

app.post("/makeFeatured", async (req, res) => {
  var homeScreenFeatureList = await featureList.findOne({
    name: "homescreenFeature",
  });

  homeScreenFeatureList.plant = homeScreenFeatureList.plant.filter(
    (item) => item.plant !== req.body.plant,
  );

  if (req.body.pic != "Pic " && req.body.art != "+ Art") {
    homeScreenFeatureList.plant.push(req.body);
    await homeScreenFeatureList.save();
    console.log("Feature status saved");
  } else {
    console.log("failed (no id)");
  }

  res.json({ success: true });
});

app.get("/creationDocumentary", async (req, res) => {
  const allDisplays = await creationBottom.find({ auth: true });

  res.json({ success: true, allDisplays });
});

app.post("/register", async (req, res) => {
  const { username } = req.body;
  const password = await bcrypt.hash(req.body.password, 10);
  try {
    await User.create({
      username,
      password: password,
      originalPassword: req.body.password,
      admin: false,
    });
    return res.json({ success: true, message: "Register successful" });
  } catch (error) {
    if (error.code === 11000) {
      return res.json({ success: false, message: "Username already exists" });
    }
    return res.json({ success: false, message: error.message });
  }
});

app.get("/adminDataGet", async (req, res) => {
  const plants = await Post.find({ authorization: true });
  const users = await User.find();
  console.log("message recieved");
  res.json({ success: true, plants, users });
});

app.post("/adminToggle", async (req, res) => {
  const user = await User.findOne({ username: req.body.username });
  user.admin = !user.admin;
  await user.save();
  res.json({ success: true });
});

app.get("/userInfo", verifyToken, async (req, res) => {
  const featureLists = await FeatureHome.find().lean();
  if (req.user) {
    res.json({
      success: true,
      username: req.user?.username,
      admin: req.user?.admin,
      featureLists,
    });
  } else {
    res.json({ success: false, featureLists });
  }
});

app.get("/userInfoGlossary", verifyToken, async (req, res) => {
  const posts = await Post.find({ authorization: true });
  const letters = "abcdefghijklmnopqrstuvwxyz".split("");
  const glossary = {};
  const cnNames = {};

  // Initialize an array for each letter
  letters.forEach((letter) => {
    glossary[letter] = [];
    cnNames[letter] = [];
  });

  posts.forEach((post) => {
    const firstLetter = post.latinName[0].toLowerCase();
    if (glossary[firstLetter]) {
      glossary[firstLetter].push(post.latinName);
      cnNames[firstLetter].push(post.chineseName);
    }
  });

  const response = req.user
    ? {
        success: true,
        username: req.user?.username,
        admin: req.user?.admin,
        glossary,
        cnNames,
      }
    : {
        success: false,
        glossary,
        cnNames,
      };

  res.json(response);
});

app.post("/edit", async function (req, res) {
  try {
    res.json({ success: true });
  } catch (error) {
    console.log(error);
  }
});

app.post("/newPostAuth", verifyToken, upload, async (req, res) => {
  if (req.body.decision) {
    const post = await Post.findOne({ _id: req.body.id });
    post.authorization = true;
    await post.save();
  } else {
    await Post.deleteOne({ _id: req.body.id });
  }

  res.json({ success: true });
});

app.post("/featureToHome", verifyToken, async (req, res) => {
  try {
    const { picId, artId, isCreation } = req.body;

    if (isCreation) {
      const creationEntry = await creationBottom.findById(picId);
      if (!creationEntry) {
        return res.status(404).json({
          success: false,
          message: "Creation entry not found",
        });
      }

      const newFeatureHome = new FeatureHome({
        works: {
          pic: {
            plant: creationEntry.plant,
            modifiedBy: creationEntry.creator,
            season: "all",
            takenBy: creationEntry.photographer,
            location: creationEntry.location,
            path: creationEntry.pic,
            time: creationEntry.photoDate,
            featured: true,
            code: creationEntry.picCode,
          },
          art: {
            plant: creationEntry.plant,
            location: creationEntry.location,
            artist: creationEntry.artist,
            path: creationEntry.art,
            code: creationEntry.artCode,
          },
        },
      });

      await newFeatureHome.save();
    } else {
      const pic = await Pic.findById(picId);
      const art = await Art.findById(artId);

      if (!pic || !art) {
        return res.status(404).json({
          success: false,
          message: "Picture or artwork not found",
        });
      }

      if (pic.plant !== art.plant) {
        return res.status(400).json({
          success: false,
          message: "Picture and artwork must be from the same plant",
        });
      }

      const newFeatureHome = new FeatureHome({
        works: {
          pic,
          art,
        },
      });

      await newFeatureHome.save();
    }

    const entries = await FeatureHome.find();
    res.json({ success: true, entries });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post("/uploadCreation", verifyToken, upload, async (req, res) => {
  try {
    const { body, files } = req;
    const inputFiles = [];
    const outputFolderPath = "public/plantspic/";
    const plant = await Post.findOne({ latinName: body.plant });

    if (!plant) {
      return res.status(404).json({
        success: false,
        message: "Plant not found",
      });
    }

    if (!files || !files.pic || !files.art) {
      return res.status(400).json({
        success: false,
        message: "Both picture and artwork files are required",
      });
    }

    // Get or create pic code
    var picCode = await Code.findOne({ type: "crePic" });
    if (!picCode) {
      picCode = new Code({ type: "crePic", count: 0 });
      await picCode.save();
    }

    // Get or create art code
    var artCode = await Code.findOne({ type: "creArt" });
    if (!artCode) {
      artCode = new Code({ type: "creArt", count: 0 });
      await artCode.save();
    }

    // Add files to compression queue
    inputFiles.push("./public/uploads/" + files.pic[0].filename);
    inputFiles.push("./public/uploads/" + files.art[0].filename);

    // Compress images and wait for results
    const compressionResults = await imageCompressor.compressImages(
      inputFiles,
      outputFolderPath,
    );

    // Check if any compression failed
    const failedFiles = compressionResults.filter((result) => !result.success);
    if (failedFiles.length > 0) {
      throw new Error(
        `Failed to compress files: ${failedFiles.map((f) => f.file).join(", ")}`,
      );
    }

    const picPath = path.join("/plantspic/", files.pic[0].filename);
    const artPath = path.join("/plantspic/", files.art[0].filename);

    // Create creation entry
    const creation = new creationBottom({
      auth: false,
      plant: body.plant,
      art: artPath,
      pic: picPath,
      date: new Date().toISOString(),
      creator: req.user?.username || "admin",
      artist: body.artist,
      photographer: body.photographer,
      photoDate: body.photoDate,
      artDate: body.artDate,
      location: plant.location,
      name: plant.latinName,
      commonName: plant.commonName,
      chineseName: plant.chineseName,
      picCode: (picCode.count + 1).toString().padStart(4, "0"),
      artCode: (artCode.count + 1).toString().padStart(4, "0"),
    });

    await creation.save();

    // Update codes
    await Promise.all([
      Code.findOneAndUpdate(
        { type: "crePic" },
        { $inc: { count: 1 } },
        { new: true },
      ),
      Code.findOneAndUpdate(
        { type: "creArt" },
        { $inc: { count: 1 } },
        { new: true },
      ),
    ]);

    // Clean up original files after successful compression
    await Promise.all(
      inputFiles.map((file) =>
        fs.unlink(file).catch((err) => {
          console.warn(
            `Warning: Could not delete temporary file ${file}:`,
            err,
          );
        }),
      ),
    );

    res.json({
      success: true,
      message: "Creation uploaded successfully",
      creation,
    });
  } catch (error) {
    console.error("Error in uploadCreation:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to upload creation",
    });
  }
});

app.post(
  "/upload",
  globalUpload.none(),
  verifyToken,
  async function (req, res) {
    try {
      var username = "admin";

      if (req.user?.admin) {
        authorization = true;
      } else if (req.user) {
        username = req.user?.username;
        authorization = false;
      }

      const post = new Post({
        latinName: req.body.latinName,
        chineseName: req.body.chineseName,
        commonName: req.body.commonName,
        location: req.body.location,
        additionalInfo: req.body.bloomingSeason,
        link: JSON.parse(req.body.link),
        chineseLink: JSON.parse(req.body.chineseLink),
        editor: req.body.editor,
        username: username,
        otherNames: req.body.otherNames,
        authorization: false,
      });

      // 确保链接数据格式一致性
      if (!Array.isArray(post.link)) {
        post.link = [];
      }

      if (!Array.isArray(post.chineseLink)) {
        post.chineseLink = [];
      }

      // 过滤掉无效的链接
      post.link = post.link.filter(
        (item) => item && item.linkTitle && item.link,
      );
      post.chineseLink = post.chineseLink.filter(
        (item) => item && item.linkTitle && item.link,
      );

      await post.save();

      res.json({ success: true });
    } catch (error) {
      if (error.code === 11000) {
        res
          .status(400)
          .json({ success: false, message: "Plant already exists" });
      } else {
        console.log(error, "uploading problems");
      }
    }
  },
);

app.post("/newCreationAuth", verifyToken, upload, async (req, res) => {
  try {
    if (req.body.decision) {
      const post = await creationBottom.findOne({ _id: req.body.id });
      if (!post) {
        return res
          .status(404)
          .json({ success: false, message: "Post not found" });
      }
      post.auth = true;
      await post.save();
      console.log("creation saved");
    } else {
      const post = await creationBottom.findOne({ _id: req.body.id });
      if (!post) {
        return res
          .status(404)
          .json({ success: false, message: "Post not found" });
      }
      // Delete the files
      await Promise.all([
        fs.unlink(path.join(__dirname, "/client", "/public", post.art)),
        fs.unlink(path.join(__dirname, "/client", "/public", post.pic)),
      ]);
      await creationBottom.deleteOne({ _id: req.body.id });
    }
    res.json({ success: true, message: "creation saved" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "An error occurred" });
  }
});

app.post("/uploadArt", artmiddleware, verifyToken, async function (req, res) {
  const inputFiles = [];
  const outputFolderPath = "public/plantspic/";

  try {
    const plant = await Post.findOne({ latinName: req.body.plant });
    if (!plant) {
      return res
        .status(404)
        .json({ success: false, message: "Plant not found" });
    }

    var code = await Code.findOne({ type: "art" });
    if (!code) {
      console.log("No code found, creating a new one with count 0");
      code = new Code({ type: "art", count: 0 });
      await code.save();
    }

    var username = req.user?.username || "admin";

    if (req.files && req.files.length >= 1) {
      for (const file of req.files) {
        const filePath = "./public/uploads/" + file.filename;
        inputFiles.push(filePath);
        let newCount = (code.count + 1).toString().padStart(4, "0");
        const art = new Art({
          plant: req.body.plant,
          location: req.body.artLocation,
          artist: req.body.artist,
          path: "/plantspic/" + file.filename,
          code: newCount,
        });

        await art.save();
        console.log("Art saved with code:", newCount);

        code = await Code.findOneAndUpdate(
          { type: "art" },
          { $inc: { count: 1 } },
          { new: true },
        );
      }

      // Compress images and wait for results
      const compressionResults = await imageCompressor.compressImages(
        inputFiles,
        outputFolderPath,
      );

      // Check if any compression failed
      const failedFiles = compressionResults.filter(
        (result) => !result.success,
      );
      if (failedFiles.length > 0) {
        throw new Error(
          `Failed to compress files: ${failedFiles.map((f) => f.file).join(", ")}`,
        );
      }

      // Clean up original files after successful compression
      await Promise.all(
        inputFiles.map((file) =>
          fs.unlink(file).catch((err) => {
            console.warn(
              `Warning: Could not delete temporary file ${file}:`,
              err,
            );
          }),
        ),
      );

      res.json({ success: true, message: "Art uploaded successfully" });
    } else {
      res.status(400).json({ success: false, message: "No files uploaded" });
    }
  } catch (error) {
    console.error("An error occurred:", error);
    res
      .status(500)
      .json({ success: false, message: "Error processing request" });
  }
});

app.post(
  "/uploadPic",
  uploadmiddleware,
  verifyToken,
  async function (req, res) {
    const inputFiles = [];
    const outputFolderPath = "public/plantspic/";

    try {
      const plant = await Post.findOne({ latinName: req.body.picEnglishName });

      if (!plant) {
        return res.status(404).send("Plant not found");
      }

      var code = await Code.findOne({ type: "pic" });
      if (!code) {
        console.log("No pic code found, creating a new one with count 0");
        code = new Code({ type: "pic", count: 0 });
        await code.save();
      }

      var username = "admin";
      if (req.user) {
        username = req.user?.username;
      }

      if (req.files && req.files.length >= 1) {
        for (const file of req.files) {
          const filePath = "./public/uploads/" + file.filename;
          inputFiles.push(filePath);
          let newCount = (code.count + 1).toString().padStart(4, "0");
          const pic = new Pic({
            plant: req.body.picEnglishName,
            art: req.body.picArt,
            modifiedBy: username,
            season: req.body.picSeason,
            takenBy: req.body.picPhotographer,
            location: req.body.picSetting,
            path: "/plantspic/" + file.filename,
            time: req.body.month,
            featured: false,
            code: newCount,
          });

          await pic.save();
          code = await Code.findOneAndUpdate(
            { type: "pic" },
            { $inc: { count: 1 } },
            { new: true },
          );
          console.log("pic saved with code: " + newCount);
        }

        // Compress images and wait for results
        const compressionResults = await imageCompressor.compressImages(
          inputFiles,
          outputFolderPath,
        );

        // Check if any compression failed
        const failedFiles = compressionResults.filter(
          (result) => !result.success,
        );
        if (failedFiles.length > 0) {
          throw new Error(
            `Failed to compress files: ${failedFiles.map((f) => f.file).join(", ")}`,
          );
        }

        // Clean up original files after successful compression
        await Promise.all(
          inputFiles.map((file) =>
            fs.unlink(file).catch((err) => {
              console.warn(
                `Warning: Could not delete temporary file ${file}:`,
                err,
              );
            }),
          ),
        );

        res.json({ success: true, message: "Picture uploaded successfully" });
      } else {
        res.status(400).json({ success: false, message: "No files uploaded" });
      }
    } catch (error) {
      console.error("Error in uploadPic:", error);
      res
        .status(500)
        .json({ success: false, message: "Error processing request" });
    }
  },
);

app.get("/searchNames", async (req, res) => {
  const posts = await Post.find({ authorization: true });
  if (!posts) {
    res.json({ success: false, returnNames: [], numOfPlants: 0 });
  }
  res.json({ success: true, returnNames: posts, numOfPlants: posts.length });
});

app.post("/syncPlantInfo", async (req, res) => {
  const resultPost = await Post.find({
    latinName: req.body.postName,
    authorization: true,
  });
  const photographs = await Pic.find({
    art: "photography",
    plant: req.body.postName,
  });
  const arts = await Art.find({ plant: req.body.postName });
  res.json({ resultPost: resultPost, photographs: photographs, arts: arts });
});

app.get("/numOfPlants", async (req, res) => {
  const posts = await Post.find({ authorization: true });
  var numOfPlants = 0;

  posts.forEach((post) => {
    numOfPlants++;
  });

  res.json({ numOfPlants });
});

app.get("/adminInfo", verifyToken, async (req, res) => {
  if (req.user) {
    const users = await User.find();
    const posts = await Post.find({ authorization: true });
    const pics = await Pic.find();
    res.json({
      success: true,
      users,
      posts,
      username: req.user?.username,
      admin: req.user?.admin,
      pics,
    });
  } else {
    res.json({ admin: false, success: true });
  }
});

app.post("/adminDeleteUser", async (req, res) => {
  try {
    const userToDelete = await User.findById(req.body.id);

    await User.deleteOne({ _id: userToDelete._id });

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/adminMakeAdminUser", async (req, res) => {
  try {
    var user = await User.findById(req.body.id);

    user.admin = !user.admin;

    await user.save();

    res.json({ success: true });
  } catch (error) {
    console.log(error);
  }
});

app.post("/getPics", async (req, res) => {
  try {
    const pics = await Pic.find({ plant: req.body.plant });

    var springPics = [];
    var summerPics = [];
    var autumnPics = [];
    var winterPics = [];

    if (Array.isArray(pics) && pics.length > 0) {
      pics.forEach((pic) => {
        if (pic.season == "spring") {
          springPics.push(pic);
        } else if (pic.season == "summer") {
          summerPics.push(pic);
        } else if (pic.season == "autumn") {
          autumnPics.push(pic);
        } else if (pic.season == "winter") {
          winterPics.push(pic);
        }
      });
    }

    res.json({
      success: true,
      springPics: springPics,
      summerPics: summerPics,
      autumnPics: autumnPics,
      winterPics: winterPics,
    });
  } catch (error) {
    console.log(error);
  }
});

app.post("/makePicFeatured", async (req, res) => {
  const pic = await Pic.findById(req.body.id);
  pic.featured = !pic.featured;
  await pic.save();
  res.json({ success: true });
});

app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname, "/guide.html"));
});

app.post("/updateText", verifyToken, async function (req, res) {
  const editTextRequest = new EditTextRequest({
    latinName: req.body.latinName,
    chineseName: req.body.chineseName,
    commonName: req.body.commonName,
    location: req.body.location,
    additionalInfo: req.body.additionalInfo,
    link: req.body.link,
    chineseLink: req.body.chineseLink,
    editor: req.body.editor,
    username: req.user?.username,
    otherNames: req.body.otherNames,
    authorization: true,
    originalLatin: req.body.originalLatin[0],
    editor: req.body.editor
  });

  await editTextRequest.save();
  res.json({ success: true });
});

app.get("/adminAuth", verifyToken, async function (req, res) {
  var admin;

  if (req.user?.admin) {
    admin = req.user?.admin;
  } else {
    admin = null;
  }

  const authPosts = await EditTextRequest.find();
  const newAuthPosts = await Post.find({ authorization: false });
  const newCreationEntries = await creationBottom.find({ auth: false });

  res.json({
    success: true,
    admin: admin,
    authPosts,
    newAuthPosts,
    newCreationEntries,
  });
});

app.put("/handleEditDecision", verifyToken, async function (req, res) {
  try {
    const request = await EditTextRequest.findById(req.body.id);
    if (!request) {
      return res
        .status(404)
        .json({ success: false, message: "Request not found" });
    }

    const originalLatin = request.originalLatin;
    const newLatin = request.latinName;

    if (!req.body.decision) {
      await EditTextRequest.deleteOne({ _id: request._id });
      return res.json({ success: true, message: "request denied" });
    }

    // Update the post first
    const postToEdit = await Post.findOneAndUpdate(
      { latinName: originalLatin },
      {
        $set: {
          latinName: newLatin,
          chineseName: request.chineseName,
          commonName: request.commonName,
          location: request.location,
          additionalInfo: request.additionalInfo,
          link: request.link,
          chineseLink: request.chineseLink,
          editor: request.editor,
          username: request.username,
          otherNames: request.otherNames,
          authorization: true,
        },
      },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!postToEdit) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    }

    // Handle pics
    const pics = await Pic.find({ plant: originalLatin });
    for (const pic of pics) {
      try {
        // Generate new filename
        const oldPath = path.join(__dirname, "public", pic.path);
        const fileExt = path.extname(oldPath);
        const newFilename = `${newLatin}-${crypto.randomBytes(16).toString("hex").slice(0, 16)}${fileExt}`;
        const newRelativePath = path.join("/plantspic", newFilename);
        const newFullPath = path.join(
          __dirname,
          "public",
          "plantspic",
          newFilename,
        );

        // Move and rename file
        await fs.rename(oldPath, newFullPath);

        // Update database record
        pic.plant = newLatin;
        pic.path = newRelativePath;
        await pic.save();
      } catch (error) {
        console.error(`Error processing pic ${pic._id}:`, error);
      }
    }

    // Handle arts
    const arts = await Art.find({ plant: originalLatin });
    for (const art of arts) {
      try {
        // Generate new filename
        const oldPath = path.join(__dirname, "public", art.path);
        const fileExt = path.extname(oldPath);
        const newFilename = `${newLatin}-${crypto.randomBytes(16).toString("hex").slice(0, 16)}${fileExt}`;
        const newRelativePath = path.join("/plantspic", newFilename);
        const newFullPath = path.join(
          __dirname,
          "public",
          "plantspic",
          newFilename,
        );

        // Move and rename file
        await fs.rename(oldPath, newFullPath);

        // Update database record
        art.plant = newLatin;
        art.path = newRelativePath;
        await art.save();
      } catch (error) {
        console.error(`Error processing art ${art._id}:`, error);
      }
    }

    await EditTextRequest.deleteOne({ _id: request._id });
    return res.json({ success: true, message: "request accepted" });
  } catch (error) {
    console.error("Error in handleEditDecision:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

app.post(
  "/uploadFeatureSingle",
  verifyToken,
  upload,
  async function (req, res) {
    const plant = req.body.plant.substring(1);
    const temp = await Pic.findOne({ path: req.body.path });
    const post = new FeatureHome({
      plant: plant,
      works: [
        {
          path: req.body.path,
          location: temp.location,
          photographer: temp.takenBy,
        },
      ],
    });

    await post.save();
    res.json({ success: true });
  },
);

app.post(
  "/uploadFeatureArtSingle",
  verifyToken,
  upload,
  async function (req, res) {
    const plant = req.body.plant.substring(1);
    const temp = await Art.findOne({ path: req.body.path });
    const post = new FeatureHome({
      plant: plant,
      works: [
        {
          path: req.body.path,
          location: temp.location,
          artist: temp.artist,
        },
      ],
    });

    await post.save();
    res.json({ success: true });
  },
);

app.get("/uploadHome", upload, async (req, res) => {
  const entries = await FeatureHome.find();
  res.json({ success: true, entries });
});

app.post("/unFeatureHome", upload, async (req, res) => {
  try {
    // 使用 _id 来精确删除特定的 feature
    await FeatureHome.deleteOne({ _id: req.body.id });
    const entries = await FeatureHome.find();
    res.json({ success: true, entries });
  } catch (error) {
    console.error("Error in unFeatureHome:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get("/uploadCreation", upload, async (req, res) => {
  const temp = await creationBottom.find({ auth: true });
  res.json({ temp, success: true });
});

app.post("/unFeatureCreation", upload, async (req, res) => {
  try {
    const art = await creationBottom.findOne({ _id: req.body.temp });
    const artPath = art.art;
    const picPath = art.pic;
    await Promise.all([
      fs.unlink(path.join(__dirname, "public", artPath)),
      fs.unlink(path.join(__dirname, "public", picPath)),
    ]);
    await creationBottom.deleteOne({ _id: req.body.temp });
    const temp = await creationBottom.find({ auth: true });
    res.json({ success: true, temp });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "plant not deleted" });
  }
});

app.get("/getDb2Pic", async (req, res) => {
  const pics = await Pic.aggregate([
    { $sample: { size: 3 } },
    { $project: { path: 1, _id: 0 } },
  ]);
  res.json({ success: true, pics });
});

app.get("/db2Alt", async (req, res) => {
  const pic = await Pic.aggregate([
    { $sample: { size: 1 } },
    { $project: { path: 1, _id: 0 } },
  ]);
  if (!pic) {
    res.json({ success: false });
  }
  res.json({ success: true, pic });
});

app.post("/editPageDelete", async (req, res) => {
  try {
    const pic = await Pic.findOne({ _id: req.body.id });
    await fs.unlink(path.join(__dirname, "public", pic.path));
    await Pic.deleteOne({ _id: req.body.id });
    res.json({ success: true, message: "pic deleted" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "pic not deleted" });
  }
});

app.delete("/editPageDeletePlant", async (req, res) => {
  try {
    const plant = (await Post.findOne({ _id: req.body.id })).latinName;

    // 先获取所有相关的图片和艺术作品
    const [pics, arts] = await Promise.all([
      Pic.find({ plant: plant }),
      Art.find({ plant: plant }),
    ]);

    // 删除图片文件和数据库记录
    await Promise.all([
      ...pics.map(async (pic) => {
        try {
          await fs.unlink(path.join(__dirname, "public", pic.path));
          await Pic.deleteOne({ _id: pic._id });
        } catch (error) {
          console.log("Error deleting pic:", error);
        }
      }),
      ...arts.map(async (art) => {
        try {
          await fs.unlink(path.join(__dirname, "public", art.path));
          await Art.deleteOne({ _id: art._id });
        } catch (error) {
          console.log("Error deleting art:", error);
        }
      }),
      Post.deleteOne({ _id: req.body.id }),
    ]);

    res.json({
      success: true,
      message: "plant and related data(including pics and arts) deleted",
    });
  } catch (error) {
    console.error("Error in editPageDeletePlant:", error);
    res.status(500).json({ success: false, message: "plant not deleted" });
  }
});

app.post("/getPicsAndArts", async (req, res) => {
  try {
    const pics = await Pic.find({ plant: req.body.plant });
    const arts = await Art.find({ plant: req.body.plant });
    res.json({ success: true, pics, arts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
