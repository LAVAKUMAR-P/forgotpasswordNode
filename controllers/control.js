import registerSchema from "../models/RegisterSchema.js";
import mongoose from "mongoose";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import bcryptjs from "bcrypt";
import sendEmail from "../utils/Email.js";
import TokenSchema from "../models/token.js";
import crypto from "crypto";
dotenv.config();

/*regiser user */
export const Register = async (req, res) => {
 
  try {
    // connect the database

    let client = await mongoose.connect(process.env.CONNECTION_URL);

    //Hash password
    let salt = bcryptjs.genSaltSync(10);
    let hash = bcryptjs.hashSync(req.body.password, salt);
    req.body.password = hash;

    //make user admin access false
    req.body.admin=false;
    const post = req.body;
    

    //check mail id is alred there or not
    const registerSchemas = await registerSchema.findOne({ email: req.body.email });
   
      if(!registerSchemas){
         //creating schma for data base
    const newPost = new registerSchema(post);

    //save data in database
    await newPost.save();

    // Close the Connection
    await mongoose.disconnect();
    console.log("connection closed");
     return res.status(201).json(newPost);
 }
 await mongoose.disconnect();
 console.log("connection closed");
  return res.status(409).json({
    message: "Emailid is alredy there"
}) 
  } catch (error) {
    console.log(error);
    res.status(409).json({ message: error });
  }
};


/*log in*/

export const Login = async (req, res) => {
 
  try {
    // connect the database

    let client = await mongoose.connect(process.env.CONNECTION_URL);

    //get data from data base
    const registerSchemas = await registerSchema.findOne({ email: req.body.email });
    const check = await registerSchema.find({ email: req.body.email });
   
    

    let user = registerSchemas;
 
    if (user) {
      // Hash the incoming password
      // Compare that password with user's password
  
      let matchPassword = bcryptjs.compareSync(
        req.body.password,
        user.password
      )
      if (matchPassword) {
        // Generate JWT token
        let token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
     
        res.json({
          message: true,
          token,
          unconditional:check[0].admin,
        });
      }
      else {
      
        res.status(401).json({
          message: "Username/Password is incorrect"
      })
       }
    } 
    else {
  
      res.status(401).json({
        message: "Username/Password is incorrect"
    })
     }
    // Close the Connection
    await mongoose.disconnect();
  } catch (error) {
    console.log(error);
    // console.log("mismatch------------------------");
    res.status(401).json({
      message: "Username/Password is incorrect"
  })
  }
};

/*forget password */

export const forgotPassword = async (req, res) => {
 
  try {
    let client = await mongoose.connect(process.env.CONNECTION_URL);
      /*check user is available */
      
      const user = await registerSchema.findOne({ email: req.body.email });
      if (!user)
          return res.status(400).send("user with given email doesn't exist");

      let token = await TokenSchema.findOne({ userId: user._id });

      if (!token) {
          token = await new TokenSchema({
              userId: user._id,
              token: crypto.randomBytes(32).toString("hex"),
          }).save();
      }

      const link = `${process.env.BASE_URL}/password-reset/${user._id}/${token.token}`;
      await sendEmail(user.email, "Password reset",`your rest password link : ${link}` );

      await mongoose.disconnect();
      res.status(200).send("password reset link sent to your email account");
     
      // console.log("connection closed");
  } catch (error) {
      res.status(406).send("An error occured"+error);
      console.log(error);
      await mongoose.disconnect();
      console.log("connection closed****");
  }
};

/*Reset password */

export const resetpassword = async (req, res) => {
  try {
      /*cinect with DB */
      let client = await mongoose.connect(process.env.CONNECTION_URL);

      const user = await registerSchema.findById(req.params.userId);
      if (!user) return res.status(400).send("invalid link or expired");

      const token = await TokenSchema.findOne({
          userId: user._id,
          token: req.params.token,
      });
      if (!token) return res.status(406).send("Invalid link or expired");
          //Hash password
        let salt = bcryptjs.genSaltSync(10);
       let hash = bcryptjs.hashSync(req.body.password, salt);
       req.body.password = hash;

      user.password = req.body.password;
      await user.save();
      await token.delete();

     
      res.status(200).send("password reset sucessfully.");
      await mongoose.disconnect();
     
      console.log("connection closed");
      
  } catch (error) {
    console.log(error+"    "+"reset password");
      res.status(406).send("An error occured");
      // console.log(error);
  }
}