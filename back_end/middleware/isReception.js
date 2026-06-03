function isReception(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ message: "User not authenticated" });
  }
  if (req.user.role !== "reception" && req.user.role !== "admin") {
    return res.status(403).json({ message: "Reception access only" });
  }
  next();
}
module.exports = isReception;
