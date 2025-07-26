const express = require("express");
const productController = require('../controllers/product.js');
const { verify, verifyAdmin } = require("../auth.js");

const router = express.Router();

router.post("/", verify, verifyAdmin, productController.addProduct);

router.get("/all", verify, verifyAdmin, productController.getAllProducts);

router.get("/active", productController.getAllActive);

router.get("/:productId", productController.getSpecificProduct);

router.patch("/:productId/update", verify, verifyAdmin, productController.updateProduct);

router.patch("/:productId/archive", verify, verifyAdmin, productController.archiveProduct);

router.patch("/:productId/activate", verify, verifyAdmin, productController.activateProduct);

router.post("/search-by-name", productController.getProduct);

router.post("/search-by-price", productController.productSearchByPrice);

module.exports = router;