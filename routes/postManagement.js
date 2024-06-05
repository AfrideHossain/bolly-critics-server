const express = require("express");
const router = express.Router();
require("dotenv").config();
const jwt = require("jsonwebtoken");
const { client } = require("../mongoDbConnection");
const verifyJwt = require("../middlewares/verifyjwt");
const { ObjectId } = require("mongodb");
// const verifyJwt = require("../middlewares/verifyjwt");
// mongo db collections
const post_collections = client.db("bolly-critics").collection("posts");
const user_collections = client.db("bolly-critics").collection("users");

router.get("/posts", async (req, res) => {
  try {
    const allPosts = await post_collections.find().toArray();
    if (allPosts.length > 0) {
      return res.send(allPosts);
    } else {
      return res.send("Not found any post");
    }
  } catch (error) {
    return res.status(500).send("internal server error");
  }
});

router.get("/featuredposts", async (req, res) => {
  try {
    const allPosts = await post_collections.find().limit(3).toArray();
    if (allPosts.length > 0) {
      return res.send(allPosts);
    } else {
      return res.send("Not found any post");
    }
  } catch (error) {
    return res.status(500).send("internal server error");
  }
});

router.post("/post", verifyJwt, async (req, res) => {
  let post = req.body;
  post.date = new Date().toDateString();
  try {
    const userInfo = await user_collections.findOne({ email: req.user.email });
    post.author = userInfo?.username;
    const insertPost = await post_collections.insertOne(post);
    if (insertPost.insertedId) {
      return res.send(insertPost);
    } else {
      return res.send("internal server error");
    }
  } catch (error) {
    return res.status(500).send("internal server error");
  }
});

router.put("/post/:id", verifyJwt, async (req, res) => {
  let postId = req.params.id;
  let postBody = req.body;
  try {
    const newPostObj = {};
    for (const key in postBody) {
      if (postBody[key]) {
        newPostObj[key] = postBody[key];
      }
    }
    const updatePost = await post_collections.updateOne(
      { _id: new ObjectId(postId) },
      { $set: newPostObj }
    );
    if (updatePost.modifiedCount > 0) {
      return res.send(updatePost);
    } else {
      return res.send("internal server error");
    }
  } catch (error) {
    return res.status(500).send("internal server error");
  }
});

router.delete("/post/:id", verifyJwt, async (req, res) => {
  let postId = req.params.id;
  try {
    const deletePost = await post_collections.deleteOne({
      _id: new ObjectId(postId),
    });
    return res.send(deletePost);
  } catch (error) {
    return res.status(500).send("internal server error");
  }
});

router.get("/post/:id", async (req, res) => {
  let postId = req.params.id;
  try {
    const postDetails = await post_collections.findOne({
      _id: new ObjectId(postId),
    });
    return res.send(postDetails);
  } catch (error) {
    return res.status(500).send("internal server error");
  }
});

module.exports = router;
