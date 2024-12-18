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
const featureList = require("./models/featureList");
const post = require("./models/post");
const creationBottom = require("./models/creationBottom");
const multer = require("multer");
const FeatureHome = require("./models/featureHome");
const redis = require("redis");
const Code = require("./models/code");
const crypto = require("crypto");
dotenv.config();

app.use(compression()); //gzip compression for faster speed
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

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

app.post("/edit", artmiddleware, async function (req, res) {
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

app.post("/featureToHome", verifyToken, upload, async (req, res) => {
  const { serial1, serial2 } = req.body;

  const display1 = await Pic.findOne({ code: serial1 }); //Find picture
  const display2 = await Art.findOne({ code: serial2 }); //Find art

  if (display1 && display2) {
    if (display1.plant !== display2.plant) {
      return res.json({
        message: "Two features have to be of the same plant",
        success: false,
      });
    }
    const newFeatureHome = new FeatureHome({
      works: {
        pic: display1,
        art: display2,
      },
    });

    await newFeatureHome.save();
    res.json({ message: "success", success: true });
  }
  res.json({ message: "failed", success: false });
});

app.post("/uploadCreation", verifyToken, upload, async (req, res) => {
  try {
    const { body, files } = req;
    const inputFiles = [];
    const outputFolderPath = "client/public/plantspic/";
    const plant = await Post.findOne({ latinName: body.plant });

    if (!plant) {
      console.error("plant not found");
      return res.status(404).json({ message: "Plant not found" });
    }

    var picCode = await Code.findOne({ type: "crePic" });
    if (!picCode) {
      picCode = new Code({ type: "crePic", count: 0 });
      await picCode.save();
    }
    var artCode = await Code.findOne({ type: "creArt" });
    if (!artCode) {
      artCode = new Code({ type: "creArt", count: 0 });
      await artCode.save();
    }

    if (
      files &&
      files.pic &&
      files.pic.length > 0 &&
      files.art &&
      files.art.length > 0
    ) {
      inputFiles.push("./public/uploads/" + files.pic[0].filename);
      inputFiles.push("./public/uploads/" + files.art[0].filename);

      imageCompressor.compressImages(inputFiles, outputFolderPath);

      const picPath = path.join("/plantspic/", files.pic[0].filename);
      const artPath = path.join("/plantspic/", files.art[0].filename);

      const creation = new creationBottom({
        auth: false,
        plant: body.plant,
        art: artPath,
        pic: picPath,
        date: plant.postingtime,
        creator: req.user?.username,
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
      await Code.findOneAndUpdate(
        { type: "crePic" },
        { $inc: { count: 1 } },
        { new: true },
      );
      await Code.findOneAndUpdate(
        { type: "creArt" },
        { $inc: { count: 1 } },
        { new: true },
      );

      res.json({ message: "Files uploaded successfully", success: true });
    } else {
      res.status(400).json({ message: "Two files are required" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/upload", artmiddleware, verifyToken, async function (req, res) {
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

    await post.save();

    res.json({ success: true });
  } catch (error) {
    console.log(error, "uploading problems");
  }
});

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
  const outputFolderPath = "client/public/plantspic/";

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

        // 立即更新code记录，以便下一个文件使用新的code
        code = await Code.findOneAndUpdate(
          { type: "art" },
          { $inc: { count: 1 } },
          { new: true },
        );
      }

      // 压缩图片应该在循环外部进行，以避免重复压缩
      imageCompressor.compressImages(inputFiles, outputFolderPath);

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
    const outputFolderPath = "client/public/plantspic/";

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
      console.log("count" + code.count);

      var username = "admin";
      if (req.user) {
        username = req.user?.username;
      }

      if (req.files && req.files.length >= 1) {
        for (const file of req.files) {
          inputFiles.push("./public/uploads/" + file.filename);
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
          // 立即更新code记录，以便下一个文件使用新的code
          code = await Code.findOneAndUpdate(
            { type: "pic" },
            { $inc: { count: 1 } },
            { new: true },
          );
          console.log("pic saved with code: " + newCount);
        }

        // 压缩图片
        imageCompressor.compressImages(inputFiles, outputFolderPath);
        res.json({ success: true, message: "picture uploaded" });
      } else {
        res.status(400).json({ success: false, message: "No files uploaded" });
      }

      res.status(200).send("Upload successful");
    } catch (error) {
      res.status(500).send("Internal Server Error");
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

    if (!req.body.decision) {
      await EditTextRequest.deleteOne({ _id: request._id });
      return res.json({ success: true, message: "request denied" });
    }

    const postToEdit = await Post.findOneAndUpdate(
      { latinName: request.originalLatin },
      {
        $set: {
          latinName: request.latinName,
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
  await FeatureHome.deleteOne({ _id: req.body.id });
  const f = await FeatureHome.find();
  res.json({ success: true, f });
});

app.get("/uploadCreation", upload, async (req, res) => {
  const temp = await creationBottom.find({ auth: true });
  res.json({ temp, success: true });
});

app.post("/unFeatureCreation", upload, async (req, res) => {
  await creationBottom.deleteOne({ _id: req.body.temp });
  const temp = await creationBottom.find({ auth: true });

  res.json({ success: true, temp });
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
  console.log(req.body);
  await Pic.deleteOne({ _id: req.body.id });
  res.json({ success: true, message: "pic deleted" });
});

app.delete("/editPageDeletePlant", async (req, res) => {
  try {
    const plant = (await Post.findOne({ _id: req.body.id })).latinName;
    await Promise.all([
      Pic.deleteMany({ plant: plant }),
      Art.deleteMany({ plant: plant }),
      Post.deleteOne({ _id: req.body.id }),
    ]);
    res.json({
      success: true,
      message: "plant and related data(including pics and arts) deleted",
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "plant not deleted" });
  }
});
