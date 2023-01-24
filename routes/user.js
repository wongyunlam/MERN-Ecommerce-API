const router = require('express').Router();
const User = require('../models/User');
const {
    verifyToken,
    verifyTokenAndAuthorization,
    verifyTokenAndAdmin,
} = require('./verifyToken');

// Update user
router.put('/:id', verifyTokenAndAuthorization, async (req, res) => {
    if (req.body.password) {
        req.body.password = CryptoJS.AES.encrypt(
            req.body.password,
            process.env.PASSWORD_SEC
        ).toString();
    }
    try {
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            {
                $set: req.body,
            },
            { new: true }
        );
        const { password, ...other } = updatedUser._doc;

        res.status(200).json(other);
    } catch (e) {
        console.log('e', e);
        res.status(500).json(e);
    }
});

// Delete
router.delete('/:id', verifyTokenAndAuthorization, async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.status(200).json('User has been deleted.');
    } catch (e) {
        req.status(500).json(e);
    }
});

// Get user
router.get('/find/:id', verifyTokenAndAdmin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        const { password, ...other } = user._doc;

        res.status(200).json(other);
    } catch (e) {
        req.status(500).json(e);
    }
});

// Get all users
router.get('/', verifyTokenAndAdmin, async (req, res) => {
    const number = req.query.number;
    try {
        const users = number
            ? await User.find().sort({ _id: -1 }).limit(number)
            : await User.find();
        const userList = [];
        users.forEach((el) => {
            const { password, ...other } = el._doc;
            userList.push(other);
        });

        res.status(200).json(userList);
    } catch (e) {
        req.status(500).json(e);
    }
});

// Get user stats
router.get('/stats', verifyTokenAndAdmin, async (req, res) => {
    const date = new Date();
    const lastYear = new Date(date.setFullYear(date.getFullYear() - 1));

    try {
        const data = await User.aggregate([
            { $match: { createdAt: { $gte: lastYear } } },
            {
                $project: {
                    month: { $month: '$createdAt' },
                },
            },
            {
                $group: {
                    _id: '$month',
                    total: { $sum: 1 },
                },
            },
        ]);

        res.status(200).json(data);
    } catch (e) {
        res.status(500).json(e);
    }
});

module.exports = router;
