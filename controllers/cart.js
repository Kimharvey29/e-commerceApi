const express = require("express");
const User = require("../models/User.js")
const Product = require("../models/Product.js")
const Cart = require("../models/Cart.js")
const { errorHandler } = require('../auth.js')

// Get User Cart
module.exports.getUserCart = (req, res) => {

        if(req.user.isAdmin){

            return res.status(403).send({ message: 'Action Forbidden' })
        } 

        else {

            return Cart.findOne({userId:req.user.id})

            .then(cart => {

            return res.status(200).send({ cart : cart })

        }).catch(error => errorHandler(error, req, res));
    }
};

// module.exports.getUserCart = async (req, res) => {
//   try {
//     const cart = await Cart.findOne({ userId: req.user.id })
//       .populate('cartItems.productId', 'name description price') // Populate product details
//       .exec();

//     if (!cart) {
//       return res.status(404).json({ message: 'Cart not found' });
//     }

//     // Transform data if needed
//     const cartWithDetails = {
//       ...cart.toObject(),
//       cartItems: cart.cartItems.map((item) => ({
//         quantity: item.quantity,
//         subtotal: item.quantity * item.productId.price,
//         productId: item.productId._id,
//         productName: item.productId.name,
//         productDescription: item.productId.description,
//       })),
//     };

//     res.json(cartWithDetails);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };



module.exports.addToCart = async (req, res) => {
  try {
    // Extract user ID from the request object (e.g., from middleware)
    const userId = req.user.id;
    const { productId, quantity } = req.body;

    // Validate inputs
    if (!productId || quantity <= 0) {
      return res.status(400).json({ message: "Invalid product ID or quantity." });
    }

    // Check if the product exists and is active
    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(400).json({ message: "Invalid or inactive product." });
    }
    let productName = product.name;
    let productDescription = product.description;
    const subtotal = product.price * quantity;

    // Find or create the user's cart
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({ userId, productName, productDescription, cartItems: [], totalPrice: 0 });
    }
 
    // Check if the product already exists in the cart
    const existingItem = cart.cartItems.find((item) => item.productId === productId);
    if (existingItem) {
      // Update the quantity and subtotal
      existingItem.quantity += quantity;
      existingItem.subtotal += subtotal;
    } else {
      // Add new product to the cart.
      cart.cartItems.push({ productId, productName, productDescription, quantity, subtotal });
    }

    // Recalculate the total price
    cart.totalPrice = cart.cartItems.reduce((total, item) => total + item.subtotal, 0);

    // Save the updated cart
    await cart.save();

    res.status(200).json({ message: "Item added to cart successfully.", cart });
  } catch (error) {
    res.status(500).json({ message: "Internal server error.", error: error.message });
  }
};

module.exports.updateCartQuantity = (req, res) => {
  const userId = req.user.id; // Extract userId from the token
  const { productId, newQuantity } = req.body; // Extract product details from the request body

  // Find the cart by userId
  return Cart.findOne({ userId })
    .then((cart) => {
      if (cart) {
        // Find the product in the cart
        const product = cart.cartItems.find(
          (item) => item.productId.toString() === productId
        );

        if (product) {
          // Update quantity and subtotal
          product.quantity = newQuantity;

          // Recalculate the total price
          cart.totalPrice = cart.cartItems.reduce(
            (total, item) => total + item.subtotal,
            0
          );

          // Save the updated cart
          return cart
            .save()
            .then((updatedCart) => {
              res.status(200).json({
                message: "Product quantity updated successfully",
                cart: updatedCart,
              });
            })
            .catch((err) => errorHandler(err,req,res));
        } else {
          // If the product is not found
          return res.status(404).json({ message: "Item not found in cart" });
        }
      } else {
        // If no cart is found for the user
        return res.status(404).json({ message: "Cart not found for this user" });
      }
    })
    .catch((err) => errorHandler(err,req,res));
};

module.exports.clearAllItems = async (req, res) => {
    try {
        const cart = await Cart.findOne({ userId: req.user.id });
        if (!cart) {
            return res.status(404).send({ message: "Cart not found for the current user" });
        }

        if (cart.cartItems.length === 0) {
            return res.status(400).send({ message: "Cart is already empty" });
        }

        cart.cartItems = [];
        cart.totalPrice = 0; 
        await cart.save();


        return res.status(200).send({
            message: "Cart cleared successfully",
            cart: cart
        });
    } catch (error) {
        return res.status(500).send({
            message: "An error occurred while clearing the cart",
            error: error.message
        });
    }
};

module.exports.removeFromCart = async (req, res) => {
  try {
    // Prevent admin from performing this action
    if (req.user.isAdmin) {
      return res.status(403).json({ message: "Admin is forbidden from performing this action." });
    }

    // Find the user's cart using the user ID from the token
    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found for the current user." });
    }

    // Find the product in the cart's cartItems array
    const productIndex = cart.cartItems.findIndex((item) => item.productId === req.params.productId);
    if (productIndex === -1) {
      return res.status(404).json({ message: "Product not found in cart." });
    }

    // Remove the product and update the total price
    const removedItem = cart.cartItems.splice(productIndex, 1)[0]; // Remove the item
    cart.totalPrice -= removedItem.subtotal; // Update total price

    // Save the updated cart
    await cart.save();

    // Send response with the updated cart
    return res.status(200).json({
      message: "Item removed from cart successfully.",
      updatedCart: cart,
    });
  } catch (error) {
    // Handle errors
    return res.status(500).json({
      message: "An error occurred while removing the item from the cart.",
      error: error.message,
    });
  }
};



