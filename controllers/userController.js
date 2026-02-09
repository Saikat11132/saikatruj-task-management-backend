const userSchema = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt_token = require('jsonwebtoken');
const helper = require('../helper/index');
const { default: mongoose } = require('mongoose');

exports.register = async (req, res) => {
    try {
        let payload = req.body;
        console.log('payload - ', payload);
        let email = await userSchema.findOne({ email: payload.email });
        console.log('email - ', email);
        if (email) {
            return res.status(409).json(helper.response(409, false, "Email Already Exist!"));
        }
        let hashPassword = await bcrypt.hash(payload.password, 10);

        const newUser =  {
            email: payload.email,
            password: hashPassword,
            name: payload.name,
        }

        let userResult = new userSchema(newUser);

        let user = await userResult.save();
        const token = jwt_token.sign({ userId: user._id}, process.env.JWT_SECRET, {
            // expiresIn: process.env.JWT_EXPIRE,
        });
        if (user) {
            return res.status(201).json(helper.response(201, true, "User Registered Successfully!", { user: user, token: token }));
        }

    } catch (error) {
        return res.status(500).json(helper.response(500, false, "something went wrong!"));
    }
}

exports.login = async (req, res) => {
    try {
        let payload = req.body;
        console.log('payload - ', payload);
        let user = await userSchema.findOne({ email: payload.email });
        console.log('user - ', user);
        if (!user) {
            return res.status(400).json(helper.response(400, false, "User Not Found!"));
        }

        if (!user.isEmailVerified && user.isAdmin === 0) {
            return res.status(403).json(helper.response(403, false, "Please verify your email!", { email: user.email, isEmailVerified: user.isEmailVerified }));
        }

        let comparePassword = await bcrypt.compare(payload.password, user.password);
        if (!comparePassword) {
            return res.status(403).json(helper.response(403, false, "Invalid Password!"));
        }

        // console.log('Expires in - ', process.env.JWT_EXPIRE);

        const token = jwt_token.sign({ userId: user._id, isAdmin: user.isAdmin }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRE,
        });

        // console.log('Token - ', token);

        // Decode the token
        const decodedToken = jwt_token.decode(token);

        // Log the expiration time
        // console.log('Token expires at - ', new Date(decodedToken.exp * 1000));

        let userResult = await userSchema.findById(user._id).select('-password');
        return res.status(200).json(helper.response(200, true, "Login Successfully!", { user: userResult, token: token, tokenExpiresAt: decodedToken.exp }));
    } catch (error) {
        return res.status(500).json(helper.response(500, false, "something went wrong!"));
    }
}

exports.profileUpdate=async (req,res)=>{
	try{
	const userId = req.user.userId
	const {name,email,password} = req.body
	
	let user = await userSchema.findById(new mongoose.Types.ObjectId(userId))
	console.log(user)
	if(name){
	user.name= name
	}
	if(email){
	user.email = email
	}
	
	
	user = await user.save()
	console.log("saved user - ",user)
	return res.status(201).json(helper.response(201 ,true,"user updated successfully", user))

	}catch(err){
	console.log(err)
	return res.status(500).json(helper.response(500 ,true,"Something went wrong", user))	
	}
}


exports.getProfile = async (req, res) => {
    try {
        const userId = req.user.userId;
        let userResult = await userSchema.findById(userId).select('-password');
        return res.status(200).json(helper.response(200, true, "User profile fetched successfully!", { user: userResult }));
    }
    catch (error) {
        return res.status(500).json(helper.response(500, false, "something went wrong!"));
    }
}
    