const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Transaction = require('../models/Transaction');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Create Razorpay Order
router.post('/create-order', authMiddleware, async (req, res) => {
  try {
    const { amount, customerEmail, customerPhone, billId } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid amount' 
      });
    }
    
    const options = {
      amount: Math.round(amount * 100), // Convert to paise
      currency: 'INR',
      receipt: billId || `receipt_${Date.now()}`,
      customer_notify: 1,
      notes: {
        userId: req.user.id,
        email: customerEmail
      }
    };
    
    const order = await razorpay.orders.create(options);
    
    res.json({ 
      success: true, 
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt
      }
    });
  } catch (error) {
    console.error('Razorpay Order Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create order: ' + error.message 
    });
  }
});

// Verify Payment Signature
router.post('/verify-payment', authMiddleware, async (req, res) => {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      billId,
      customerName,
      customerEmail,
      customerPhone,
      items,
      subtotal,
      discount,
      taxRate,
      taxAmount,
      totalAmount
    } = req.body;
    
    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');
    
    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ 
        success: false, 
        message: 'Payment verification failed' 
      });
    }
    
    // Create transaction
    const transaction = new Transaction({
      billId,
      customerName,
      customerEmail,
      customerPhone,
      items,
      subtotal,
      discount,
      taxRate,
      taxAmount,
      totalAmount,
      paymentMethod: 'razorpay',
      status: 'paid',
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      createdBy: req.user.id
    });
    
    await transaction.save();
    
    res.json({ 
      success: true, 
      message: 'Payment verified and transaction created',
      data: transaction
    });
  } catch (error) {
    console.error('Payment Verification Error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Get Payment Details
router.get('/order/:orderId', authMiddleware, async (req, res) => {
  try {
    const order = await razorpay.orders.fetch(req.params.orderId);
    res.json({ 
      success: true, 
      data: order 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

module.exports = router;
