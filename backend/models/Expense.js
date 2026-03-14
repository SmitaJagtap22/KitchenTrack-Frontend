const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema({
    title: String,
    amount: Number,
    category: String,
    paymentMethod: {
        type: String,
        enum: ['Cash', 'Online'],
        default: 'Online'
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

module.exports = mongoose.model("Expense", expenseSchema);
