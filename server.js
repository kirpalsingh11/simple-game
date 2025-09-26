const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");

// Setup app
const app = express();
app.use(cors());
app.use(bodyParser.json());

// Connect MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/gameUsers", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const UserSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  password: String,
});

const User = mongoose.model("User", UserSchema);

// Register
app.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    const newUser = new User({ username, password });
    await newUser.save();
    res.json({ success: true, message: "User registered" });
  } catch (err) {
    res.json({ success: false, message: "Username already taken" });
  }
});

// Login
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username, password });
  if (user) {
    res.json({ success: true, username });
  } else {
    res.json({ success: false, message: "Invalid login" });
  }
});

app.listen(4000, () => console.log("Server running on http://localhost:4000"));

