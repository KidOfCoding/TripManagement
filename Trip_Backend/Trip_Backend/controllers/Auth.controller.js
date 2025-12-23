import User from "../models/User.model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs"

/* REGISTER */
export const register = async (req, res) => {
  try {
    console.log(req.body);
    
    const { name, email, password } = req.body;
   
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "User already exists" });
    }
        const salt = await bcrypt.genSalt(10) //Can be set from 5 to 15 , higher the number higher the hashing 
        const hashedPassword = await bcrypt.hash(password, salt)
        console.log(hashedPassword);
        const user = await User.create({ name, email, password:hashedPassword });
        console.log(user);
    res.status(201).json({
      success: true,
      message: "User registered successfully"
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* LOGIN */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email })
    console.log(user);
    
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
      const isMatch = await bcrypt.compare(password, user.password)
      console.log(password,isMatch);
      
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
