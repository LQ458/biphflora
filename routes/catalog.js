const express = require("express");
const Post = require("../models/post");
const BirdPost = require("../models/birdPost");
const Pic = require("../models/pic");
const Art = require("../models/art");

const router = express.Router();

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
