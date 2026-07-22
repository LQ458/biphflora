const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const compression = require("compression");
const User = require("./models/user");
const Post = require("./models/post");
const BirdPost = require("./models/birdPost");
const EditTextRequest = require("./models/editTextRequest");
const Pic = require("./models/pic");
const Art = require("./models/art");
const Activity = require("./models/activity");
const BirdEditTextRequest = require("./models/birdEditTextRequest")
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
const {
  MAX_IMAGE_FILE_SIZE,
  createImageFilename,
  ensureUploadTempDirectory,
  imageFileFilter,
  getUploadErrorResponse,
  validateImageFiles,
} = require("./models/uploadPolicy");
const featureList = require("./models/featureList");
const creationBottom = require("./models/creationBottom");
const FeatureHome = require("./models/featureHome");
const AuditEvent = require("./models/auditEvent");
const SearchEvent = require("./models/searchEvent");
const { createRuntime } = require("./runtime");
const { createAuthMiddleware } = require("./middleware/auth");
const {
  createAuditMiddleware,
  createRequestContext,
  createRequestLogger,
} = require("./middleware/observability");
const { createAuthRouter } = require("./routes/auth");
const catalogRouter = require("./routes/catalog");
const { createContentRouter } = require("./routes/content");
const { createTelemetryRouter } = require("./routes/telemetry");
const {
  cleanupFiles,
  getCompressedPlantMediaDirectory,
  getCompressedPlantMediaPath,
  getPlantMediaDirectory,
  getPlantMediaPath,
  getUploadedFiles,
} = require("./services/mediaFiles");
const Code = require("./models/code");
const birdPost = require('./models/birdPost')
const crypto = require("crypto");
dotenv.config();
const runtime = createRuntime({
  mongoose,
  redis: require("redis"),
  env: process.env,
  logger: console,
});
const {
  getAuthorizationToken,
  requireAdmin,
  requireAuth,
  sessionStoreUnavailable,
  verifyToken,
} = createAuthMiddleware({ User, jwt, runtime });

app.use(createRequestContext());
if (process.env.REQUEST_LOG_ENABLED === "true") {
  app.use(createRequestLogger({ logger: console }));
}
app.use(
  createAuditMiddleware({
    enabled: process.env.AUDIT_EVENTS_ENABLED === "true",
    actorHashSecret: process.env.AUDIT_HASH_SECRET,
    writeEvent: (event) => AuditEvent.create(event),
    logger: console,
  }),
);
app.use(compression()); //gzip compression for faster speed
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/public/plantspic", express.static("public/plantspic"));
app.use("/public/compressed/plantspic", express.static("public/compressed/plantspic"));
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

app.use(
  createTelemetryRouter({
    enabled: process.env.SEARCH_TELEMETRY_ENABLED === "true",
    SearchEvent,
    logger: console,
  }),
);

app.get("/health/live", (req, res) => {
  res.status(200).json({ status: "live" });
});

app.get("/health/ready", (req, res) => {
  const readiness = runtime.getReadiness();

  res.status(readiness.ready ? 200 : 503).json({
    status: readiness.ready ? "ready" : "not_ready",
    dependencies: readiness.dependencies,
  });
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    try {
      cb(null, ensureUploadTempDirectory());
    } catch (error) {
      cb(error);
    }
  },
  filename: function (req, file, cb) {
    try {
      cb(null, createImageFilename(file.mimetype));
    } catch (error) {
      cb(error);
    }
  },
}); // Set up multer storage

const upload = multer({
  storage: storage,
  limits: {
    fileSize: MAX_IMAGE_FILE_SIZE,
    files: 2,
  },
  fileFilter: imageFileFilter,
}).fields([
  { name: "pic", maxCount: 1 },
  { name: "art", maxCount: 1 },
]); // Set up multer upload

const globalUpload = multer({});

function uploadWithCleanup(req, res, next) {
  upload(req, res, async (error) => {
    if (error) {
      await cleanupFiles(getUploadedFiles(req.files).map((file) => file.path));
      return next(error);
    }

    return next();
  });
}

async function cleanupRecords(model, records) {
  await Promise.all(
    records.map((record) =>
      model.deleteOne({ _id: record._id }).catch(() => {
        console.warn("Unable to roll back uploaded record");
      }),
    ),
  );
}

const USER_PUBLIC_PROJECTION = { username: 1, admin: 1 };

function toPublicUser(user) {
  return {
    _id: user._id,
    username: user.username,
    admin: Boolean(user.admin),
  };
}

app.use(
  createAuthRouter({
    User,
    bcrypt,
    getAuthorizationToken,
    jwt,
    runtime,
    sessionStoreUnavailable,
    verifyToken,
  }),
);

app.post("/adminView", requireAdmin, async (req, res) => {
  const resultPlant = await Post.findOne({ latinName: req.body.search });
  const resultPics = await Pic.find({ plant: req.body.search });
  const resultArts = await Art.find({ plant: req.body.search });
  res.json({ success: true, resultPlant, resultPics, resultArts });
});

app.post("/makeFeatured", requireAdmin, async (req, res) => {
  var homeScreenFeatureList = await featureList.findOne({
    name: "homescreenFeature",
  });

  homeScreenFeatureList.plant = homeScreenFeatureList.plant.filter(
    (item) => item.plant !== req.body.plant,
  );

  if (req.body.pic != "Pic " && req.body.art != "+ Art") {
    homeScreenFeatureList.plant.push(req.body);
    await homeScreenFeatureList.save();
  }

  res.json({ success: true });
});

app.use(
  createContentRouter({
    Art,
    BirdPost,
    FeatureHome,
    Pic,
    Post,
    creationBottom,
    verifyToken,
  }),
);

app.get("/adminDataGet", requireAdmin, async (req, res) => {
  const plants = await Post.find({ authorization: true });
  const users = await User.find({}, USER_PUBLIC_PROJECTION);
  res.json({ success: true, plants, users: users.map(toPublicUser) });
});

app.post("/adminToggle", requireAdmin, async (req, res) => {
  const user = await User.findOne({ username: req.body.username });
  user.admin = !user.admin;
  await user.save();
  res.json({ success: true });
});

app.post("/edit", requireAuth, async function (req, res) {
  res.json({ success: true });
});

app.post("/newPostAuth", requireAdmin, uploadWithCleanup, async (req, res, type) => {
  if (req.body.decision) {
    const post = await Post.findOne({ _id: req.body.id });
    post.authorization = true;
    await post.save();
  } else {
    await Post.deleteOne({ _id: req.body.id });
  }

  res.json({ success: true });
});

app.post("/newBirdPostAuth", requireAdmin, uploadWithCleanup, async (req, res, type) => {
  if (req.body.decision) {
    const post = await BirdPost.findOne({ _id: req.body.id });
    post.authorization = true;
    await post.save();
  } else {
    await BirdPost.deleteOne({ _id: req.body.id });
  }
  res.json({ success: true });
});

app.post("/featureToHome", requireAdmin, async (req, res) => {
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
  } catch (_) {
    console.warn("Unable to update featured content");
    res.status(500).json({
      success: false,
      message: "Unable to update featured content",
    });
  }
});

app.post("/uploadCreation", requireAuth, uploadWithCleanup, async (req, res) => {
  const inputFiles = [];
  const outputFiles = [];
  let creation;

  try {
    const { body, files } = req;
    const uploadedFiles = getUploadedFiles(files);
    inputFiles.push(...uploadedFiles.map((file) => file.path));
    outputFiles.push(
      ...uploadedFiles.map((file) => getPlantMediaPath(file.filename)),
    );
    const outputFolderPath = getPlantMediaDirectory();
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

    await validateImageFiles([files.pic[0], files.art[0]]);

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
    creation = new creationBottom({
      auth: false,
      plant: body.plant,
      art: artPath,
      pic: picPath,
      date: new Date().toISOString(),
      creator: req.authenticatedUser.username,
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

    return res.json({
      success: true,
      message: "Creation uploaded successfully",
      creation,
    });
  } catch (error) {
    if (creation?._id) {
      await cleanupRecords(creationBottom, [creation]);
    }
    await cleanupFiles(outputFiles);

    const uploadError = getUploadErrorResponse(error);
    if (uploadError) {
      return res.status(uploadError.status).json(uploadError.body);
    }

    console.error("Creation upload failed");
    return res.status(500).json({
      success: false,
      message: "Unable to process creation upload",
    });
  } finally {
    await cleanupFiles(inputFiles);
  }
});

app.post(
  "/uploadPlant",
  requireAuth,
  globalUpload.none(),
  async function (req, res) {
    try {
      var username = "admin";
      if (!req.user?.admin && req.user) {
        username = req.user?.username;
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
        dbType: "plant"
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

      return res.json({ success: true });
    } catch (error) {
      if (error.code === 11000) {
        return res
          .status(400)
          .json({ success: false, message: "Plant already exists" });
      }
      console.warn("Unable to create plant submission");
      return res.status(500).json({
        success: false,
        message: "Unable to create plant submission",
      });
    }
  },
);

app.post(
  "/uploadBird",
  requireAuth,
  globalUpload.none(),
  async function (req, res) {
    try {
      var username = "admin";

      if (!req.user?.admin && req.user) {
        username = req.user?.username;
      }

      const post = new BirdPost({
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
        
        appearance: req.body.appearance,
        habitat: req.body.habitat,
        breeding: req.body.breeding,
        songs: req.body.songs,
        diet: req.body.diet,
        migration: req.body.migration,
        dbType: "bird",
        juvChar: req.body.juvChar,
        subChar: req.body.subChar,
        mAdultChar: req.body.mAdultChar,
        fAdultChar: req.body.fAdultChar
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
      return res.json({ success: true });
    } catch (error) {
      if (error.code === 11000) {
        return res
          .status(400)
          .json({ success: false, message: "Bird already exists" });
      }
      console.warn("Unable to create bird submission");
      return res.status(500).json({
        success: false,
        message: "Unable to create bird submission",
      });
    }
  },
);

app.post("/newCreationAuth", requireAdmin, uploadWithCleanup, async (req, res) => {
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
    } else {
      const post = await creationBottom.findOne({ _id: req.body.id });
      if (!post) {
        return res
          .status(404)
          .json({ success: false, message: "Post not found" });
      }
      // Delete the files
      await Promise.all([
        fs.unlink(path.join(__dirname, "/public", post.art)),
        fs.unlink(path.join(__dirname, "/public", post.pic)),
      ]);
      await creationBottom.deleteOne({ _id: req.body.id });
    }
    res.json({ success: true, message: "creation saved" });
  } catch (_) {
    console.warn("Unable to review creation submission");
    res.status(500).json({ success: false, message: "An error occurred" });
  }
});

app.post("/uploadArt", requireAuth, artmiddleware, async function (req, res) {
  const inputFiles = [];
  const outputFiles = [];
  const createdArts = [];
  const uploadedFiles = getUploadedFiles(req.files);
  const outputFolderPath = getPlantMediaDirectory();

  inputFiles.push(...uploadedFiles.map((file) => file.path));
  outputFiles.push(
    ...uploadedFiles.map((file) => getPlantMediaPath(file.filename)),
  );

  try {
    const plant = await Post.findOne({ latinName: req.body.plant });
    if (!plant) {
      return res
        .status(404)
        .json({ success: false, message: "Plant not found" });
    }

    if (uploadedFiles.length >= 1) {
      await validateImageFiles(uploadedFiles);

      // Compress images and wait for results
      const compressionResults = await imageCompressor.compressImages(
        inputFiles,
        outputFolderPath,
      );

      // Check if any compression failed
      const failedFiles = compressionResults.filter(
        (result) => !result.success,
      );
      if (
        compressionResults.length !== inputFiles.length ||
        failedFiles.length > 0
      ) {
        throw new Error("Image compression failed");
      }

      var code = await Code.findOne({ type: "art" });
      if (!code) {
        code = new Code({ type: "art", count: 0 });
        await code.save();
      }

      for (const file of uploadedFiles) {
        const newCount = (code.count + 1).toString().padStart(4, "0");
        const art = new Art({
          plant: req.body.plant,
          location: req.body.artLocation,
          artist: req.body.artist,
          path: "/plantspic/" + file.filename,
          code: newCount,
        });

        await art.save();
        createdArts.push(art);
        code = await Code.findOneAndUpdate(
          { type: "art" },
          { $inc: { count: 1 } },
          { new: true },
        );
      }

      return res.json({ success: true, message: "Art uploaded successfully" });
    } else {
      return res
        .status(400)
        .json({ success: false, message: "No files uploaded" });
    }
  } catch (error) {
    await cleanupRecords(Art, createdArts);
    await cleanupFiles(outputFiles);

    const uploadError = getUploadErrorResponse(error);
    if (uploadError) {
      return res.status(uploadError.status).json(uploadError.body);
    }

    console.error("Artwork upload failed");
    return res
      .status(500)
      .json({ success: false, message: "Unable to process image upload" });
  } finally {
    await cleanupFiles(inputFiles);
  }
});

app.post(
  "/uploadPic",
  requireAuth,
  uploadmiddleware,
  async function (req, res) {
    const inputFiles = [];
    const outputFiles = [];
    const createdPics = [];
    const uploadedFiles = getUploadedFiles(req.files);
    const outputFolderPath = getPlantMediaDirectory();
    const smallerCompressedFolderPath = getCompressedPlantMediaDirectory();

    inputFiles.push(...uploadedFiles.map((file) => file.path));
    outputFiles.push(
      ...uploadedFiles.flatMap((file) => [
        getPlantMediaPath(file.filename),
        getCompressedPlantMediaPath(file.filename),
      ]),
    );

    try {
      const plant = await Post.findOne({ latinName: req.body.picEnglishName });

      if (!plant) {
        return res.status(404).send("Plant not found");
      }

      if (uploadedFiles.length >= 1) {
        await validateImageFiles(uploadedFiles);

        const compressionResults = await imageCompressor.compressImages(
          inputFiles,
          outputFolderPath,
          5,
          90,
        );
        let failedFiles = compressionResults.filter(
          (result) => !result.success,
        );
        if (
          compressionResults.length !== inputFiles.length ||
          failedFiles.length > 0
        ) {
          throw new Error("Image compression failed");
        }

        const smallerCompressionResults = await imageCompressor.compressImages(
          inputFiles,
          smallerCompressedFolderPath,
          9,
          70,
        );

        failedFiles = smallerCompressionResults.filter(
          (result) => !result.success,
        );
        if (
          smallerCompressionResults.length !== inputFiles.length ||
          failedFiles.length > 0
        ) {
          throw new Error("Image compression failed");
        }

        var code = await Code.findOne({ type: "pic" });
        if (!code) {
          code = new Code({ type: "pic", count: 0 });
          await code.save();
        }

        for (const file of uploadedFiles) {
          const newCount = (code.count + 1).toString().padStart(4, "0");
          const pic = new Pic({
            plant: req.body.picEnglishName,
            art: req.body.picArt,
            modifiedBy: req.authenticatedUser.username,
            season: req.body.picSeason,
            takenBy: req.body.picPhotographer,
            location: req.body.picSetting,
            path: "/plantspic/" + file.filename,
            time: req.body.month,
            featured: false,
            code: newCount,
          });

          await pic.save();
          createdPics.push(pic);
          code = await Code.findOneAndUpdate(
            { type: "pic" },
            { $inc: { count: 1 } },
            { new: true },
          );
        }

        return res.json({
          success: true,
          message: "Picture uploaded successfully",
        });
      } else {
        return res
          .status(400)
          .json({ success: false, message: "No files uploaded" });
      }
    } catch (error) {
      await cleanupRecords(Pic, createdPics);
      await cleanupFiles(outputFiles);

      const uploadError = getUploadErrorResponse(error);
      if (uploadError) {
        return res.status(uploadError.status).json(uploadError.body);
      }

      console.error("Picture upload failed");
      return res
        .status(500)
        .json({ success: false, message: "Unable to process image upload" });
    } finally {
      await cleanupFiles(inputFiles);
    }
  },
);

app.post(
  "/uploadBirdPic",
  requireAuth,
  uploadmiddleware,
  async function (req, res) {
    const inputFiles = [];
    const outputFiles = [];
    const createdPics = [];
    const uploadedFiles = getUploadedFiles(req.files);
    const outputFolderPath = getPlantMediaDirectory();
    const smallerCompressedFolderPath = getCompressedPlantMediaDirectory();

    inputFiles.push(...uploadedFiles.map((file) => file.path));
    outputFiles.push(
      ...uploadedFiles.flatMap((file) => [
        getPlantMediaPath(file.filename),
        getCompressedPlantMediaPath(file.filename),
      ]),
    );

    try {
      const plant = await BirdPost.findOne({ latinName: req.body.picEnglishName });

      if (!plant) {
        return res.status(404).send("Plant not found");
      }

      if (uploadedFiles.length >= 1) {
        await validateImageFiles(uploadedFiles);

        const compressionResults = await imageCompressor.compressImages(
          inputFiles,
          outputFolderPath,
          5,
          90,
        );
        let failedFiles = compressionResults.filter(
          (result) => !result.success,
        );
        if (
          compressionResults.length !== inputFiles.length ||
          failedFiles.length > 0
        ) {
          throw new Error("Image compression failed");
        }

        const smallerCompressionResults = await imageCompressor.compressImages(
          inputFiles,
          smallerCompressedFolderPath,
          9,
          70,
        );

        failedFiles = smallerCompressionResults.filter(
          (result) => !result.success,
        );
        if (
          smallerCompressionResults.length !== inputFiles.length ||
          failedFiles.length > 0
        ) {
          throw new Error("Image compression failed");
        }

        var code = await Code.findOne({ type: "pic" });
        if (!code) {
          code = new Code({ type: "pic", count: 0 });
          await code.save();
        }

        for (const file of uploadedFiles) {
          const newCount = (code.count + 1).toString().padStart(4, "0");
          const pic = new Pic({
            plant: req.body.picEnglishName,
            art: req.body.picArt,
            modifiedBy: req.authenticatedUser.username,
            season: req.body.picSeason.replace("-", "").replace(" ", ""),
            takenBy: req.body.picPhotographer,
            location: req.body.picSetting,
            path: "/plantspic/" + file.filename,
            time: req.body.month,
            featured: false,
            code: newCount,
            dbType: "bird",
          });

          await pic.save();
          createdPics.push(pic);
          code = await Code.findOneAndUpdate(
            { type: "pic" },
            { $inc: { count: 1 } },
            { new: true },
          );
        }

        return res.json({
          success: true,
          message: "Picture uploaded successfully",
        });
      } else {
        return res
          .status(400)
          .json({ success: false, message: "No files uploaded" });
      }
    } catch (error) {
      await cleanupRecords(Pic, createdPics);
      await cleanupFiles(outputFiles);

      const uploadError = getUploadErrorResponse(error);
      if (uploadError) {
        return res.status(uploadError.status).json(uploadError.body);
      }

      console.error("Bird picture upload failed");
      return res
        .status(500)
        .json({ success: false, message: "Unable to process image upload" });
    } finally {
      await cleanupFiles(inputFiles);
    }
  },
);

app.use(catalogRouter);

app.get("/adminInfo", requireAdmin, async (req, res) => {
  const users = await User.find({}, USER_PUBLIC_PROJECTION);
  const posts = await Post.find({ authorization: true });
  const pics = await Pic.find();
  res.json({
    success: true,
    users: users.map(toPublicUser),
    posts,
    username: req.authenticatedUser.username,
    admin: true,
    pics,
  });
});

app.post("/adminDeleteUser", requireAdmin, async (req, res) => {
  try {
    const userToDelete = await User.findById(req.body.id);

    await User.deleteOne({ _id: userToDelete._id });
    await runtime.deleteSession(userToDelete.username).catch(() => {
      console.warn("Unable to remove deleted user session");
    });

    res.status(200).json({ message: "User deleted successfully" });
  } catch (_) {
    console.warn("Unable to delete user");
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/adminMakeAdminUser", requireAdmin, async (req, res) => {
  try {
    var user = await User.findById(req.body.id);

    user.admin = !user.admin;

    await user.save();

    res.json({ success: true });
  } catch (_) {
    console.warn("Unable to change user role");
    res.status(500).json({ success: false, message: "Server error" });
  }
});

app.post("/makePicFeatured", requireAdmin, async (req, res) => {
  const pic = await Pic.findById(req.body.id);
  pic.featured = !pic.featured;
  await pic.save();
  res.json({ success: true });
});

// app.get("/", function (req, res) {
//   res.redirect("/databasePlant");
//   // res.sendFile(path.join(__dirname, "/guide.html"));
// });

// app.get("/home",function (req,res) {
//   res.sendFile(path.join(__dirname, "/guide.html"));
// });

// app.post("/home",function (req,res) {
//   res.sendFile(path.join(__dirname, "/guide.html"));
// });

// app.post("/", function (req, res) {
//   res.redirect("/databasePlant");
//   // res.sendFile(path.join(__dirname, "/guide.html"));
// });

app.post("/updateText", requireAuth, async function (req, res) {
  const editTextRequest = new EditTextRequest({
    latinName: req.body.latinName,
    chineseName: req.body.chineseName,
    commonName: req.body.commonName,
    location: req.body.location,
    additionalInfo: req.body.additionalInfo,
    link: req.body.link,
    chineseLink: req.body.chineseLink,
    username: req.user?.username,
    otherNames: req.body.otherNames,
    authorization: true,
    originalLatin: req.body.originalLatin,
    editor: req.body.editor,
    // dbType: "plant"
  });

  await editTextRequest.save();
  res.json({ success: true });

  console.log("updated plant successfully")
});

app.post("/birdUpdateText", requireAuth, async function (req, res) {
  const editTextRequest = new BirdEditTextRequest({
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
    originalLatin: req.body.originalLatin,
    editor: req.body.editor,
    dbType: "bird",

    appearance:req.body.appearance,
    songs:req.body.songs,
    diet:req.body.diet,
    habitat:req.body.habitat,
    migration:req.body.migration,
    breeding:req.body.breeding,

    
    juvChar:req.body.juvChar,
    subChar:req.body.subChar,
    mAdultChar:req.body.madultChar,
    fAdultChar:req.body.fadultChar
  });

  await editTextRequest.save();
  res.json({ success: true });
});

app.get("/adminAuth", requireAdmin, async function (req, res) {
  const plantAuthPosts = await EditTextRequest.find();
  const birdAuthPosts = await BirdEditTextRequest.find();
  const authPosts = plantAuthPosts.concat(birdAuthPosts);

  const birdPosts = await BirdPost.find({ authorization: false });
  const plantPosts = await Post.find({ authorization: false });
  const newAuthPosts = plantPosts.concat(birdPosts);

  const newCreationEntries = await creationBottom.find({ auth: false });

  res.json({
    success: true,
    admin: true,
    authPosts,
    newAuthPosts,
    newCreationEntries,
  });
});

app.put("/handleBirdEditDecision", requireAdmin, async function (req, res) {
  try {
    // await BirdEditTextRequest.findByIdAndDelete("6864f3e21f4a1cd7556aabc1")
    // await EditTextRequest.findByIdAndDelete("6864f3e21f4a1cd7556aabc1")
    // const result = await BirdEditTextRequest.deleteMany({})
    // const result = await BirdEditTextRequest.deleteMany({})
    const request = await BirdEditTextRequest.findById(req.body.id);
    if (!request) {
      return res
        .status(404)
        .json({ success: false, message: "Request not found" });
    }

    const originalLatin = request.originalLatin;
    const newLatin = request.latinName;

    if (!req.body.decision) {
      await BirdEditTextRequest.deleteOne({ _id: request._id });
      return res.json({ success: true, message: "request denied" });
    }
    // Update the post first
    const postToEdit = await BirdPost.findOneAndUpdate(

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

          appearance: request.appearance,
          songs: request.songs,
          diet: request.diet,
          habitat: request.habitat,
          migration: request.migration,
          breeding: request.breeding,
          
          juvChar: request.juvChar,
          subChar: request.subChar,
          mAdultChar: request.mAdultChar,
          fAdultChar: request.fAdultChar,
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
      } catch (_) {
        console.warn("Unable to rename related picture");
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
      } catch (_) {
        console.warn("Unable to rename related artwork");
      }
    }

    await BirdEditTextRequest.deleteOne({ _id: request._id });
    return res.json({ success: true, message: "request accepted" });
  } catch (_) {
    console.warn("Unable to review bird edit request");
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

app.put("/handleEditDecision", requireAdmin, async function (req, res) {
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
      } catch (_) {
        console.warn("Unable to rename related picture");
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
      } catch (_) {
        console.warn("Unable to rename related artwork");
      }
    }

    await EditTextRequest.deleteOne({ _id: request._id });
    return res.json({ success: true, message: "request accepted" });
  } catch (_) {
    console.warn("Unable to review plant edit request");
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

app.post(
  "/uploadFeatureSingle",
  requireAdmin,
  uploadWithCleanup,
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
  requireAdmin,
  uploadWithCleanup,
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

app.get("/uploadHome", uploadWithCleanup, async (req, res) => {

  const entries = await FeatureHome.find();
  res.json({ success: true, entries });
});

app.post("/unFeatureHome", requireAdmin, uploadWithCleanup, async (req, res) => {
  try {
    // 使用 _id 来精确删除特定的 feature
    await FeatureHome.deleteOne({ _id: req.body.id });
    const entries = await FeatureHome.find();
    res.json({ success: true, entries });
  } catch (_) {
    console.warn("Unable to remove featured content");
    res.status(500).json({
      success: false,
      message: "Unable to remove featured content",
    });
  }
});

app.get("/uploadCreation", uploadWithCleanup, async (req, res) => {
  const temp = await creationBottom.find({ auth: true });
  res.json({ temp, success: true });
});

app.post("/unFeatureCreation", requireAdmin, uploadWithCleanup, async (req, res) => {
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
  } catch (_) {
    console.warn("Unable to delete creation");
    res.status(500).json({ success: false, message: "plant not deleted" });
  }
});

app.post("/editPageDelete", requireAdmin, async (req, res) => {
  try {
    const pic = await Pic.findOne({ _id: req.body.id });
    await fs.unlink(path.join(__dirname, "public", pic.path));
    await Pic.deleteOne({ _id: req.body.id });
    res.json({ success: true, message: "pic deleted" });
  } catch (_) {
    console.warn("Unable to delete picture");
    res.status(500).json({ success: false, message: "pic not deleted" });
  }
});

app.delete("/editPageDeletePlant", requireAdmin, async (req, res) => {
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
        } catch (_) {
          console.warn("Unable to delete related picture");
        }
      }),
      ...arts.map(async (art) => {
        try {
          await fs.unlink(path.join(__dirname, "public", art.path));
          await Art.deleteOne({ _id: art._id });
        } catch (_) {
          console.warn("Unable to delete related artwork");
        }
      }),
      Post.deleteOne({ _id: req.body.id }),
    ]);

    res.json({
      success: true,
      message: "plant and related data(including pics and arts) deleted",
    });
  } catch (_) {
    console.warn("Unable to delete plant and related media");
    res.status(500).json({ success: false, message: "plant not deleted" });
  }
});

app.use(function (err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  const uploadError = getUploadErrorResponse(err);
  if (uploadError) {
    return res.status(uploadError.status).json(uploadError.body);
  }

  console.error("Unhandled request error");
  return res.status(500).send("Something broke!");
});

module.exports = { app, runtime };

if (require.main === module) {
  require("./server").startServer();
}
