const express = require("express");
const bodyParser = require('body-parser');
const dbConnect = require("./db/dbConnect");
const bcrypt = require("bcrypt");
const User = require("./db/userModel");
const jwt = require("jsonwebtoken");
const auth = require("./auth");


const app = express();

dbConnect();

// Curb Cores Error by adding a header here
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  next();
});


// body parser configuration
app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  // Home reach on successful deployment
app.get("/", (req, res, next) => {
  res.json({ message: "Successful! This is your server response!. You are good to go." });
  next();
});



// User registration route and authentication and  password hashed with bcrypt
app.post("/register", (req, res) => {
  bcrypt.hash(req.body.password, 10)
  .then((hashedPassword) => {
    const user = new User({
      email: req.body.email,
      password: hashedPassword,
    });
     user.save().then((result) => {
       res.status(201)
          .send({
           message: "User created successfully",
           result,
          })
         }).catch((err) => {
           res.status(500).send({
             message: "Error creating User",
             err,
        });
     });
  }).catch((err) => {
    res.status(500).send({
      message: "Password was not hashed successfully",
      err,
    });
  });
});



// User logIn route with authentication from our database user stored details 
app.post("/login", (req, res) => {
  User.findOne({ email: req.body.email })
    .then((user) => {
      bcrypt
        .compare(req.body.password, user.password)
        .then((passwordCheck) => {
          if (!passwordCheck) {
            return res.status(400).send({
              message: "Password does not match",
              err,
            });
          }
          const token = jwt.sign(
            {
              userId: user._id,
              userEmail: user.email,
            },
            "RANDOM-TOKEN",
            { expiresIn: "24h" }
          );
          res.status(200).send({
            message: "Login successful",
            email: user.email,
            token,
          });
        }).catch((err) => {
          res.status(400).send({
            message: "Password does not match",
            err,
          });
        });
      }).catch((err) => {
      res.status(404).send({
        message: "Email not found",
        err,
      });
    });
});


// access the API free with the free-endpoint and no authentication
app.get("/free-route", (req, res) => {
  res.json({message: "You have a free acess anytime."});
});

// only authenticated user can have access to the API with the auth-endpoint 
app.get("/auth-route", auth, (req, res) => {
  res.json({message: "You can have access when you are authorised."});
});

module.exports = app;
