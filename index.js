const express = require("express");
const path = require("path");  
const mongoose = require("mongoose");
const userRoute = require("./routes/user");

const app = express();
const PORT = 8000;

mongoose.connect('mongodb://localhost:27017/blogify')
    .then(() => console.log("MongoDB Connected"))
    .catch((err) => console.log("MongoDB connection error: ", err));

app.set('view engine', 'ejs');
app.set("views", path.resolve("./views"));

app.get("/", (req, res) => {
    res.render("home");
});

app.use(express.urlencoded({extended: false}));

app.use("/user", userRoute);

app.listen(PORT, () => console.log(`Server Started at PORT:${PORT}`));
