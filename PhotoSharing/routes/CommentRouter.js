// filepath: d:\LapTrinhWeb\ThucHanh22_11\PhotoSharing\routes\CommentRouter.js
const express = require("express");
const mongoose = require("mongoose");
const Photo = require("../db/photoModel");
const User = require("../db/userModel");
const requireLogin = require("../middleware/auth");
const router = express.Router();

// Protect routes in this router
router.use(requireLogin);

// POST /api/comment
// body: { photo_id, user_id, comment }
router.post("/", async (req, res) => {
  try {
    // Do not trust client-supplied user_id. Use logged-in user from session.
    const sessionUser = req.session && req.session.user;
    if (!sessionUser || !sessionUser._id) return res.status(401).json({ message: 'Unauthorized' });

    const { photo_id, comment } = req.body || {};
    const user_id = sessionUser._id;

    // Validate inputs
    if (!photo_id || !comment) {
      return res.status(400).json({ message: "photo_id and comment are required" });
    }
    const trimmed = (typeof comment === 'string') ? comment.trim() : '';
    if (!trimmed) return res.status(400).json({ message: "Empty comment not allowed" });

    if (!mongoose.Types.ObjectId.isValid(photo_id)) {
      return res.status(400).json({ message: "Invalid photo_id" });
    }

    const [photo, user] = await Promise.all([
      Photo.findById(photo_id).exec(),
      User.findById(user_id).exec(),
    ]);

    if (!photo) return res.status(400).json({ message: "Photo not found" });
    if (!user) return res.status(400).json({ message: "User not found" });

    // push new comment (store user_id from session)
    photo.comments.push({ comment: trimmed, user_id: user_id });
    await photo.save();

    const newComment = photo.comments[photo.comments.length - 1];
    res.json({
      _id: newComment._id,
      comment: newComment.comment,
      date_time: newComment.date_time,
      user: { _id: user._id, first_name: user.first_name, last_name: user.last_name },
    });
  } catch (err) {
    res.status(500).json({ message: err.toString() });
  }
});

module.exports = router;
