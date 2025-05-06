import jwt from "jsonwebtoken";
import queriesBD from "../database/queriesDB.js"

const protectRoute = async (req, res, next) => {
  try {
    // get the token from client's request
    const token = req.header("Auth_Token");
    if (!token) return res.status(401).json({ message: "No authentication token, access denied" });

    // verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // check user if exist in DB
    const user = await queriesBD.checkExistingEmail(decode.email)
    if (!user) return res.status(401).json({ message: "Token is not valid" });
s
    req.user = user;
    next();
  } catch (error) {
    console.error("Authentication error:", error.message);
    res.status(401).json({ message: "Token is not valid" });
  }
};

export default protectRoute;
