const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({

    userId: {
        type: String,
        required: [true, 'userId is Required']
    },
    cartItems:[
        {   
            productId: {
                type: String,
                required: [true, 'productId is Required']
            },
            productName: {
              type: String,
              required: [true, 'productName is Required']
            },
            productDescription: {
              type: String,
              required: [true, 'productName is Required']
            },
            quantity:{
                type: Number,
                required: [true, 'quantity is Required']
            },
            subtotal:{
                type: Number,
                required: [true, 'subtotal is Required']
            }
        }
    ],
    totalPrice: {
        type: Number,
        required: [true, 'Total Price is Required']
    },
    orderedOn: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Cart', cartSchema);