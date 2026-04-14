const Product = require('../models/Product');

// @desc    Fetch all products with optional keyword/category/price filter
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 0; // 0 means no pagination by default

    const keyword = req.query.keyword
      ? {
          name: {
            $regex: req.query.keyword,
            $options: 'i',
          },
        }
      : {};

    const category = req.query.category ? { category: req.query.category } : {};
    const badge = req.query.badge ? { badge: req.query.badge } : {};

    // For price range
    const minPrice = req.query.min ? Number(req.query.min) : 0;
    const maxPrice = req.query.max ? Number(req.query.max) : Number.MAX_SAFE_INTEGER;

    const priceFilter = {
      price: { $gte: minPrice, $lte: maxPrice }
    };

    const filter = { ...keyword, ...category, ...badge, ...priceFilter };

    if (limit > 0) {
      const count = await Product.countDocuments(filter);
      const products = await Product.find(filter)
        .populate('category', 'name')
        .limit(limit)
        .skip(limit * (page - 1));
      
      res.json({
        products,
        page,
        pages: Math.ceil(count / limit),
        totalProducts: count
      });
    } else {
      const products = await Product.find(filter).populate('category', 'name');
      res.json(products);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('category', 'name');
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res) => {
  try {
    const product = new Product({
      name: req.body.name,
      price: req.body.price,
      user: req.user._id,
      image: req.body.image,
      category: req.body.category,
      countInStock: req.body.countInStock,
      description: req.body.description,
      badge: req.body.badge || '',
      specifications: req.body.specifications || {}
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res) => {
  try {
    const { name, price, description, image, category, countInStock, specifications, badge } = req.body;

    const product = await Product.findById(req.params.id);

    if (product) {
      product.name = name !== undefined ? name : product.name;
      product.price = price !== undefined ? price : product.price;
      product.description = description !== undefined ? description : product.description;
      product.image = image !== undefined ? image : product.image;
      product.category = category !== undefined ? category : product.category;
      product.countInStock = countInStock !== undefined ? countInStock : product.countInStock;
      product.specifications = specifications !== undefined ? specifications : product.specifications;
      product.badge = badge !== undefined ? badge : product.badge;

      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      await Product.deleteOne({ _id: product._id });
      res.json({ message: 'Product removed' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete multiple products
// @route   POST /api/products/bulk-delete
// @access  Private/Admin
const deleteProducts = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'Danh sách ID không hợp lệ' });
    }

    const result = await Product.deleteMany({ _id: { $in: ids } });
    res.json({ message: `Đã xóa thành công ${result.deletedCount} sản phẩm` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getProducts, getProductById, createProduct, updateProduct, deleteProduct, deleteProducts };
