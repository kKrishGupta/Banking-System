const userModel = require("../models/userModel");
const jwt = require("jsonwebtoken");
const emailService = require("../services/email.service");
const tokenBlackModel = require("../models/blackList.model");

async function authMiddleware(req,res,next){
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1]
  if(!token){
    return res.status(401).json({
      message:"Unauthorized access, token is missing"
    })
  }
 const isBlackListed = await tokenBlackModel.findOne({token})
  if(isBlackListed){
    return res.status(401).json({
      message : "unathorized access, token is invalid"
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
  const isBlackListed = await tokenBlackModel.findOne({token});
 if(isBlackListed){
  return res.status(401).json({
    message:"Unauthorise access, token is invalid!!"
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

