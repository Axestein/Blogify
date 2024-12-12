const { Router } = require("express");
const router = Router();
const multer = require('multer');
const path = require('path');
const Blog = require("../models/blog");

const storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, path.resolve(`./public/uploads/`));  
    },
    filename: function(req, file, cb){
        const fileName = `${Date.now()}-${file.originalname}`; 
        cb(null, fileName);
    },
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: function(req, file, cb) {
        const fileTypes = /jpeg|jpg|png|gif/; 
        const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
        const mimeType = fileTypes.test(file.mimetype);

        if (extname && mimeType) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'));
        }
    }
});

router.get('/add-new', (req, res) => {
    return res.render("addBlog", {
        user: req.user,
    });
});
router.post('/', upload.single('coverImage'), async (req, res) => {
    try {
        const { title, body } = req.body;
        if (!title || !body) {
            return res.status(400).send('Title and content are required');
        }

        const blog = await Blog.create({
            body,
            title,
            createdBy: req.user._id,
            coverImageURL: req.file ? `/uploads/${req.file.filename}` : null, // Only save the URL if a file is uploaded
        });

        return res.redirect(`/blog/${blog._id}`);
    } catch (error) {
        console.error(error);
        return res.status(500).send('An error occurred while creating the blog post');
    }
});

module.exports = router;
