const userModel = require("../models/userModel");
const jwt = require("jsonwebtoken");
const emailService = require("../services/email.service");

async function authMiddleware(req,res,next){
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1]
  if(!token){
    return res.status(401).json({
      message:"Unauthorized access, token is missing"
    })
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await userModel.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        message: "User not found",
      });
    }

    req.user = user;
    next();
  }catch(err){
    return res.status(401).json({
      message:"Unauthorized access, token is missing"
    })
  }
}

async function authSystemUserMiddleware(req,res,next){
  const token  = req.cookies.token || req.headers.authorization?.split(" ")[1]
  if(!token){
    return res.status(401).json({
      message:"Unauthorised access , token is missing!!"
    })
  }
  try{
    const decoded = jwt.verify(token , process.env.JWT_SECRET);
    const user = await userModel.findById(decoded.userId).select("+systemUser");
    if (!user.systemUser) {

      return res.status(403).json({
        message:"Forbidden access, not a system user"
      })
    }req.user = user;
    return next();
  }
  catch(err){
    return res.status(401).json({
      message : "Unauthorized access, token is invalid!!"
    })
  }
}

module.exports = {
  authMiddleware,
  authSystemUserMiddleware
};

