const mongoose = require('mongoose');

const uri = "mongodb+srv://acychroni:Aspeq7f7hs!@easeaster.avkuitf.mongodb.net/?retryWrites=true&w=majority";


// define a schema for the "users" collection
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

// create a model for the "users" collection
const UserModel = mongoose.model('User', userSchema);

async function connect() {
  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log('Connected to MongoDB Atlas');
}

async function createUser(userData) {
  try {
    // connect to the MongoDB Atlas database
    await connect();
    console.log('I will create a user with data:', userData);
    
    // create a new user with the provided data
    const user = new UserModel(userData);
    await user.save();
    console.log('New user created:', user);
    return user._id;
  } catch (err) {
    console.error('Error creating user:', err.message);
    return null;
  } finally {
    // disconnect from the MongoDB Atlas database
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB Atlas');
  }
}

async function loginUser(email, password) {
  let user;
  try {
    // connect to the database
    await mongoose.connect(uri);
    console.log('Connected to MongoDB Atlas');

    // find user with matching email and password
    user = await UserModel.findOne({ email, password });
    console.log('Found user:', user);
  } catch (err) {
    console.error('Error finding user:', err.message);
  } finally {
    // disconnect from the database
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB Atlas');
  }
  return user;
}


async function foundUser(email, tax_id) {
  let user;
  try {
    // connect to the database
    await mongoose.connect(uri);
    console.log('Connected to MongoDB Atlas');

    // find user with matching email and password
    user = await UserModel.findOne({ email : email });
    console.log('Found user:', user);
  } catch (err) {
    console.error('Error finding user:', err.message);
  } finally {
    // disconnect from the database
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB Atlas');
  }
  if(user){
    return user;
  }
  else{
    try {
      // connect to the database
      await mongoose.connect(uri);
      console.log('Connected to MongoDB Atlas');
  
      // find user with matching email and password
      user = await UserModel.findOne({ tax_id : tax_id });
      console.log('Found user:', user);
    } catch (err) {
      console.error('Error finding user:', err.message);
    } finally {
      // disconnect from the database
      await mongoose.disconnect();
      console.log('Disconnected from MongoDB Atlas');
    }
  }
  return user;
}

async function registerUser(userData){
  let user = null;
  try {
    // await db.connect();
    const found = await foundUser(userData.email,userData.tax_id);
    if(found){
      return false;
    }
    user = await createUser(userData);
    return user;
  } catch (err) {
    // handle any errors that occur
    console.error(err);
    res.render('error', { error: 'An error occurred' });
  } 
}

module.exports = { connect, createUser, loginUser, registerUser };
