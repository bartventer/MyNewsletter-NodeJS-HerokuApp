// jshint esversion:6
// jshint esversion:8

// IMPORTING MODULES
const express = require("express");
const bodyParser = require("body-parser");
const https = require("https");
const mailchimp = require("@mailchimp/mailchimp_marketing");
const dotenv = require("dotenv");

// READING ENVIRONMENT VARIABLES
dotenv.config();


// INITIALISE THE EXPRESS APP
const app = express();
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));


// SETTING UP MAILCHIMP CONNECTION
mailchimp.setConfig({
  apiKey: process.env.API_KEY,
  server: process.env.SERVER,
});
const list_id = process.env.LIST_ID;


//HOME ROUTE GET REQUESTS
app.get("/", function(req, res) {
  res.sendFile(__dirname + "/signup.html");
});


//HOME ROUTE POST REQUESTS
app.post("/", function(req, res) {
  const firstName = req.body.firstName;
  const lastName = req.body.lastName;
  const email = req.body.email;
  const newUser = {
    firstName: firstName,
    lastName: lastName,
    email: email
  };

// SENDING THE NEW USER DETAILS TO MAILCHIMP API
  const run = async () => {
    try {
      const response = await mailchimp.lists.addListMember(list_id, {
        email_address: newUser.email,
        status: "subscribed",
        merge_fields: {
          FNAME: newUser.firstName,
          LNAME: newUser.lastName
        }
      });
      console.log(response);
      res.sendFile(__dirname + "/success.html");
    } catch (err) {
      console.log(err.status);
      res.sendFile(__dirname + "/failure.html");
    }
  };

  run();
});

// FAILURE ROUTE REDIRECT TO HOME PAGE
app.post("/failure", function(req, res) {
  res.redirect("/");
});


//SET UP EXPRESS SERVER TO LISTEN TO CURRENT PORT
const localPort = process.env.LOCAL_PORT;
app.listen(process.env.PORT || localPort, function() {
  console.log("Server is running on port " + localPort);
});
