// AdminRouter: handles /admin/login and /admin/logout
const express = require("express");
const User = require("../db/userModel");
const router = express.Router();

// POST /admin/login
// body: { login_name, password }
router.post("/login", async (req, res) => {
  try {
    const { login_name, password } = req.body || {};
    if (!login_name || !password) {
      return res.status(400).json({ message: "login_name and password are required" });
    }
    const user = await User.findOne({ login_name }).exec();
    if (!user) return res.status(400).json({ message: "Login failed: user not found" });
    if (user.password !== password) return res.status(400).json({ message: "Login failed: incorrect password" });

    // store minimal user info in session
    req.session.user = { _id: user._id, first_name: user.first_name, login_name: user.login_name };

    res.json({ _id: user._id, first_name: user.first_name, last_name: user.last_name, login_name: user.login_name });
  } catch (err) {
    res.status(500).json({ message: err.toString() });
  }
});

// POST /admin/logout
// body: {} (empty)
router.post("/logout", (req, res) => {
  if (!req.session || !req.session.user) {
    return res.status(400).json({ message: "Not currently logged in" });
  }
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ message: "Failed to logout" });
    res.json({ message: "Logged out" });
  });
});

// GET /admin/whoami - return current logged in user info or 401
router.get("/whoami", (req, res) => {
  if (req.session && req.session.user) {
    return res.json(req.session.user);
  }
  return res.status(401).json({ message: "Not logged in" });
});

module.exports = router;
