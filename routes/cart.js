const express = require("express");
const cartController = require('../controllers/cart.js');
const { verify, verifyAdmin } = require('../auth.js')

const router = express.Router();

router.get('/get-cart', verify, cartController.getUserCart);

router.post('/add-to-cart', verify, cartController.addToCart);

router.patch('/update-cart-quantity', verify, cartController.updateCartQuantity);

router.patch('/:productId/remove-from-cart', verify, cartController.removeFromCart);

router.put('/clear-cart', verify, cartController.clearAllItems);

module.exports = router;
