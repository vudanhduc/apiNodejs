const mongoose = require("mongoose");
const config = require("../config/config");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user.js");
const { DB_HOST } = require("../config/config");

var tokenTEST ;

// Connect to DB
const db = config.DB_HOST;
mongoose.connect(db, function (err) {
  if (err) {
    console.error("Error! " + err);
  } else {
    console.log("Connected to mongodb");
  }
});

exports.register = async (req, res) => {
  //Hash password
  const salt = await bcrypt.genSalt(10);
  const hasPassword = await bcrypt.hash(req.body.password, salt);

  // Create an user object
  let user = new User({
    email: req.body.email,
    name: req.body.name,
    password: hasPassword,
    user_type_id: req.body.user_type_id,
  });

  // Save User in the database
  user.save((err, data) => {
    if (err) {
      console.log(err);
    } else {
      // create payload then Generate an access token
      let payload = { id: data._id, user_type_id: req.body.user_type_id || 0 };
      const token = jwt.sign(payload, config.TOKEN_SECRET);
    
      res
        .status(200)
        .send({ status: res.statusCode, message: "regester ok", data, token });
    }
  });
};

exports.login = async (req, res) => {
  User.findOne({ email: req.body.email }, async (err, user) => {
    if (err) {
      console.log(err);
    } else {
      if (user) {
        const validPass = await bcrypt.compare(
          req.body.password,
          user.password
        );
        if (!validPass)
          return res.status(401).send("Mobile/Email or Password is wrong");

        // Create and assign token
        let payload = { id: user._id, user_type_id: user.user_type_id };
        const token = jwt.sign(
          payload,
          config.TOKEN_SECRET
          // { expiresIn: 60 * 60 }
        );
        res
          .status(200)
          .header("auth-token", token)
          .send({ status: res.statusCode, message: " token ok",data:user, token: token });
      } else {
        res.status(401).send("Invalid mobile");
      }
    }
  });
};
exports.logintoken= async (req,res)=>{
  
  User.find()
  .then((data) =>
    res.send({
      status: res.statusCode,
      message: "Get All in successfully!!",
      data,
      
    })
  )
  .catch((err) => res.status(400).json("Error: " + err));
 
}


//Access auth users only
exports.userEvent = async (req, res) => {
  User.find()
  .then((data) =>
    res.send({
      status: res.statusCode,
      message: "Get All in successfully!!",
      data,
      
    })
  )
  .catch((err) => res.status(400).json("Error: " + err));
};
exports.adminEvent = async (req, res) => {
  User.find()
  .then((data) =>
    res.send({
      status: res.statusCode,
      message: "Get All in successfully!!",
      data,
      
    })
  )
  .catch((err) => res.status(400).json("Error: " + err));
};
