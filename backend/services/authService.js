import jwt from "jsonwebtoken";
import queriesDB from "../database/queriesDB.js"
import bcrypt from "bcryptjs";

const generateToken = (email) => {
    return jwt.sign({ email }, "biyaHero", { expiresIn: "10d" });
};

export const register = async (req, res) => {
    try {
    const { email, password: rawPassword, confirmedPass, passengerType } = req.body;

    if (!email || !rawPassword || !confirmedPass) {
        return res.status(400).json({ message: "All fields are required" });
    }

    if (rawPassword.length < 6) {
        return res.status(400).json({ message: "Password should be at least 6 characters long" });
    }

    // check if user already exists
    const existingEmail = await queriesDB.checkExistingEmail(email);
    if (existingEmail) {
        return res.status(400).json({ message: "Email already exists!" });
    }

    // check if pass and confirmed pass was the same
    if (rawPassword !== confirmedPass) {
        return res.status(400).json({ message: "Passwords don't match!" });
    }

    // bycrypting password before saving to DB
    const salt = await bcrypt.genSalt(15);
    const password = await bcrypt.hash(rawPassword, salt);
    
    // saving to DB
    await queriesDB.addUser(email, password, passengerType);

    // generating token using email 
    const token = generateToken(email);

    const user = await queriesDB.retrieveIdPassTypeAndTime(email);

    // sending info to client
    res.status(201).json({
        token,
        user: {
        id: user['id'],
        email: email,
        passengerType: passengerType,
        timeStamp: user['timeStamp']
        },
    });
    } catch (error) {
    console.log("Error in register route", error);
    res.status(500).json({ message: "Internal server error" });
    }
};


export const login = async (req, res) => {
    try {
      const { email, password } = req.body;
  
      if (!email || !password) return res.status(400).json({ message: "All fields are required" });
  
      // check if user exists
      const existingEmail = await queriesDB.checkExistingEmail(email);
      if (!existingEmail) {
        return res.status(401).json({ message: "Invalid credentials" });
      };
  
      // check if password was correct
      const hashedPassword = await queriesDB.retrievePassword(email);
      const isCorrectPassword = await bcrypt.compare(password, hashedPassword);
      if (!isCorrectPassword) return res.status(401).json({ message: "Invalid credentials" });
  
      const token = generateToken(email);
  
      const user = await queriesDB.retrieveIdPassTypeAndTime(email);
  
      res.status(200).json({
        token,
        user: {
          id: user['id'],
          email: email,
          passengerType: user['passengerType'],
          timeStamp: user['timeStamp']
        },
      });
    } catch (error) {
      console.log("Error in login route", error);
      res.status(500).json({ message: "Internal server error" });
    }
};