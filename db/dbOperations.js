const mongoose = require('mongoose');

const uri = "mongodb+srv://acychroni:Aspeq7f7hs!@easeaster.avkuitf.mongodb.net/?retryWrites=true&w=majority";

const collectionPointSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  description: {
    type: String,
  },
  address: {
    type: String,
  },
  items: [{
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      required: true
    },
    name: {
      type: String,
      required: true
    }
  }]
});

const distributionPointSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  description: {
    type: String,
  },
  address: {
    type: String,
  },
  items: [{
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Item',
    },
    name: {
      type: String,
      required: true
    }
  }]
});


const projectSchema = new mongoose.Schema({
  name: String,
  // Other project properties
  collectionPoint: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CollectionPoint',
  },
  distributionPoint: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DistributionPoint',
  },
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
    return user;
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


function checkEmptyPoint(obj) {
  if (obj.name === "" && obj.description === "" && obj.address === "" && obj.items.length === 0) {
    return true;
  }
  return false;
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
    return null;
  } finally {
    // disconnect from the database
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB Atlas');
  }
  return user;
}

async function insertProjectToUser(projectId,userId){
  try{
    await mongoose.connect(uri);
    await UserModel.findOneAndUpdate(
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

async function getDistributionPoints() {
  await mongoose.connect(uri);

  // Find all users and populate their projects
  const users = await UserModel.find().populate({
    path: 'projects',
    populate: {
      path: 'distributionPoint',
      model: 'DistributionPoint'
    }
  });

  // Create an array of objects containing users with distribution points and their DPoints
  const usersWithDistributionPoints = [];

  users.forEach(user => {
    const distributionPoints = user.projects.reduce((acc, project) => {
      if (project.distributionPoint) {
        acc.push(project.distributionPoint);
      }
      return acc;
    }, []);

    if (distributionPoints.length > 0) {
      usersWithDistributionPoints.push({
        user: user.toObject(),
        distributionPoints
      });
    }
  });
  return usersWithDistributionPoints;
}

async function getCollectionPoints() {
  await mongoose.connect(uri);

  // Find all users and populate their projects
  const users = await UserModel.find().populate({
    path: 'projects',
    populate: {
      path: 'collectionPoint',
      model: 'CollectionPoint'
    }
  });

  // Create an array of objects containing users with distribution points and their DPoints
  const usersWithCollectionPoints = [];

  users.forEach(user => {
    const collectionPoints = user.projects.reduce((acc, project) => {
      if (project.collectionPoint) {
        acc.push(project.collectionPoint);
      }
      return acc;
    }, []);

    if (collectionPoints.length > 0) {
      usersWithCollectionPoints.push({
        user: user.toObject(),
        collectionPoints
      });
    }
  });
  return usersWithCollectionPoints;
}

async function createProject(CPData, DPData, name, userId){
  try{
    var cp,dp;
    if(!checkEmptyPoint(CPData)){
      cp = await createCollectionPoint(CPData);
    }
    if(!checkEmptyPoint(DPData)){
      dp = await createDistributionPoint(DPData);
    }
    if(cp || dp || name){
      console.log("GOT HERE")
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
  }
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

async function getAllUserProjects(userId) {
  try {
    // connect to the database
    await mongoose.connect(uri);
    console.log('Connected to MongoDB Atlas');

    // find user by id
    const user = await UserModel.findById(userId);
    projects = user.projects;
    var projectArray = [];
    for(project in projects){
      // let id = mongoose.Types.projects[project].toString();

      // console.log(projects[project]);
      const foundProject = await ProjectModel.findById(projects[project]);
      
      if (!foundProject) {
        console.log(`Project not found`);
      } else {
        var pID = foundProject._id;
        var pName = foundProject.name;
        var cPoint = null;
        var dPoint = null;
        if (foundProject.collectionPoint){
          cPoint = await CollectionPointModel.findById(foundProject.collectionPoint);
        }
        if (foundProject.distributionPoint){
          dPoint = await DistributionPointModel.findById(foundProject.distributionPoint);
        }
        var fProject = {
          _id: pID,
          name : pName,
          collectionPoint : cPoint,
          distributionPoint : dPoint
        }
        projectArray.push(fProject);
      }
    }
    return projectArray;
  } catch (err) {
    console.error('Error finding user:', err.message);
  } finally {
    // disconnect from the database
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB Atlas');
  }
}

async function addCollectionPointToProject(collectionPointId, prid) {
  try {
    await mongoose.connect(uri);

    const updatedProject = await ProjectModel.findByIdAndUpdate(
      prid,
      { $set: { collectionPoint: collectionPointId } },
      { new: true }
    );

    if (updatedProject) {
      await updatedProject.save();
      console.log('Collection point added to project:', updatedProject);
    } else {
      console.log('Project not found');
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error adding collection point to project:', error);
  }
}

async function getSelectedItems(type, pointId) {
  let items = [];

  if (type === 'C') {
    await mongoose.connect(uri);
    const collectionPoint = await CollectionPointModel.findById(pointId);
    if (collectionPoint) {
      console.log('Items:', collectionPoint.items);
      items = collectionPoint.items;
    } else {
      console.log('Collection point not found');
    }
  } else if (type === 'D') {
    const distributionPoint = await DistributionPointModel.findById(pointId);
    if (distributionPoint) {
      console.log('Items:', distributionPoint.items);
      items = distributionPoint.items;
    } else {
      console.log('Distribution point not found');
    }
  }

  return items;
}

async function closeCollectionPoint(projectId){

  let collectionPointId; // Variable to store the ID of the collection point
  await mongoose.connect(uri);

  await ProjectModel.findById(projectId)
    .then(project => {
      if (project) {
        // Store the collectionPoint ID
        collectionPointId = project.collectionPoint;
  
        // Update the project's collectionPoint to null
        project.collectionPoint = null;
        return project.save();
      } else {
        throw new Error('Project not found');
      }
    })
    .then(updatedProject => {
      console.log('Project updated:', updatedProject);
  
      // Delete the collectionPoint from CollectionPointModel
      return CollectionPointModel.findByIdAndDelete(collectionPointId);
    })
    .then(deletedCollectionPoint => {
      if (deletedCollectionPoint) {
        console.log('Collection point deleted:', deletedCollectionPoint);
      } else {
        console.log('Collection point not found');
      }
    })
    .catch(error => {
      console.error('Error:', error);
    });
  
}


async function addDistributionPointToProject(distributionPointId, prid) {
  try {
    await mongoose.connect(uri);

    const updatedProject = await ProjectModel.findByIdAndUpdate(
      prid,
      { $set: { distributionPoint: distributionPointId } },
      { new: true }
    );

    if (updatedProject) {
      await updatedProject.save();
      console.log('Distribution point added to project:', updatedProject);
    } else {
      console.log('Project not found');
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error adding collection point to project:', error);
  }
}

async function addCollectionPoint(CPData,prid){
  try{
    var cp;
    if(!checkEmptyPoint(CPData)){
      cp = await createCollectionPoint(CPData);
    }
    if(cp){
      await addCollectionPointToProject(cp, prid);
    }
  }catch (err) {
    console.error('Error creating project', err.message);
  } finally {
    // disconnect from the database
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB Atlas');
  }
}

async function addDistributionPoint(DPData,prid){
  try{
    var cp;
    if(!checkEmptyPoint(DPData)){
      dp = await createDistributionPoint(DPData);
    }
    if(dp){
      console.log("DP ID IS "+dp)
      await addDistributionPointToProject(dp, prid);
    }
  }catch (err) {
    console.error('Error creating project', err.message);
  } finally {
    // disconnect from the database
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB Atlas');
  }
}


module.exports = {closeCollectionPoint, getSelectedItems, addDistributionPoint, addCollectionPoint, getCollectionPoints, getDistributionPoints, getAllUserProjects, createProject, getAllCategoriesAndItems, connect, createUser, loginUser, registerUser };
