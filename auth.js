const jwt = require("jsonwebtoken");



module.exports = async (req, res, next) => {
  try {
    //   request token from the authorization header
    const token = await req.headers.authorization.split(" ")[1];

    //checking if the token matches the supposed origin
    const decodedToken = await jwt.verify(token, "RANDOM-TOKEN");

    // retrieving the user details of the logged in user
    const user = await decodedToken;

    // pass the the user details down to the endpoints here
    req.user = user;

    // pass down functionality to the endpoint and confirm
    next();
  } catch (error) {
    res.status(401).json({
      error: new Error("Invalid request!"),
    });
  }
};
