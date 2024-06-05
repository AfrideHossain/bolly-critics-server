const express = require("express");
const router = express.Router();
require("dotenv").config();
const jwt = require("jsonwebtoken");
const { client } = require("../mongoDbConnection");
const verifyJwt = require("../middlewares/verifyjwt");
const { ObjectId } = require("mongodb");
// const verifyJwt = require("../middlewares/verifyjwt");
// mongo db collections
const user_collections = client.db("bolly-critics").collection("users");

// route 1 : Save user info to db
router.post("/createuser", async (req, res) => {
  const userdata = req.body;
  const user = await user_collections.findOne({ email: userdata.email });
  if (user) {
    return res
      .status(400)
      .json({ newUser: false, message: "User already exists" });
  }

  const insertData = await user_collections.insertOne(userdata);
  return res.send(insertData);
});

// route 2 : sign jwt
router.post("/jwtSign", async (req, res) => {
  let userData = req.body;
  let token = jwt.sign(userData, process.env.JWT_SECRET);
  return res.send({ token });
});

// route 3 : user data
router.get("/user", verifyJwt, async (req, res) => {
  let email = req.user.email;
  let user = await user_collections.findOne({ email });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  return res.send(user);
});
// route 4 : update user data
router.put("/user/:id", verifyJwt, async (req, res) => {
  let id = req.params.id;
  let userInfo = req.body;
  const newUserObj = {};
  for (const key in userInfo) {
    if (userInfo[key]) {
      newUserObj[key] = userInfo[key];
    }
  }
  let updateResult = await user_collections.updateOne(
    { _id: new ObjectId(id) },
    { $set: newUserObj }
  );
  if (updateResult.modifiedCount > 0) {
    return res
      .status(200)
      .send({ success: true, message: "Update Successfully!" });
  } else {
    return res
      .status(400)
      .send({ success: false, message: "No changes detected." });
  }
});

router.get("/featuredusers", async (req, res) => {
  try {
    const featuredUsers = await user_collections
      .find({}, { projection: { avatar: 1, username: 1 } })
      .limit(3)
      .toArray();
    if (featuredUsers.length > 0) {
      return res.send(featuredUsers);
    } else {
      return res.send("Not found any user");
    }
  } catch (error) {
    return res.status(500).send("internal server error");
  }
});

module.exports = router;
