const db = require('../../db');

// M-Pesa Payment Controller
exports.initiateMpesaPayment = async (req, res) => {
  try {
    const { phoneNumber, amount, coins, userId } = req.body;
    
    if (!phoneNumber || !amount || !coins || !userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields' 
      });
    }
    
    // Format phone number to 254 format
    let formattedPhone = phoneNumber.replace(/\s+/g, '');
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '254' + formattedPhone.substring(1);
    }
    
    // Validate phone number
    if (!/^254[17]\d{8}$/.test(formattedPhone)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid phone number format' 
      });
    }
    
    // In production, integrate with M-Pesa API (Daraja API)
    // For now, simulate successful payment
    
    // Create payment record
    const paymentId = Date.now();
    const stmt = db.prepare(`
      INSERT INTO payments (id, user_id, phone_number, amount, coins, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
    `);
    
    stmt.run(paymentId, userId, formattedPhone, amount, coins, 'pending');
    
    // Simulate M-Pesa STK Push
    console.log(`M-Pesa payment initiated: ${formattedPhone} - KSh ${amount} for ${coins} coins`);
    
    // In production, you would:
    // 1. Call M-Pesa Daraja API to initiate STK Push
    // 2. Wait for callback confirmation
    // 3. Update payment status and add coins to user
    
    // For demo purposes, simulate successful payment after 2 seconds
    setTimeout(() => {
      // Update payment status
      const updateStmt = db.prepare(`
        UPDATE payments SET status = 'completed' WHERE id = ?
      `);
      updateStmt.run(paymentId);
      
      // Add coins to user
      const userStmt = db.prepare(`
        UPDATE users SET coins = coins + ? WHERE id = ?
      `);
      userStmt.run(coins, userId);
      
      console.log(`Payment completed: ${coins} coins added to user ${userId}`);
    }, 2000);
    
    res.json({ 
      success: true, 
      message: 'Payment initiated. Please check your phone for M-Pesa prompt.',
      paymentId: paymentId
    });
    
  } catch (error) {
    console.error('M-Pesa payment error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Payment failed. Please try again.' 
    });
  }
};

// Check payment status
exports.checkPaymentStatus = async (req, res) => {
  try {
    const { paymentId } = req.params;
    
    const stmt = db.prepare('SELECT * FROM payments WHERE id = ?');
    const payment = stmt.get(paymentId);
    
    if (!payment) {
      return res.status(404).json({ 
        success: false, 
        message: 'Payment not found' 
      });
    }
    
    res.json({ 
      success: true, 
      payment: payment
    });
    
  } catch (error) {
    console.error('Check payment error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to check payment status' 
    });
  }
};

// Get user's payment history
exports.getPaymentHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const stmt = db.prepare(`
      SELECT * FROM payments 
      WHERE user_id = ? 
      ORDER BY created_at DESC 
      LIMIT 50
    `);
    const payments = stmt.all(userId);
    
    res.json({ 
      success: true, 
      payments: payments
    });
    
  } catch (error) {
    console.error('Get payment history error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get payment history' 
    });
  }
};
