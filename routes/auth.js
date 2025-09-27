const express = require("express");
const { register, login,refreshToken,logOut } = require("../controllers/auth");
const router = express.Router();

router.post("/register",register)
router.post("/login",login)
router.post("/refresh-token",refreshToken)
router.post("/logout",logOut)

module.exports = router;