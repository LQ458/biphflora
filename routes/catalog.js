const express = require("express");
const Post = require("../models/post");
const BirdPost = require("../models/birdPost");
const Pic = require("../models/pic");
const Art = require("../models/art");

const router = express.Router();
const NAME_DIRECTORY_PROJECTION = {
  _id: 1,
  latinName: 1,
  chineseName: 1,
  commonName: 1,
  otherNames: 1,
};
const NAME_DIRECTORY_MODELS = {
  plant: Post,
  bird: BirdPost,
};

function toNameDirectoryEntry(entry) {
  return {
    _id: entry._id,
    latinName: entry.latinName,
    chineseName: entry.chineseName,
    commonName: entry.commonName,
    otherNames: entry.otherNames,
  };
}

router.get("/searchNames", async (req, res) => {
  const posts = await Post.find({ authorization: true });
  if (!posts) {
    res.json({ success: false, returnNames: [], numOfPlants: 0 });
  }
  res.json({ success: true, returnNames: posts, numOfPlants: posts.length });
});

router.get("/searchBirdNames", async (req, res) => {
  const birdPosts = await BirdPost.find({ authorization: true });
  if (!birdPosts) {
    res.json({ success: false, returnNames: [], numOfPlants: 0 });
  }
  res.json({ success: true, returnNames: birdPosts, numOfPlants: birdPosts.length });
});

router.get("/catalog/names", async (req, res) => {
  const { type } = req.query;

  if (type !== "plant" && type !== "bird") {
    return res.status(400).json({
      success: false,
      message: "Type must be either plant or bird",
    });
  }

  try {
    const model = NAME_DIRECTORY_MODELS[type];
    const entries = await model
      .find({ authorization: true }, NAME_DIRECTORY_PROJECTION)
      .lean();

    return res.json({
      success: true,
      type,
      names: entries.map(toNameDirectoryEntry),
    });
  } catch (_) {
    console.error("Unable to load name directory");
    return res.status(500).json({
      success: false,
      message: "Unable to load name directory",
    });
  }
});

router.post("/syncPlantInfo", async (req, res) => {
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

router.post("/syncBirdInfo", async (req, res) => {
  const resultPost = await BirdPost.find({
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

router.get("/numOfPlants", async (req, res) => {
  const posts = await Post.find({ authorization: true });
  var numOfPlants = 0;

  posts.forEach((post) => {
    numOfPlants++;
  });

  res.json({ numOfPlants });
});

router.get("/numOfBirds", async (req, res) => {
  const posts = await BirdPost.find({ authorization: true });
  var numOfPlants = 0;

  posts.forEach((post) => {
    numOfPlants++;
  });

  res.json({ numOfPlants });
});

module.exports = router;
