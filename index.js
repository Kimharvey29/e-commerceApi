// Dependencies and Modules
const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cors = require('cors');

const userRoutes = require('./routes/user.js'); // userRoutes
const productRoutes = require('./routes/product.js'); // productRoutes
const cartRoutes = require('./routes/cart.js'); // cartRoutes
const orderRoutes = require('./routes/order.js'); 

dotenv.config();

const app = express();

// Database:
mongoose.connect(process.env.MONGODB_STRING);

// Status of the connection:
let db = mongoose.connection;

db.on("error", console.error.bind(console, "Connection Error!"));
db.once("open", ()=> console.log("Now connected to MongoDB Atlas."));


// Middlewares
app.use(express.json());
app.use(express.urlencoded({extended: true}));
// allows all resources to access our backend application:
// app.use(cors());

// costumize the CORS option to meet your specific requirements:

const corsOptions = {
	origin: ['http://localhost:3000', 'https://e-commerce-app-blush-five.vercel.app'],
	// methods: ['GET'] //allow only specified HTTP methods //optional only if you want to restrict methods
	// allowHeaders: ['Content-Type', "Authorization"], //allow specified
	credentials: true, //allow credentials example cookis, authorization headers
	optionsSuccessStatus: 200
}
app.use(cors(corsOptions));

// Backend route for the users request:
app.use("/b2/users", userRoutes);
app.use("/b2/products", productRoutes);
app.use("/b2/cart", cartRoutes);
app.use("/b2/orders", orderRoutes);

// Checking and running server
if(require.main === module){
	app.listen(process.env.PORT || 3000, ()=> {
		console.log(`API is now online on port ${process.env.PORT || 3000}`);
	})
}
module.exports = {app, mongoose};