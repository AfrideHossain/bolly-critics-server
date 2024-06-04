const express = require("express");
const app = express();
const cors = require("cors");
const { connectMongo } = require("./mongoDbConnection");
require("dotenv").config();
const port = process.env.PORT || 5000;

//call mongodb connection function
connectMongo();

// cors and cors configuration
const corsConfig = {
  origin: "*",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
};
app.use(cors(corsConfig));
app.options("", cors(corsConfig));

//json middleware
app.use(express.json());

// routes
app.get("/", (req, res) => {
  res.send("Bolly-critics going good...");
});

// user route
app.use("/", require("./routes/userManagement"));
// post route
app.use("/", require("./routes/postManagement"));

app.listen(port, () => {
  console.log(`Bolly-critics listening on port ${port}`);
});
