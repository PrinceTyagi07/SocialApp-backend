const cloudinary = require("cloudinary").v2; //! Cloudinary is being required
require("dotenv").config();
exports.cloudinaryConnect = () => {
	try {
		cloudinary.config({
			//    ########   Configuring the Cloudinary to Upload MEDIA ########
			
			cloud_name: process.env.CLOUD_NAME,
			api_key: process.env.API_KEY,
			api_secret: process.env.API_SECRET,
		
			
		});
		// console.log("cloud name ",process.env.CLOUD_NAME);
		// console.log("api key ",process.env.API_KEY);
		// console.log("api secret",process.env.API_SECRET);
	} catch (error) {
		console.log(error);
	}
};
