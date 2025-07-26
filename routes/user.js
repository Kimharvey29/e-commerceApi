const express = require("express");
const userController = require('../controllers/user.js');
const { verify, verifyAdmin } = require("../auth.js");


const router = express.Router();

router.post("/register", userController.registerUser);

router.post("/login", userController.loginUser);

router.get("/details",verify, userController.retrieveUserDetails);

router.patch("/:id/set-as-admin", verify, verifyAdmin, userController.updateUserToAdmin);

router.patch('/update-password', verify, userController.resetPassword);

// router.post('/checkout/:id', verify, userController.createOrder);

// router.get('/retrieve', verify, userController.retrieveUserOrder)

// router.get('/retrieve-all', verify, verifyAdmin, userController.retrieveAllOrders)



// router.patch('/change-product-quantities', verify, userController.changeProductQuantity)

// router.post('/remove-product-from-cart', verify, userController.removeProductfromCart)

// router.put('/clear-cart', verify, userController.clearCart)


module.exports = router;