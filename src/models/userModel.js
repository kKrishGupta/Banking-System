const mongoose = require('mongoose');
const bcrypt =require("bcrypt");

const userSchema = mongoose.Schema({
  email : {
    type:String,
    required:[true,"Email is required for creating user"],
    trim: true,
    lowercase:true,
    match : [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address'],
    unique : [true , "Email already exists"]
  },
  name:{
    type: String,
    required : [true, "Name is required for creating an account"]
  },
  password : {
    type:String,
    required :[true, "Password is required for creating an account"],
    minlength:[8,"password should more than 8 character"],
    select : false,
   match: [
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      'Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one digit, and one special character.'
    ]
  }
},{
    timestamps: true
})

userSchema.pre("save", async function () {
    if(!this.isModified("password")){
      return ;
    }
    const hash = await bcrypt.hash(this.password,10)
    this.password = hash
    return ;
});
userSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password); 
}
const userModel = mongoose.model("user",userSchema);
module.exports = userModel