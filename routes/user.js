const { Router } = require("express");
const User = require('../models/user');

const router = Router();

router.get("/signin", (req, res) => {
    return res.render("signin");
});

router.get("/signup", (req, res) => {
    return res.render("signup");
});

router.post("/signin", async (req, res) => {
    const { email, password } = req.body;
    try {
        const token = await User.matchPasswordAndGenerateToken(email, password);
        return res.cookie('token', token).redirect("/");
    } catch (error) {
        return res.render("signin", {
            error: "Incorrect Email or Password",
        });
    }
    /*
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(400).send("User not found");
    }
    const isMatched = await user.matchPassword(password); 
    if (!isMatched) {
        return res.status(400).send("Invalid credentials");
    }
    console.log("token", token);
    */
});

router.post("/signup", async(req,res) => {
    const { fullName, email, password} = req.body;
    await User.create({
        fullName,
        email,
        password,
    });
    return res.redirect("/");
});

router.get("/logout", (req, res) => {
    res.clearCookie("token").redirect("/");
})

module.exports = router;