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

    // debug logs
    console.log('Login: set req.session.user =', req.session.user);
    console.log('Request cookies header:', req.headers.cookie);

    // ensure session is saved before sending response (important when using async stores)
    req.session.save(err => {
      if (err) {
        console.error('Session save error:', err);
        return res.status(500).json({ message: 'Session save failed' });
      }
      // send minimal user info
      res.json({ _id: user._id, first_name: user.first_name, login_name: user.login_name });
    });

  } catch (err) {
    res.status(500).json({ message: err.toString() });
  }
});

// POST /admin/logout
router.post('/logout', (req, res) => {
  if (!req.session || !req.session.user) return res.status(400).json({ message: 'Not logged in' });
  req.session.destroy(err => {
    if (err) return res.status(500).json({ message: 'Logout failed' });
    res.json({ message: 'Logged out' });
  });
});

// GET /admin/whoami - return current logged-in user info (or null if not logged in)
router.get('/whoami', (req, res) => {
  // Trả 200 với null nếu chưa đăng nhập để FE có thể khởi tạo trơn tru
  return res.json(req.session && req.session.user ? req.session.user : null);
});

module.exports = router;
