// routes/protected.js
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");

// Example: both host & player can access
router.get("/dashboard", auth(["host", "player"]), (req, res) => {
    res.json({ msg: `Welcome ${req.user.role} to the dashboard!` });
});

// Example: only hosts can access
router.get("/host-only", auth(["host"]), (req, res) => {
    res.json({ msg: "Host-specific dashboard" });
});

// Example: only players can access
router.get("/player-only", auth(["player"]), (req, res) => {
    res.json({ msg: "Player-specific dashboard" });
});

// ✅ FIX: always call auth() instead of just passing auth
router.get("/me", auth(), (req, res) => {
    res.json({
        id: req.user.id,
        role: req.user.role,
    });
});

module.exports = router;
