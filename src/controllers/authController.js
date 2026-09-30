const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET || "crm-secret-key";

// =========================
// SIGNUP
// =========================
const signup = async (req, res) => {
  try {
    const { name, password } = req.body;

    if (!name || !password) {
      return res.status(400).json({
        success: false,
        message: "ID and password are required",
      });
    }

    const cleanName = name.trim();

    if (cleanName.length < 3 || cleanName.length > 30) {
      return res.status(400).json({
        success: false,
        message: "ID must be between 3 and 30 characters",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    const existingUser = await User.findOne({
      name: cleanName,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "This ID is already registered",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name: cleanName,
      password: hashedPassword,
    });

    const token = jwt.sign(
      {
        id: user._id,
        name: user.name,
      },
      JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    return res.status(201).json({
      success: true,
      message: "Account created successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "This ID is already registered",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to create account",
    });
  }
};

// =========================
// LOGIN
// =========================
const login = async (req, res) => {
  try {
    const { name, password } = req.body;

    if (!name || !password) {
      return res.status(400).json({
        success: false,
        message: "ID and password are required",
      });
    }

    const cleanName = name.trim();

    const user = await User.findOne({
      name: cleanName,
    }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid ID or password",
      });
    }

    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid ID or password",
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        name: user.name,
      },
      JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    return res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to login",
    });
  }
};

module.exports = {
  signup,
  login,
};