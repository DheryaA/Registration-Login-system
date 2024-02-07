const mongoose=require('mongoose');
const bcrypt=require('bcryptjs');
const jwt=require('jsonwebtoken');


const employeeSchema=new mongoose.Schema({

Username:{
    type:String,
    required:true
},

Password: {
    type:String,
    required:true
},
ConfirmPassword: {
        type:String,
        required:false
},
tokens:[{
    token:{
        type:String,
        required:true
    }
}]

});

//middleware is working in between the data get save

employeeSchema.methods.generateAuthToken =async function(){
    try{
    const token= jwt.sign({_id:this._id.toString()},process.env.SECRET_KEY);
     this.tokens=this.tokens.concat({token:token})
    await this.save();
     return token;
    }catch(e){
        res.send("the error"+ e);
    }
}



//middleware working before the data get save()
//password hashing and encryption
employeeSchema.pre("save",async function(next){
    if(this.isModified("Password")){
        this.Password=await bcrypt.hash(this.Password,10);
        this.ConfirmPassword=undefined;
    }
    next();
});

//collection creation

const Register=new  mongoose.model("Register",employeeSchema);

module.exports=Register;