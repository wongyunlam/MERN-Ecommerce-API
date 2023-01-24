const router = require('express').Router();
const Product = require('../models/Product');
const {
    verifyToken,
    verifyTokenAndAuthorization,
    verifyTokenAndAdmin,
} = require('./verifyToken');

// Create
router.post('/', verifyTokenAndAdmin, async (req, res) => {
    const newProduct = new Product(req.body);

    try {
        const savedProduct = await newProduct.save();
        res.status(200).json(savedProduct);
    } catch (e) {
        res.status(500).json(e);
    }
});

// Update product
router.put('/:id', verifyTokenAndAdmin, async (req, res) => {
    try {
        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            {
                $set: req.body,
            },
            { new: true }
        );
        res.status(200).json(updatedProduct);
    } catch (e) {
        console.log('e', e);
        res.status(500).json(e);
    }
});

// Delete
router.delete('/:id', verifyTokenAndAdmin, async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.status(200).json('Product has been deleted.');
    } catch (e) {
        req.status(500).json(e);
    }
});

// Get product
router.get('/find/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        res.status(200).json(product);
    } catch (e) {
        req.status(500).json(e);
    }
});

// Get products
// TODO : 修改 - [get all users] API 需要按這 API 重做 A20221209
// TODO : 修改 - 多 params 查詢時會只查第一個 params 的條件 (if/else 的問題) A20221209
router.get('/', async (req, res) => {
    const qNumber = req.query.number;
    const qNew = req.query.new;
    const qCategory = req.query.category;
    try {
        let products;
        if (qNew) {
            products = await Product.find().sort({ createdAt: -1 }).limit(5);
        } else if (qNumber) {
            products = await Product.find().limit(qNumber);
        } else if (qCategory) {
            products = await Product.find({
                categories: {
                    $in: [qCategory],
                },
            });
        } else {
            products = await Product.find();
        }

        res.status(200).json(products);
    } catch (e) {
        req.status(500).json(e);
    }
});

module.exports = router;
