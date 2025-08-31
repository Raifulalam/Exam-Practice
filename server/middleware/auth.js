// middleware/auth.js
const jwt = require("jsonwebtoken");

const auth = (allowedRoles = []) => {
    return (req, res, next) => {
        const authHeader = req.headers["authorization"];
        if (!authHeader) {
            console.error("Auth failed: No Authorization header");
            return res.status(401).json({ msg: "No token, authorization denied" });
        }

        const parts = authHeader.split(" ");
        if (parts.length !== 2 || parts[0] !== "Bearer") {
            console.error("Auth failed: Invalid Authorization format", authHeader);
            return res.status(401).json({ msg: "Token format is invalid" });
        }

        const token = parts[1];
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded; // user info from token

            // Check role if required
            if (allowedRoles.length && !allowedRoles.includes(req.user.role)) {
                console.error("Auth failed: Role not allowed", req.user.role);
                return res.status(403).json({ msg: "Access denied: insufficient role" });
            }

            next(); // all good
        } catch (err) {
            console.error("Auth failed: Token invalid or expired", err.message);
            return res.status(401).json({ msg: "Token is not valid" });
        }
    };
};

module.exports = auth;
