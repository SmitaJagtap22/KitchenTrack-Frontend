const mongoose = require("mongoose");

const saleSchema = new mongoose.Schema({
  amount: Number,
  source: {
    type: String,
    required: false
  },
  paymentMethod: {
    type: String,
    enum: ['Cash', 'Online'],
    default: 'Online'
  },
  payment_source: {
    type: String,
    enum: ['cash', 'online', 'swiggy', 'zomato'],
    required: false // Optional for backward compatibility
  },
  orderId: {
    type: String,
    required: false
  },
  kitchen: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});

// Uniqueness rule for duplicate protection during Excel import
saleSchema.index(
  { orderId: 1, payment_source: 1 },
  { unique: true, partialFilterExpression: { orderId: { $exists: true } } }
);

module.exports = mongoose.model("Sale", saleSchema);
