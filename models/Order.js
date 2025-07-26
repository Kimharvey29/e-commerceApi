const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
        userId: {
            type: String,
            required: [true, 'userId is required']
        },
        productsOrdered:[
            {
                productId:{
                    type: String,
                    required: [true, 'productId is required']
                },
                quantity:{
                    type: Number,
                    required: [true, 'quantity is required']
                },
                subtotal:{
                    type: Number,
                    required: [true, 'subtotal is required']
                }
            }
        ],
        totalPrice: {
            type: Number,
            required: [true, 'Total Price is required']
        },
        orderedOn: {
            type: Date,
            default: Date.now
        },
        status: {
            type: String,
            default: "Pending"
        }
});

module.exports = mongoose.model('Order', orderSchema);