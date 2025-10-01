const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { errorHandler } = require("../error/error");

const register = async (req, res, next) => {
  try {
    const { userName, email, password } = req.body;

    // Check if all required fields are filled
    if (!userName || !email || !password) {
      return next(errorHandler(400, "Please fill all fields"));
    }

    // Check if username already exists
    const isUserNameExist = await User.findOne({ userName });
    if (isUserNameExist) {
      return next(errorHandler(409, "User Name already exist"));
    }

    // Check if email already exists
    const isUserEmailExist = await User.findOne({ email });
    if (isUserEmailExist) {
      return next(errorHandler(409, "Email already exist"));
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      userName,
      email,
      password: hashedPassword,
    });

    return res
      .status(201)
      .json({ message: "User created successfully", newUser });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check if all required fields are filled
    if (!email || !password) {
      return next(errorHandler(400, "Please fill all fields"));
    }

    // Check if the user exists
    const user = await User.findOne({ email });
    if (!user) {
      return next(errorHandler(404, "User not found"));
    }

    // Check if the password is correct
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return next(errorHandler(401, "Invalid password"));
    }

    // Generate access token and refresh token
    const accessToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "5m" }
    );

    const refreshToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    // Set cookies for access and refresh tokens
    res.cookie("userAccessToken", accessToken, {
      maxAge: 1000 * 60 * 5, // 5 minutes
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    });

    res.cookie("userRefreshToken", refreshToken, {
      maxAge: 60000 * 60 * 60 * 24 * 7, // 7 days
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
    });

    return res.status(200).json({ message: "Login successful", accessToken });
  } catch (error) {
    next(error);
  }
};

const refreshToken = async (req, res, next) => {
  try {
    let refreshToken = req.cookies.userRefreshToken;

    if (!refreshToken) {
      return next(errorHandler(401, "No refresh token found"));
    }

    // Verify refresh token
    jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (error, user) => {
      if (error) {
        return next(errorHandler(403, "Invalid refresh token"));
      }

      // Generate new access token
      const newAccessToken = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "5m" }
      );

      // Set the new access token in cookies
      res.cookie("userAccessToken", newAccessToken, {
        maxAge: 60000 * 60 * 60 * 24 * 7, // 7 days
        httpOnly: false,
        secure: false,
        sameSite: "strict",
      });

      return res
        .status(200)
        .json({ message: "Token refreshed successfully", newAccessToken });
    });
  } catch (error) {
    next(error);
  }
};

const logOut = async (req, res, next) => {
  try {
    res.cookie("userAccessToken", "", {
      httpOnly: false,
      secure: false,
      sameSite: "Strict",
      expires: new Date(0),
    });

    res.cookie("userRefreshToken", "", {
      httpOnly: true,
      secure: false,
      sameSite: "Strict",
      expires: new Date(0),
    });

    return res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  refreshToken,
  logOut,
};
