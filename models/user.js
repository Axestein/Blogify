const { Schema, model } = require('mongoose');
const { createHmac, randomBytes } = require('node:crypto');

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

userSchema.methods.matchPassword = async function(password) {
    const user = this;

    const hashedPassword = createHmac("sha256", user.salt).update(password).digest("hex");
    if (hashedPassword !== user.password) {
        throw new Error("Incorrect Password");
    }
    return true; 
};

const User = model("User", userSchema);

module.exports = User;
