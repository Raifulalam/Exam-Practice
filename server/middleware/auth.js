// middleware/auth.js
const jwt = require("jsonwebtoken");

const auth = (allowedRoles = []) => {
    return (req, res, next) => {
        const authHeader = req.headers["authorization"];
        if (!authHeader) {
            return res.status(401).json({ msg: "No token, authorization denied" });
        }

        const token = authHeader.split(" ")[1]; // Expecting "Bearer token"
        if (!token) {
            return res.status(401).json({ msg: "Token missing" });
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;

            // If specific roles are required
            if (allowedRoles.length > 0 && !allowedRoles.includes(req.user.role)) {
                return res.status(403).json({ msg: "Access denied: insufficient role" });
            }

            next();
        } catch (err) {
            res.status(401).json({ msg: "Token is not valid" });
        }
    };
};

module.exports = auth;
