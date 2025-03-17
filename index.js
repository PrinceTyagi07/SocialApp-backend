const express = require('express');
const app = express();
const userRoutes = require("./routes/user_auth");
const profileRoutes = require("./routes/profile");
const contactUsRoute = require("./routes/Contact");
const postRoutes = require("./routes/Post");
const database = require('./dbconfig/database');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { cloudinaryConnect } = require("./dbconfig/cloudinary");
const fileUpload = require("express-fileupload");
const dotenv = require("dotenv");
const Analytics = require("./routes/Analytics");

// // Use cookie-parser middleware
app.use(cookieParser());
require("dotenv").config();

const PORT = process.env.PORT || 3000;
dotenv.config();
// CONNECT THE DATABASE
database.connectwithDb();

// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(
	cors({
		origin: "*",
		credentials: true,
	})
);
app.use(
	fileUpload({
		useTempFiles: true,
		tempFileDir: "/tmp/",
	})
);

// Connecting to cloudinary
cloudinaryConnect();

// Setting up routes
app.use("/api/v1/auth", userRoutes);
app.use("/api/v1/profile", profileRoutes);
app.use("/api/v1/post", postRoutes);
app.use("/api/v1/reach", contactUsRoute);
app.use("/api/v1/analytics", Analytics);


// Testing the server
app.get("/", (req, res) => {
	return res.json({
		success: true,
		message: "Your server is up and running ...",
	});
});

// Listening to the server
app.listen(PORT, () => {
	console.log(`App is listening at ${PORT}`);
});

// End of code.