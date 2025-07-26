const express = require("express");
const Product = require("../models/Product.js")
const { errorHandler } = require('../auth.js')

// Add Product
module.exports.addProduct = (req, res) => {

        let newProduct = new Product({
            name : req.body.name,
            description : req.body.description,
            price : req.body.price
        });

        return Product.findOne({name: req.body.name}).then(existingProduct => {

            if(existingProduct){

                return res.status(409).send({ message:'Product already exists' });
            } else{

                return newProduct.save().then(result => res.status(201).send({
                    success: true,
                    message: "Product added successfully",
                    result
                })).catch(error => errorHandler(error, req, res));
            }
        })
        .catch(error => errorHandler(error, req, res));
}; 

// Retrieve All Product
module.exports.getAllProducts = (req, res) => {

    return Product.find({})
    .then(result => {

        if(result.length > 0){

            return res.status(200).send(result);

        } else{

            return res.status(404).send({ message : "No product found"});
        }
    })
    .catch(error => errorHandler(error, req, res));
};

// Retrieve All Active Products
module.exports.getAllActive = (req, res) => {

    return Product.find({ isActive: true })
    .then(result => {
     
        if(result.length > 0){

            return res.status(200).send(result);

        } else{

            return res.status(404).send({message: 'No active products found'});
        }
    })
    .catch(err => errorHandler(err, req, res));

};

// Get Specific Product
module.exports.getSpecificProduct = (req, res) => {

    return Product.findById(req.params.productId)
    .then(product => {

        if(product) {

            return res.status(200).send(product);

        } else {

            return res.status(404).send({message: 'Product not found'});
        }
    })
    .catch(error => errorHandler(error, req, res)); 
};

// Update Product
module.exports.updateProduct = (req, res)=>{

    let updatedProduct = {
    	name: req.body.name,
    	description: req.body.description,
    	price: req.body.price
    };

    return Product.findByIdAndUpdate(req.params.productId, updatedProduct, {new:true})
    .then(product => {

        if (product) {

            res.status(200).send({message : 'Product updated successfully'});

        } else {

            res.status(404).send({message : 'Product not found'});
        }
    })
    .catch(error => errorHandler(error, req, res));
};

// Archive Product
module.exports.archiveProduct = (req, res) => {
  	
  	let archivedProduct = {
  		isActive : false
  	}
    return Product.findByIdAndUpdate(req.params.productId, archivedProduct)
        .then(product => {

            if (product) {

                if (!product.isActive) {

                    return res.status(200).send({message:'Product already archived', archivedProduct:product});
                }

                return res.status(200).send({ success: true, message: 'Product archived successfully'});

            } else {

                return res.status(404).send({message: 'Product not found'});
            }
        })
        .catch(error => errorHandler(error, req, res));
};

// Activate Product
module.exports.activateProduct = (req, res) => {
  
  	let activatedProduct = {
  		isActive : true
  	}

    Product.findByIdAndUpdate(req.params.productId, activatedProduct)
        .then(product => {

            if (product) {
  
                if (product.isActive) {

                    return res.status(200).send({message: 'Product already activated', activateProduct:product});
                }

                return res.status(200).send({success: true, message: 'Product activated successfully'});
                
            } else {

                return res.status(404).send({message: 'Product not found'});
            }
        })
        .catch(error => errorHandler(error, req, res));
};

module.exports.getProduct = (req, res) => {
    return Product.findOne({name: req.body.name})
    .then(product => {
        if(product) {
            return res.status(200).send(product);
        } else {
            return res.status(404).send({message: 'product not found'});
        }
    })
    .catch(error => errorHandler(error, req, res)); 
};

module.exports.productSearchByPrice = async (req, res) => {
    try {
        const { minPrice, maxPrice } = req.body;

        if (minPrice == null || maxPrice == null) {
            return res.status(400).json({ message: 'minPrice and maxPrice are required.' });
        }

        if (minPrice < 0 || maxPrice < 0 || minPrice > maxPrice) {
            return res.status(400).json({ message: 'Invalid price range.' });
        }

        const products = await Product.find({
            price: { $gte: minPrice, $lte: maxPrice },
        });

        res.status(200).json({ products });
    } catch (error) {
        errorHandler(error, req, res);
    }
};