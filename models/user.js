const { Schema, model } = require('mongoose');
const { createHmac, randomBytes } = require('node:crypto');
const { createTokenForUser } = require('../services/authentication');

const generateSalt = () => randomBytes(16).toString('hex');

const userSchema = new Schema({
    fullName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    salt: {
        type: String,
    },
    password: {
        type: String,
        required: true,
    },
    profileImageURL: {
        type: String,
        default: "/images/default.avif",
    },
    role: {
        type: String,
        enum: ["USER", "ADMIN"],
        default: "USER",
    }
}, { timestamps: true });

userSchema.pre("save", function(next) {
    const user = this;
    if (!user.isModified("password")) return next();

    const salt = generateSalt();
    const hashedPassword = createHmac("sha256", salt).update(user.password).digest("hex");

    this.salt = salt;
    this.password = hashedPassword;

    next();
});

userSchema.static("matchPasswordAndGenerateToken", async function( email, password) {
    const user = await this.findOne({email});
    if(!user) throw new ERROR("User not found!");

    const salt = user.salt;
    const hashedPassword = user.password;
    const userProvidedHash = createHmac("sha256", salt).update(password).digest("hex");

    if(hashedPassword !== userProvidedHash)
        throw new ERROR("Incorrect Password");

    const token = createTokenForUser(user);
    return token;
});

/*
userSchema.methods.matchPassword = async function(password) {
    const user = this;

    const hashedPassword = createHmac("sha256", user.salt).update(password).digest("hex");
    if (hashedPassword !== user.password) {
        throw new Error("Incorrect Password");
    }
    return true; 
};
*/

const User = model("User", userSchema);

module.exports = User;
