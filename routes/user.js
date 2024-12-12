const { Router } = require("express");
const User = require('../models/user');

const router = Router();

router.get("/signin", (req, res) => {
    return res.render("signin");
});

router.get("/signup", (req, res) => {
    return res.render("signup");
});

router.post("/signin", async(req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(400).send("User not found");
    }
    const isMatched = await user.matchPassword(password); 
    if (!isMatched) {
        return res.status(400).send("Invalid credentials");
    }
    console.log("User", user);
    return res.redirect("/");
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

module.exports = router;