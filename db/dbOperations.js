const mongoose = require('mongoose');

const uri = "mongodb+srv://acychroni:Aspeq7f7hs!@easeaster.avkuitf.mongodb.net/?retryWrites=true&w=majority";

const collectionPointSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  address: {
    type: String,
  },
  items: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item'
  }]
});

const distributionPointSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  items: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item'
  }]
});


const projectSchema = new mongoose.Schema({
  name: String,
  // Other project properties
  collectionPoint: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CollectionPoint',
    required: false
  },
  distributionPoint: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DistributionPoint',
    required: false
  }
});

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
  tax_id: Number,
  projects: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  }]
});


const itemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  }
});

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  items: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item'
  }]
});

const Item = mongoose.model('Item', itemSchema);
const CollectionPointModel = mongoose.model('CollectionPoint', collectionPointSchema);
const DistributionPointModel = mongoose.model('DistributionPoint', distributionPointSchema);
const ProjectModel = mongoose.model('Project', projectSchema);
const Category = mongoose.model('Category', categorySchema);
// const User = mongoose.model('User', userSchema);



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


// Define a function to retrieve the categories and items
async function getAllCategoriesAndItems() {
  let allItems = [];
  try {
    await connect();    
    const categories = await Category.find().populate('items').exec();
    allItems = categories.map((category) => {
      return {
        name: category.name,
        id: category._id,
        items: category.items.map((item) => {
          return { name: item.name, id: item._id };
        })
      };
    });
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB Atlas');
  } catch (err) {
    console.error('Error finding categories:', err);
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB Atlas');
    throw new Error('Internal server error');
  } finally {
    // disconnect from the MongoDB Atlas database
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB Atlas');
  }
  return allItems;
}


async function createDistributionPoint(DPData){
  try{
    await connect();
    const distributionPoint = new DistributionPointModel(DPData);
    await distributionPoint.save();
    const distributionPointId = distributionPoint._id.toString();
    return distributionPointId;
  }catch (err) {
    console.error('Error creating distributionPoint:', err.message);
    return null;
  } finally {
    // disconnect from the MongoDB Atlas database
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB Atlas');
  }
}

async function createCollectionPoint(CPData ){
  try {
    // connect to the MongoDB Atlas database
    await connect();
    const collectionPoint = new CollectionPointModel(CPData);
    await collectionPoint.save();
    const collectionPointId = collectionPoint._id.toString();
    return collectionPointId;
    }catch (err) {
      console.error('Error creating collectionPoint:', err.message);
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

async function insertProjectToUser(projectId,userId){
  try{
    await connect();
    UserModel.findOneAndUpdate(
      { _id: userId },
      { $push: { projects: projectId } },
      { new: true }
    )
      .then((updatedUser) => {
        console.log(updatedUser);
      })
      .catch((err) => {
        console.error(err);
      });
  }catch (err) {
    console.error('Error adding project to user', err.message);
  } finally {
    // disconnect from the database
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB Atlas');
  }

}

async function createProject(CPData, DPData, name, userId){
  try{
    var cp = await createCollectionPoint(CPData);
    var dp = await createDistributionPoint(DPData);
    var projectData = {
      name: name,
      collectionPoint: cp,
      distributionPoint: dp
    }
    await connect();
    var project = new ProjectModel(projectData);
    await project.save();
    const projectId = project._id.toString();
    await insertProjectToUser(projectId,userId);
  }catch (err) {
    console.error('Error creating project', err.message);
  } finally {
    // disconnect from the database
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB Atlas');
  }
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

module.exports = {createProject, getAllCategoriesAndItems, connect, createUser, loginUser, registerUser };
