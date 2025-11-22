const express = require("express");
const mongoose = require("mongoose");
const User = require("../db/userModel");
const router = express.Router();

// POST /api/user
// body: { first_name, last_name, location?, description?, occupation? }
router.post("/", async (request, response) => {
  try {
    const { first_name, last_name, location, description, occupation } = request.body || {};
    if (!first_name || !last_name) {
      return response.status(400).json({ message: "first_name and last_name are required" });
    }
    const user = new User({ first_name, last_name, location, description, occupation });
    const saved = await user.save();
    // return only the fields the client should see
    response.json({
      _id: saved._id,
      first_name: saved.first_name,
      last_name: saved.last_name,
      location: saved.location,
      description: saved.description,
      occupation: saved.occupation,
    });
  } catch (err) {
    response.status(500).json({ message: err.toString() });
  }
});

// GET /api/user
// returns list of users for sidebar: [{ _id, first_name, last_name }, ...]
router.get("/", async (request, response) => {
  try {
    const users = await User.find({}, "_id first_name last_name").exec();
    response.json(users);
  } catch (err) {
    response.status(500).json({ message: err.toString() });
  }
});

// GET /api/user/list
// same as GET / but matches lab API
router.get("/list", async (req, res) => {
  try {
    const users = await User.find({}, "_id first_name last_name").exec();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.toString() });
  }
});

// GET /api/user/:id
// Returns detailed user {_id, first_name, last_name, location, description, occupation}
router.get("/:id", async (req, res) => {
  const id = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid user id" });
  }
  try {
    const user = await User.findById(id, "_id first_name last_name location description occupation").exec();
    if (!user) return res.status(400).json({ message: "User id not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.toString() });
  }
});

module.exports = router;