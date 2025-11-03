const jwt = require("jsonwebtoken");

// Middleware to verify token from Authorization header
// module.exports = (req, res, next) => {
//   const token = req.header('Authorization')?.replace('Bearer ', '');
//   if (!token) return res.status(401).json({ msg: 'No token' });

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = decoded;
//     next();
//   } catch (err) {
//     res.status(401).json({ msg: 'Invalid token' });
//   }
// };

// Middleware to verify token from cookie
module.exports = (req, res, next) => {
  try {
    const token = req.cookies?.token;
    if (!token) {
      const error = new Error("No token found");
      error.statusCode = 401;
      error.code = "UNAUTHORIZED";
      throw error;
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      next();
    } catch (error) {
      const err = new Error("Invalid token in cookie");
      err.statusCode = 401;
      err.code = "UNAUTHORIZED";
      next(err);
    }
  } catch (err) {
    next(err);
  }
};
