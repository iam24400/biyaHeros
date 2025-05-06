import jwt from "jsonwebtoken";
import queriesDB from "../database/queriesDB.js"
import bcrypt from "bcryptjs";

const generateToken = (email) => {
    return jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "10d" });
  };

export const register = async (req, res) => {
    try {
    const { email, password, confirmedPass, passengerType } = req.body;

    if (!email || !password || !confirmedPass) {
        return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
        return res.status(400).json({ message: "Password should be at least 6 characters long" });
    }

    // check if user already exists
    const existingEmail = await queriesDB.checkExistingEmail(email);
    if (email == existingEmail) {
        return res.status(400).json({ message: "Email already exists!" });
    }

    // check if pass and confirmed pass was the same
    if (password == confirmedPass) {
        return res.status(400).json({ message: "Password doesnt matched!" });
    }

    // bycrypting password before saving to DB
    const salt = await bcrypt.genSalt(15);
    password = await bcrypt.hash(password, salt);
    
    // saving to DB
    queriesDB.addUser (email, password, passengerType)

    // generating token using email 
    const token = generateToken(email);

    const user = queriesDB.retrievePassTypeAndTime(email);

    // sending info to client
    res.status(201).json({
        token,
        user: {
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
  
      // check if user already exists
      const existingEmail = await queriesDB.checkExistingEmail(email);
      if (email == existingEmail) {
        return res.status(400).json({ message: "Invalid credentials" });
      };
  
      // check if password was correct
      const isCorrectPassword = bcrypt.compare(password, queriesDB.retrievePassword(email));
      if (!isCorrectPassword) return res.status(400).json({ message: "Invalid credentials" });
  
      const token = generateToken(email);
  
      const user = queriesDB.retrievePassTypeAndTime(email);
  
      res.status(201).json({
        token,
        user: {
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