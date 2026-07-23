const express = require("express");

function createContentRouter({
  Art,
  BirdPost,
  FeatureHome,
  Pic,
  Post,
  creationBottom,
  verifyToken,
}) {
  const router = express.Router();

  router.get("/creationDocumentary", async (req, res) => {
    const allDisplays = await creationBottom.find({ auth: true });

    res.json({ success: true, allDisplays });
  });

  router.get("/userInfo", verifyToken, async (req, res) => {
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

  router.get("/userInfoGlossary", verifyToken, async (req, res) => {
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

  router.get("/userInfoGlossaryBird", verifyToken, async (req, res) => {
    const posts = await BirdPost.find({ authorization: true });
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

  router.post("/getPics", async (req, res) => {
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
    } catch (_) {
      console.warn("Unable to load seasonal pictures");
      res.status(500).json({
        success: false,
        message: "Unable to load seasonal pictures",
      });
    }
  });

  router.get("/getDb2Pic", async (req, res) => {
    const pics = await Pic.aggregate([
      { $sample: { size: 3 } },
      { $project: { path: 1, _id: 0 } },
    ]);
    res.json({ success: true, pics });
  });

  router.get("/getDb2PicBird", async (req, res) => {
    const pics = await Pic.aggregate([
      { $match: {dbType: 'bird' }},
      { $sample: { size: 3 } },
      { $project: { path: 1, _id: 0} },
    ]);
    res.json({ success: true, pics });
  });

  router.get("/db2Alt", async (req, res) => {
    const pic = await Pic.aggregate([
      { $sample: { size: 1 } },
      { $project: { path: 1, _id: 0 } },
    ]);
    if (!pic) {
      res.json({ success: false });
    }
    res.json({ success: true, pic });
  });

  router.get("/db2AltBird", async (req, res) => {
    const pic = await Pic.aggregate([
      { $match: {dbType: 'bird' }},
      { $sample: { size: 1 } },
      { $project: { path: 1, _id: 0} },
    ]);
    if (!pic) {
      res.json({ success: false });
    }
    res.json({ success: true, pic });
  });

  router.post("/getPicsAndArts", async (req, res) => {
    try {
      const pics = await Pic.find({ plant: req.body.plant });
      const arts = await Art.find({ plant: req.body.plant });
      res.json({ success: true, pics, arts });
    } catch (_) {
      console.warn("Unable to load media details");
      res.status(500).json({
        success: false,
        message: "Unable to load media details",
      });
    }
  });

  return router;
}

module.exports = { createContentRouter };
