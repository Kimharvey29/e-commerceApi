const express = require("express");
const mongoose = require("mongoose");
const User = require("../models/User.js");
const Order = require("../models/Order.js");
const Product = require("../models/Product.js");
const Cart = require("../models/Cart.js")
const bcrypt = require("bcrypt");
const { verify, verifyAdmin, errorHandler, createAccessToken } = require("../auth.js");



// Register New User
module.exports.registerUser = (req, res) => {

    if (!req.body.email.includes("@")){

        return res.status(400).send({error : 'Email invalid'});
    }

    if (req.body.mobileNo.length !== 11){

        return res.status(400).send({error : 'Mobile number invalid'});
    }

    if (req.body.password.length < 8) {

        return res.status(400).send({message: 'Password must be atleast 8 characters'});

    } else {

        let newUser = new User({
            firstName : req.body.firstName,
            lastName : req.body.lastName,
            email : req.body.email,
            mobileNo : req.body.mobileNo,
            password : bcrypt.hashSync(req.body.password, 10)
        })

        return newUser.save()
        .then((result) => res.status(201).send({message: 'Registered successfully'}))
        .catch(error => errorHandler(error, req, res));
    }
};

// User Login
module.exports.loginUser = (req, res) => {

	if(req.body.email.includes('@')){

		return User.findOne({email: req.body.email})
		.then(result => {

			if(result === null){

				return res.status(404).send({error: 'No email found'});
			}

			else{

				const isPasswordCorrect = bcrypt.compareSync(req.body.password, result.password);

				if(isPasswordCorrect){

					return res.status(200).send({ access : createAccessToken(result)})

				} else{

					return res.status(401).send({ error: 'Email and password do not match' });
				}

			}
		})
		.catch(err => errorHandler(err, req, res));

	} else{

		return res.status(400).send({ message: 'Invalid email format' });
	}
}

// Retrieve User Details
module.exports.retrieveUserDetails = (req, res) => {

    return User.findById(req.user.id)
    .select('-password')
    .then(user => {

        if(!user){

            return res.status(404).send({ message: 'User not found' })

        } else{

            return res.status(200).send({ user : user });
        }  
    })
    .catch(error => errorHandler(error, req, res));
};

// Set User as Admin
module.exports.updateUserToAdmin = async (req, res) => {

     try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ message: 'User ID is required.' });
        }

        const user = await User.findById(id);

        if (!user) {

            return res.status(404).json({ error: 'User not found.' });
        }

        user.isAdmin = true;
        const updatedUser = await user.save();

        res.status(200).json({ updatedUser });

    } catch (error){

        res.status(500).json({ error: 'Failed in Find', details: error.message });
    }
};

// Reset User Password
module.exports.resetPassword = async (req, res) => {

  try {
    const { newPassword } = req.body;
    const { id } = req.user;

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await User.findByIdAndUpdate(id, { password: hashedPassword });

    res.status(200).json({ message: 'Password reset successfully' });

  } catch (error) {

        res.status(500).json({ message: 'Internal server error' });
  }
};

// // Create New Order
// module.exports.createOrder = async (req, res) => {

//     try {

//         const { productsOrdered } = req.body;

//         if (req.params.isAdmin) {
//             return res.status(403).send({ message: 'Admins are not allowed to place orders' });
//         }


//         if (!productsOrdered || !Array.isArray(productsOrdered) || productsOrdered.length === 0) {
//             return res.status(400).send({ message: 'Invalid request: productsOrdered must be a non-empty array' });
//         }

//         let totalPrice = 0;
//         const productDetails = [];

//         for (const item of productsOrdered) {
//             if (!item.productId || !item.quantity) {
//                 return res.status(400).send({
//                     message: 'Each product must have a valid productId and quantity',
//                 });
//             }

//             const product = await Product.findById(item.productId);

//             if (!product) {
//                 return res.status(404).send({ message: `Product with ID ${item.productId} not found` });
//             }

//             if (typeof product.price !== 'number' || isNaN(product.price)) {
//                 return res.status(500).send({
//                     message: `Invalid price for product ID ${item.productId}`,
//                 });
//             }


//             const subtotal = product.price * item.quantity;
//             if (isNaN(subtotal)) {
//                 console.error(`Subtotal calculation failed for product ID: ${item.productId}`);
//                 return res.status(500).send({ message: 'Error calculating subtotal' });
//             }

//             totalPrice += subtotal;

//             productDetails.push({
//                 productId: product._id,
//                 quantity: item.quantity,
//                 subtotal,
//             });
//         }

//         // Create a new order
//         const newOrder = new Order({
//             userId: req.user.id,
//             productsOrdered: productDetails,
//             totalPrice,
//         });

//         const savedOrder = await newOrder.save();

//         res.status(201).send({
//             success: true,
//             message: 'Order placed successfully',
//             order: savedOrder,
//         });
//     } catch (error) {
//         errorHandler(error, req, res)
//     }
// };

// // Retrieve User Orders
// module.exports.retrieveUserOrder = (req, res) => {

//     return Order.find({ userId:req.user.id})
//     .then(order => {

//         if(!order){

//             return res.status(403).send({ message: 'User has no placed order' })

//         } else{

//             return res.status(200).send({ order : order });
//         }  
//     })
//     .catch(error => errorHandler(error, req, res));
// };

// module.exports.retrieveAllOrders = (req, res) => {

//         if(!req.user.isAdmin){

//             return res.status(403).send({ message: 'Action Forbidden' })
//         } 

//         else {
//             return Order.find({}).then(orders => {
//             console.log(orders)
//             return res.status(200).send({ order : orders })
//         }).catch(error => errorHandler(error, req, res));
//     }
// };

// Add to Cart
// module.exports.addToCart = async (req, res) => {

//     try {

//         const { productsOrdered } = req.body;

//         if (req.params.isAdmin) {
//             return res.status(403).send({ message: 'Admins are not allowed to place orders' });
//         }


//         if (!productsOrdered || !Array.isArray(productsOrdered) || productsOrdered.length === 0) {
//             return res.status(400).send({ message: 'Invalid request: productsOrdered must be a non-empty array' });
//         }

//         let totalPrice = 0;
//         const productDetails = [];

//         for (const item of productsOrdered) {
//             if (!item.productId || !item.quantity) {
//                 return res.status(400).send({
//                     message: 'Each product must have a valid productId and quantity',
//                 });
//             }

//             const product = await Product.findById(item.productId);

//             if (!product) {
//                 return res.status(404).send({ message: `Product with ID ${item.productId} not found` });
//             }

//             if (typeof product.price !== 'number' || isNaN(product.price)) {
//                 return res.status(500).send({
//                     message: `Invalid price for product ID ${item.productId}`,
//                 });
//             }


//             const subtotal = product.price * item.quantity;
//             if (isNaN(subtotal)) {
//                 console.error(`Subtotal calculation failed for product ID: ${item.productId}`);
//                 return res.status(500).send({ message: 'Error calculating subtotal' });
//             }

//             totalPrice += subtotal;

//             productDetails.push({
//                 productId: product._id,
//                 quantity: item.quantity,
//                 subtotal,
//             });
//         }

//         // Create a new order
//         const newOrder = new Order({
//             userId: req.user.id,
//             productsOrdered: productDetails,
//             totalPrice,
//         });

//         const savedOrder = await newOrder.save();

//         res.status(201).send({
//             success: true,
//             message: 'Order placed successfully',
//             order: savedOrder,
//         });
//     } catch (error) {
//         errorHandler(error, req, res)
//     }
// };

// // Change Product Quantity
// module.exports.changeProductQuantity = async (req, res) => {
//     try {
//         const { userId, isAdmin } = req.body;

//         // Validate input
//         if (!userId || !isAdmin) {
//             return res.status(400).json({ message: 'User ID and updates are required.' });
//         }

//         // Find the user and update
//         const updatedUser = await User.findByIdAndUpdate(
//             userId,
//             { $set: {isAdmin:true} },
//             { new: true, runValidators: true }
//         );

//         if (!updatedUser) {
//             return res.status(404).json({ message: 'User not found.' });
//         }
//         // res.status(200).json({ message: 'User updated as admin successfully.', user: updatedUser });
//         res.status(200).json({ message: 'User updated as admin successfully.'});
//     } catch (error) {
//         res.status(500).json({ message: 'Internal server error.', error: error.message });
//     }
// };

// // Remove a Product from Cart

// module.exports.removeProductfromCart = (req, res) =>

// // Use findByIdAndDelete Method

// // Clear Cart

// module.exports.clearCart = (res, res) =>

// // Use findByIdAndDelete Method