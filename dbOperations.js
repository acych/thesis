const mongoose = require('mongoose');

const uri="mongodb+srv://acychroni:Aspeq7f7hs!@easeastercluster.fmo34kc.mongodb.net/?retryWrites=true&w=majority";

async function connect(){
    try{
        await mongoose.connect(uri);
        console.log("Connected to mongoDB");
    }catch(error){
        console.error(error);
    }
}


const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  address: String,
  city: String,
  postal_code: Number,
  country: String,
  phone: Number,
  tax_id: Number
});

userObj={
    name: String,
    email: String,
    password: String,
    address: String,
    city: String,
    tax_id: Number,
    postal_code: Number,
    country: String,
    phone: Number,
  }


const UserModel = mongoose.model('User', userSchema);

async function createUser(userData){
// // You also use a model to create queries:
// const userFromDb = await UserModel.findOne({ name: 'Foo' });
// console.log(userFromDb);
    // const userSchema = new mongoose.Schema({ name: String })
    const User = mongoose.model('User', userSchema);

    User.createCollection().then(function(collection) {
    console.log('Collection is created!');
    });


    const userDoc = new UserModel(userData);
    await userDoc.save();

}

async function findUser(query){
    const userFromDb = await UserModel.findOne(query);
    // console.log(userFromDb);
    if(userFromDb){
        return true;
    }
    else{
        return false;
    }
}
async function loginUser(email,password){
    var foundUser = false;
    var user = await UserModel.findOne({email: email, password: password})
    if(user){
        console.log('found ' + user);
        return true;
    }
    else{
        console.log("didn't find");
        return false;
    }
    // .then((user)=>{
    //     if(!user){
    //         console.log("wrong email or password")
    //     }
    //     else{
    //         console.log("found User")
    //         foundUser = true;
    //     }
    // });
    // await return foundUser;
}

module.exports = { connect, createUser, findUser, loginUser};

