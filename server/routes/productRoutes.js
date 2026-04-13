const express = require('express');
const router = express.Router();
const { getProducts, getProductById, createProduct, updateProduct, deleteProduct, deleteProducts } = require('../controllers/productController');
const { protect } = require('../middlewares/authMiddleware');
const { admin } = require('../middlewares/adminMiddleware');

router.route('/')
  .get(getProducts)
  .post(protect, admin, createProduct);

// ⚠️ Phải đặt TRƯỚC route /:id để tránh Express hiểu nhầm 'bulk-delete' là một product ID
router.post('/bulk-delete', protect, admin, deleteProducts);

router.route('/:id')
  .get(getProductById)
  .put(protect, admin, updateProduct)
  .delete(protect, admin, deleteProduct);

module.exports = router;
