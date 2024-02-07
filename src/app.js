require('dotenv').config();
const express = require('express');
const path = require('path');
const hbs = require('hbs');
const bcrypt=require('bcryptjs');

require("./db/conn");
const Register = require("./modals/registers");
const PORT = process.env.PORT || 3000;
const app = express();

//some important essentials
app.use(express.json());
app.use(express.urlencoded({extended:false}));

//paths
const static_path = path.join(__dirname, "../public");
const template_path = path.join(__dirname, "../templates/views");
const partials_path = path.join(__dirname, "../templates/partials");

//static website serve to the express server
app.use(express.static(static_path));
// set view engine
app.set('view engine', 'hbs');
//views name changed
app.set('views', template_path);
//Register partials
hbs.registerPartials(partials_path);

app.get("/", (req, res) => {
    res.render("register");
});
app.get("/login", (req, res) => {
    res.render("login");
});

//create a new user in our database
app.post("/register", async (req, res) => {
    try {
        const password =req.body.Password;
        const cpassword =req.body.ConfirmPassword;

        if(password===cpassword){
            const registerEmployee =new Register({
                Username:req.body.Username,
                Password:req.body.Password,
                ConfirmPassword:req.body.ConfirmPassword
            });
            //token generation at the registration

            const token =await registerEmployee.generateAuthToken();
            console.log('the token is'+ token);


            const registered= await registerEmployee.save();
            res.status(201).send(registered);
        }else {
            res.send("password does not match")
        }
    } catch (e) {
        res.status(400).send(e);
    }
});

//login page details
app.post("/login", async(req, res) => {
try{

        const Username=req.body.username;
        const Password=req.body.password;

      const user_name=await Register.findOne({Username:Username});
      const isMatch= await bcrypt.compare(Password,user_name.Password);
      //token generation at the login 

      const token =await user_name.generateAuthToken();
            console.log('the token is'+ token);
      
      if(isMatch){
        res.status(201).render("next")
      }else{
        res.send("invalid login");
      }

}catch(e){
    res.status(400).send("invalid login")
}

    
});

app.listen(PORT, () => {
    console.log(`server is responding at ${PORT}`);
});