const bcrypt = require("bcrypt");
const User = require("../models/User");
const OTP = require("../models/OTP");
const jwt = require("jsonwebtoken");
const otpGenerator = require("otp-generator");
const mailSender = require("../utils/mailSender");

exports.signup = async (req, res) => {
    try {
        const {firstName , lastName, email, password, confirmPassword,userType} = req.body;

        if(!firstName || !lastName || !email || !password ||!confirmPassword||! !userType){
            return res.status(400).json({msg:"All fields are required"})
        }
        if(password!== confirmPassword){
            return res.status(400).json({msg:"Password and Confirm Password do not match"})
        }
        const existingUser = await User.findOne({email});
        if(existingUser){
            return res.status(400).json({msg:"User already exists"})
        }
        // Find the most recent OTP for the email

    const response = await OTP.find({ email }).sort({ createdAt: -1 }).limit(1);
    console.log(response);
    if (response.length === 0) {
      return res.status(400).json({ error: "Please request for OTP first" });
    } else if (response[0].otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "The OTP is not valid",
      });
    }
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      userType,
    });
    return res.status(200).json({
        success: true,
        user,
        message: "User registered successfully",
      });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
          success: false,
          message: "User cannot be registered. Please try again.",
        });
    }
}

exports.login = async (req, res) => {
    try {
      const { email, password } = req.body;
  
      if (!email || !password) {
        return res.status(400).json({ error: "All fields are required" });
      }
      const user = await User.findOne({ email });
  
      // If user is not found
      if (!user) {
        // Return 401 Unauthorized status code with error message
        return res.status(401).json({
          success: false,
          message: `User is not Registered with Us Please SignUp to Continue`,
        });
      }
      // If user is found, compare the entered password with the password in database
      if (await bcrypt.compare(password, user.password)) {
        // If password is correct, generate a token
        const token = jwt.sign(
          { id: user._id, email: user.email },
          process.env.JWT_SECRET,
          { expiresIn: "24h" }
        );
  
        user.token = token;
        user.password = undefined;
        //  set cookie and for token and retur success response
        const options = {
          expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          httpOnly: true,
        };
        res.cookie("token", token, options).status(200).json({
          success: true,
          message: "User logged in successfully",
          token,
        });
      } else {
        return res.status(401).json({
          success: false,
          message: `Password is incorrect`,
        });
      }
    } catch (error) {
      console.error(error);
      // Return 500 Internal Server Error status code with error message
      return res.status(500).json({
        success: false,
        message: `Login Failure Please Try Again`,
      });
    }
  };
  // Send OTP For Email Verification
exports.sendotp = async (req, res) => {
    try {
      const { email } = req.body
  
      // Check if user is already present
      // Find user with provided email
      const checkUserPresent = await User.findOne({ email })
      // to be used in case of signup
  
      // If user found with provided email
      if (checkUserPresent) {
        // Return 401 Unauthorized status code with error message
        return res.status(401).json({
          success: false,
          message: `User is Already Registered`,
        })
      }
  
      var otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
      })
      const result = await OTP.findOne({ otp: otp })
      console.log("Result is Generate OTP Func")
      console.log("OTP", otp)
      console.log("Result", result)
      while (result) {
        otp = otpGenerator.generate(6, {
          upperCaseAlphabets: false,
          lowerCaseAlphabets: false,
            specialChars: false,
        })
      }
      const otpPayload = { email, otp }
      const otpBody = await OTP.create(otpPayload)
      console.log("OTP Body", otpBody)
      res.status(200).json({
        success: true,
        message: `OTP Sent Successfully`,
        otp,
      })
    } catch (error) {
      console.log(error.message)
      return res.status(500).json({ success: false, error: error.message })
    }
  }
   // Controller for Changing Password
   exports.changePassword = async (req, res) => {
    try {
      // Get user data from req.user
      const userDetails = await User.findById(req.user.id)
  
      // Get old password, new password, and confirm new password from req.body
      const { oldPassword, newPassword } = req.body
  
      // Validate old password
      const isPasswordMatch = await bcrypt.compare(
        oldPassword,
        userDetails.password
      )
      if (!isPasswordMatch) {
        // If old password does not match, return a 401 (Unauthorized) error
        return res
          .status(401)
          .json({ success: false, message: "The password is incorrect" })
      }
  
      // Update password
      const encryptedPassword = await bcrypt.hash(newPassword, 10)
      const updatedUserDetails = await User.findByIdAndUpdate(
        req.user.id,
        { password: encryptedPassword },
        { new: true }
      )
  
      // Send notification email
      try {
        const emailResponse = await mailSender(
          updatedUserDetails.email,
          "Password for your account has been updated",
          
            `Password updated successfully for ${updatedUserDetails.username} `
          
        )
        console.log("Email sent successfully:", emailResponse.response)
      } catch (error) {
        // If there's an error sending the email, log the error and return a 500 (Internal Server Error) error
        console.error("Error occurred while sending email:", error)
        return res.status(500).json({
          success: false,
          message: "Error occurred while sending email",
          error: error.message,
        })
      }
  
      // Return success response
      return res
        .status(200)
        .json({ success: true, message: "Password updated successfully" })
    } catch (error) {
      // If there's an error updating the password, log the error and return a 500 (Internal Server Error) error
      console.error("Error occurred while updating password:", error)
      return res.status(500).json({
        success: false,
        message: "Error occurred while updating password",
        error: error.message,
      })
    }
  }