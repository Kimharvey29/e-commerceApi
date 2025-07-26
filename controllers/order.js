const express = require("express");
const User = require("../models/User.js")
const Product = require("../models/Product.js")
const Cart = require("../models/Cart.js")
const Order = require("../models/Order.js")
const { errorHandler } = require('../auth.js')


module.exports.checkoutOrder = async (req, res) => {
  try {
    if (req.user.isAdmin) {
      return res.status(403).json({ message: "Admin is forbidden from performing this action." });
    }

    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart || cart.cartItems.length === 0) {
      return res.status(404).json({ message: "No Items to Checkout." });
    }

    const newOrder = new Order({
      userId: req.user.id,
      items: cart.cartItems,
      totalPrice: cart.totalPrice,
      productsOrdered: cart.cartItems
    });

    // Save the order
    await newOrder.save();

    // Clear the cart
    cart.cartItems = [];
    cart.totalPrice = 0;
    await cart.save();
    res.status(200).json({
      message: "Ordered successfully."
    });
  } catch (error) {
    errorHandler(error, req, res)
  }
};


module.exports.getAllOrders = (req, res) => {

    return Order.find({})
    .then(result => {

        if(result.length > 0){

            return res.status(200).send({order: result});

        } else{

            return res.status(404).send({ message : "No Order found"});
        }
    })
    .catch(error => errorHandler(error, req, res));
};


module.exports.myOrder = (req, res) => {

        if(req.user.isAdmin){

            return res.status(403).send({ message: 'Action Forbidden' })
        } 

        else {

            return Order.findOne({userId:req.user.id}).then(order => {

            return res.status(200).send({ orders : order })

        }).catch(error => errorHandler(error, req, res));
    }
};