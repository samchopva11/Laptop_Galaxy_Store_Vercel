const Order = require('../models/Order');
const Product = require('../models/Product');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const addOrderItems = async (req, res) => {
  try {
    const { orderItems, shippingAddress, paymentMethod } = req.body;

    if (orderItems && orderItems.length === 0) {
      res.status(400).json({ message: 'No order items' });
      return;
    } else {
      // Kiểm tra tồn kho trước khi tạo đơn hàng
      for (const item of orderItems) {
        const product = await Product.findById(item.product);
        if (!product) {
          return res.status(404).json({ message: `Sản phẩm ${item.name} không tồn tại` });
        }
        if (product.countInStock < item.qty) {
          return res.status(400).json({ message: `Sản phẩm ${item.name} đã hết hàng hoặc không đủ số lượng tồn kho` });
        }
      }

      // Calculate prices using the DB price directly ideally, but for simplicity we rely on body
      const itemsPrice = orderItems.reduce((acc, item) => acc + item.price * item.qty, 0);

      const order = new Order({
        orderItems,
        user: req.user._id,
        shippingAddress,
        paymentMethod,
        totalPrice: itemsPrice
      });

      const createdOrder = await order.save();

      // Cập nhật số lượng tồn kho sau khi đặt hàng thành công
      for (const item of orderItems) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { countInStock: -item.qty }
        });
      }

      res.status(201).json(createdOrder);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if (order) {
      res.json(order);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({}).populate('user', 'id name');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      const oldStatus = order.status;
      order.status = req.body.status || order.status;

      if(order.status === 'Đã giao') {
        order.isPaid = true;
        order.paidAt = Date.now();
        order.deliveredAt = Date.now();
      }

      // Logic hoàn kho khi Trả hàng hoặc Đã hủy
      const statusToRefund = ['Trả hàng', 'Đã hủy'];
      if (statusToRefund.includes(order.status) && !statusToRefund.includes(oldStatus)) {
        for (const item of order.orderItems) {
          await Product.findByIdAndUpdate(item.product, {
            $inc: { countInStock: item.qty }
          });
        }
      }

      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { addOrderItems, getOrderById, getMyOrders, getOrders, updateOrderStatus };
