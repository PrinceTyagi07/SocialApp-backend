// Importing required modules
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const User = require("../models/UserModel");
// Configuring dotenv to load environment variables from .env file
dotenv.config();

// This function is used as middleware to authenticate user requests
exports.auth = async (req, res, next) => {
	try {
		// Extracting JWT from request cookies, body or header
		const token =
			req.cookies.cookie ||
			req.body.cookie ||
			req.header("Authorization").replace("Bearer ", "");

		// If JWT is missing, return 401 Unauthorized response
		if (!token) {
			return res.status(401).json({ success: false, message: `Token Missing` });
		}

		try {
			// Verifying the JWT using the secret key stored in environment variables
			const decode = jwt.verify(token, process.env.JWT_SECRET);
			// Storing the decoded JWT payload in the request object for further use
			req.user = decode;
		} catch (error) {
			// If JWT verification fails, return 401 Unauthorized response
			return res
				.status(401)
				.json({ success: false, message: "token is invalid" });
		}

		// If JWT is valid, move on to the next middleware or request handler
		next();
	} catch (error) {
		// If there is an error during the authentication process, return 401 Unauthorized response
		return res.status(401).json({
			success: false,
			message: `Something Went Wrong While Validating the Token`,
		});
	}
};

exports.isAdmin = async (req, res, next) => {
	try {
		const userDetails = await User.findOne({ email: req.user.email });

		if (userDetails.accountType !== "Admin") {
			return res.status(401).json({
				success: false,
				message: "This is a Protected Route for Admin",
			});
		}
		next();
	} catch (error) {
		return res
			.status(500)
			.json({ success: false, message: `User Role Can't be Verified` });
	}
};

exports.isVisitor = async (req, res, next) => {
	try {
		const userDetails = await User.findOne({ email: req.user.email });

		if (userDetails.accountType !== "Visitor") {
			return res.status(401).json({
				success: false,
				message: "This is a Protected Route for User",
			});
		}
		next();
	} catch (error) {
		return res
			.status(500)
			.json({ success: false, message: `User Role Can't be Verified` });
	}
};

exports.validateSearchParams = (req, res, next) => {
	const { search, page, limit } = req.query;
  
	// Validate search term (optional, but ensure it's a string)
	if (search && typeof search !== "string") {
	  return res.status(400).json({
		success: false,
		message: "Search term must be a string",
	  });
	}
  
	// Validate page (must be a positive integer)
	if (page && (isNaN(page) || parseInt(page) < 1)) {
	  return res.status(400).json({
		success: false,
		message: "Page must be a positive integer",
	  });
	}
  
	// Validate limit (must be a positive integer)
	if (limit && (isNaN(limit) || parseInt(limit) < 1)) {
	  return res.status(400).json({
		success: false,
		message: "Limit must be a positive integer",
	  });
	}
  
	next();
  };
  
