const express = require("express");
const mongoose = require("mongoose");
const Photo = require("../db/photoModel");
const User = require("../db/userModel");
const requireLogin = require("../middleware/auth");
const router = express.Router();

// Protect all routes in this router
router.use(requireLogin);

// POST /api/photo
// body: { file_name, user_id }
router.post("/", async (request, response) => {
  try {
    const { file_name, user_id } = request.body || {};
    if (!file_name || !user_id) {
      return response.status(400).json({ message: "file_name and user_id are required" });
    }
    if (!mongoose.Types.ObjectId.isValid(user_id)) {
      return response.status(400).json({ message: "Invalid user_id" });
    }
    const user = await User.findById(user_id).select("_id").exec();
    if (!user) return response.status(400).json({ message: "User not found" });

    const photo = new Photo({ file_name, user_id });
    const saved = await photo.save();
    response.json({ _id: saved._id, file_name: saved.file_name, user_id: saved.user_id, date_time: saved.date_time });
  } catch (err) {
    response.status(500).json({ message: err.toString() });
  }
});

// GET /api/photo
// optional query: ?user_id=<id>
router.get("/", async (request, response) => {
  try {
    const { user_id } = request.query || {};
    if (user_id) {
      if (!mongoose.Types.ObjectId.isValid(user_id)) {
        return response.status(400).json({ message: "Invalid user_id" });
      }
      const photos = await Photo.find({ user_id }, "_id user_id file_name date_time comments").exec();
      return response.json(photos);
    }
    const photos = await Photo.find({}, "_id user_id file_name date_time comments").exec();
    response.json(photos);
  } catch (err) {
    response.status(500).json({ message: err.toString() });
  }
});

// GET /api/photo/photosOfUser/:id
// returns photos for user with minimal comment user info
router.get("/photosOfUser/:id", async (req, res) => {
  const id = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid user id" });
  }
  try {
    const user = await User.findById(id).select("_id").exec();
    if (!user) return res.status(400).json({ message: "User id not found" });

    const photos = await Photo.find({ user_id: id }, "_id user_id file_name date_time comments").exec();

    // For each comment, we need to fetch the user minimal info; collect unique user_ids
    const commenterIds = new Set();
    photos.forEach((p) => (p.comments || []).forEach((c) => c.user_id && commenterIds.add(String(c.user_id))));

    const users = {};
    if (commenterIds.size > 0) {
      const ids = Array.from(commenterIds);
      const userDocs = await User.find({ _id: { $in: ids } }, "_id first_name last_name").exec();
      userDocs.forEach((u) => (users[String(u._id)] = { _id: u._id, first_name: u.first_name, last_name: u.last_name }));
    }

    const result = photos.map((p) => ({
      _id: p._id,
      user_id: p.user_id,
      file_name: p.file_name,
      date_time: p.date_time,
      comments: (p.comments || []).map((c) => ({
        _id: c._id,
        comment: c.comment,
        date_time: c.date_time,
        user: users[String(c.user_id)] || null,
      })),
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.toString() });
  }
});

module.exports = router;
