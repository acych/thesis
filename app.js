const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const db = require("./db/dbOperations");
const { isObjectIdOrHexString } = require('mongoose');

const app = express();


app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

app.use(session({
    secret: 'mysecret',
    resave: false,
    saveUninitialized: true
}));


app.set('view engine', 'ejs')

app.get('/', (req,res)=>{
    const variables = {
        title: 'CONTINUE AS',
        option1: 'INDIVIDUAL',
        option1Next: '/individual',
        image1: './img/choices/individual.png',
        option2: 'ORGANIZATION',
        option2Next: '/organization',
        image2: './img/choices/organization.png',
        user: req.session.user
    }
    res.render('index',{variables:variables})
})

app.get('/individual', (req,res)=>{
    const variables = {
        title: 'I WANT TO',
        option1: 'FIND',
        option1Next: '/find',
        image1: './img/choices/find.png',
        option2: 'OFFER',
        option2Next: '/offer',
        image2: './img/choices/offer.png',
        user: req.session.user,
        breadcrumb: 'Individual'
    }
    res.render('index',{variables:variables});
})

app.get('/organization',(req,res)=>{
    if(req.session.user){
        res.redirect('/projects')
        // res.render('index',{variables:req.session.variables});
    }
    else{
        res.redirect('/login');
    }
})

app.get('/login', (req,res)=>{
    res.render('login',{});
})



app.post('/login', async function(req, res) {
const { email, password } = req.body;
try {
    await db.connect();
    const user = await db.loginUser(email, password); // call findUser to get the user
    if (user) {
    // user found, set session data or JWT and redirect to dashboard
    req.session.user = user;
    res.redirect('/organization');
    } else {
        // user not found, render error message
        res.render('login', { error: 'Invalid email or password' });
    }
} catch (err) {
    // handle any errors that occur
    console.error(err);
    res.render('error', { error: 'An error occurred' });
} 
});
  
app.get('/logout',(req,res)=>{
    req.session.destroy(function(err) {
        if (err) {
          console.error('Error destroying session:', err);
        } else {
          res.redirect('/');
        }
      });
})

app.get('/projects',async (req,res)=>{
    // let user = req.session.user;
    if(req.session.user.projects.length<=0){
        res.render("project");
    }
    else{

            var projects = await db.getAllUserProjects(req.session.user);
            // console.log(projects)
            res.render('projects',{projects:projects});
    }
})

function createCLocation(req){
    let location= "";
    if(req.body.collectionAddress){
        location+=req.body.collectionAddress;
    }
    if(req.body.collectionCity){
        if(location!==""){
            location+=", ";
        }
        location+=req.body.collectionCity
    }
    if(req.body.collectionPostalCode){
        if(location!==""){
            location+=", ";
        }
        location+=req.body.collectionPostalCode;
    }
    if(req.body.collectionArea){
        if(location!==""){
            location+=", ";
        }
        location+=req.body.collectionArea;
    }
    if(req.body.collectionCountry){
        if(location!==""){
            location+=", ";
        }
        location+=req.body.collectionCountry;
    }
    return location;
}

function createDLocation(req){
    let location = "";
    if(req.body.distributionAddress){
        location+= req.body.distributionAddress;
    }
    if(req.body.distributionCity){
        if(location!=""){
            location+=", ";
        }
        location+= req.body.distributionCity;
    }
    if(req.body.distributionPostalCode){
        if(location!=""){
            location+=", ";
        }
        location+= req.body.distributionPostalCode;
    }
    if(req.body.distributionArea){
        if(location!=""){
            location+=", ";
        }
        location+=req.body.distributionArea;
    }
    if(req.body.distibutionCountry){
        if(location!=""){
            location+=", ";
        }
        location+=req.body.distibutionCountry;
    }
    return location;
}

app.get('/new-project', async (req, res) => {
    try {
        const allItems = await db.getAllCategoriesAndItems();
        res.render('newProject', { allItems:allItems });
    } catch (err) {
        console.error('Error retrieving all items:', err);
        res.status(500).send('Internal server error');
    }
});

app.post('/new-project', async (req,res)=>{
    var collectionItems = [];
    var distributionItems = [];
    if (req.body.collection) {
        collectionItems = req.body.collection.map(value => {
            const item = JSON.parse(value);
            return { itemId: item.id, name: item.name };
          });
      }
      var cName = "";
      if(req.body.collectionName){
        cName = req.body.collectionName;
      }
      var cDescription = "";
      if(req.body.collectionDescription){
        cDescription = req.body.collectionDescription;
      }
    var collectionPoint = {
        name: cName,
        description: cDescription,
        address: createCLocation(req),
        items: collectionItems
    }
    var dName = "";
    if(req.body.distributionName){
      dName = req.body.distributionName;
    }
    var dDescription = "";
    if(req.body.distirbutionDescription){
      dDescription = req.body.distirbutionDescription;
    }

    if (req.body.distribution) {
    distributionItems = req.body.distribution.map(value => {
        const item = JSON.parse(value);
        return { itemId: item.id, name: item.name };
        });
    }

    var distributionPoint = {
    name: dName,
    description: dDescription,
    address: createDLocation(req),
    items: distributionItems
    }
    try {
        await db.createProject(collectionPoint,distributionPoint,req.body.pName,req.session.user._id);
        res.redirect('/projects');
    }catch (err) {
        console.error('Error creating project:', err);
        res.status(500).send('Internal server error');
    }
})

app.get('/register', (req,res)=>{
    res.render('register',{});
})
app.post('/register', async function(req,res){
    if(req.body.password!==req.body.validPassword){
        res.render('register', { error: "Passwords don't match" });
    }
    else{
       let userData = {
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        address: req.body.address,
        city: req.body.city,
        postal_code: req.body.postal_code,
        country: req.body.country,
        phone: req.body.phone,
        tax_id: req.body.taxID,
        projects: []
       } 
       try{
        await db.connect();
        const user = await db.registerUser(userData);
        req.session.user = user;
        res.redirect('/projects');
       }
       catch (err) {
        // handle any errors that occur
        console.error(err);
        res.render('error', { error: 'An error occurred' });
    } 
    }
});

app.get('/find', async function(req,res){
    const UDPoints = await db.getDistributionPoints();
    res.render('points',{title:'Find',points:UDPoints,type:'D'});
})

app.get('/offer',async function(req,res){
    const UCPoints = await db.getCollectionPoints();
    res.render('points',{title:'Offer',points:UCPoints,type:'C'});
})

app.get('/add-collection-point', async function(req,res){
    req.session.projectId = req.query.prid;
    req.session.type = 'C';
    res.redirect('/add-point')
})

app.get('/delete-project', async function(req,res){
    projectId = req.query.prId;
    await db.closeDistributionPoint(projectId);
    await db.closeCollectionPoint(projectId);
    await db.deleteProject(projectId,req.session.user);
    res.redirect('/projects');
})

app.get('/add-distribution-point', function(req,res){
    req.session.projectId = req.query.prid;
    req.session.type = 'D';
    res.redirect('/add-point')
})

app.get('/add-point',async function(req,res){
    const allItems = await db.getAllCategoriesAndItems();
    if(req.session.type=='C'){
        res.render('addCollectionPoint',{projectId:req.session.projectId,items:allItems});
    }
    else if(req.session.type=='D'){
        res.render('addDistributionPoint',{projectId:req.session.projectId,items:allItems});
    }
})

app.post("/add-collection-point", async function(req,res){
    var collectionItems = [];
    if (req.body.collection) {
        collectionItems = req.body.collection.map(value => {
            const item = JSON.parse(value);
            return { itemId: item.id, name: item.name };
          });
      }
      var cName = "";
      if(req.body.collectionName){
        cName = req.body.collectionName;
      }
      var cDescription = "";
      if(req.body.collectionDescription){
        cDescription = req.body.collectionDescription;
      }
    var collectionPoint = {
        name: cName,
        description: cDescription,
        address: createCLocation(req),
        items: collectionItems
    }
    try {
        await db.addCollectionPoint(collectionPoint,req.session.projectId);
        res.redirect('/projects');
    }catch (err) {
        console.error('Error creating project:', err);
        res.status(500).send('Internal server error');
    }
})

app.post("/add-distribution-point", async function(req,res){
    var distributionItems = [];
    var dName = "";
    if(req.body.distributionName){
      dName = req.body.distributionName;
    }
    var dDescription = "";
    if(req.body.distributionDescription){
      dDescription = req.body.distributionDescription;
    }

    if (req.body.distribution) {
    distributionItems = req.body.distribution.map(value => {
        const item = JSON.parse(value);
        return { itemId: item.id, name: item.name };
        });
    }

    var distributionPoint = {
    name: dName,
    description: dDescription,
    address: createDLocation(req),
    items: distributionItems
    }
    try {
        await db.addDistributionPoint(distributionPoint,req.session.projectId);
        res.redirect('/projects');
    }catch (err) {
        console.error('Error creating project:', err);
        res.status(500).send('Internal server error');
    }
})

app.get('/edit-collection-point', function(req,res){
    req.session.projectId = req.query.prid;
    req.session.type = 'C';
    req.session.pointId = req.query.pointId;
    req.session.name = req.query.name;
    req.session.description = req.query.description;
    req.session.address = req.query.address;
    res.redirect('/edit-point');
})

app.get('/edit-distribution-point', function(req,res){
    req.session.projectId = req.query.prid;
    req.session.pointId = req.query.pointId;
    req.session.type = 'D';
    req.session.name = req.query.name;
    req.session.description = req.query.description;
    req.session.address = req.query.address;
    res.redirect('/edit-point');
})

app.get('/edit-point',async function(req,res){
    const allItems = await db.getAllCategoriesAndItems();
   const selectedItems = await db.getSelectedItems(req.session.type,req.session.pointId);
    if (req.session.type=='C'){
        res.render('editCollectionPoint',{projectId:req.session.projectId,items:allItems,selectedItems:selectedItems,name:req.session.name,description:req.session.description,address:req.session.address})
    }
    else if (req.session.type=='D'){
       res.render('editDistributionPoint',{projectId:req.session.projectId,items:allItems,selectedItems:selectedItems,name:req.session.name,description:req.session.description,address:req.session.address})
    }
})

app.post('/edit-distribution-point', async function(req,res){
    var projectId = req.body.projectId;
   await db.closeDistributionPoint(projectId);

   var distributionItems = [];
   var dName = "";
   if(req.body.distributionName){
     dName = req.body.distributionName;
   }
   var dDescription = "";
   if(req.body.distributionDescription){
     dDescription = req.body.distributionDescription;
   }

   if (req.body.distribution) {
   distributionItems = req.body.distribution.map(value => {
       const item = JSON.parse(value);
       return { itemId: item.id, name: item.name };
       });
   }

   var distributionPoint = {
   name: dName,
   description: dDescription,
   address: createDLocation(req),
   items: distributionItems
   }
   try {
       await db.addDistributionPoint(distributionPoint,req.session.projectId);
       res.redirect('/projects');
   }catch (err) {
       console.error('Error creating project:', err);
       res.status(500).send('Internal server error');
   }
})

app.post('/edit-collection-point', async function(req,res){
    var projectId = req.body.projectId;
   await db.closeCollectionPoint(projectId);
    var collectionItems = [];
    if (req.body.collection) {
        collectionItems = req.body.collection.map(value => {
            const item = JSON.parse(value);
            return { itemId: item.id, name: item.name };
          });
      }
      var cName = "";
      if(req.body.collectionName){
        cName = req.body.collectionName;
      }
      var cDescription = "";
      if(req.body.collectionDescription){
        cDescription = req.body.collectionDescription;
      }
    var collectionPoint = {
        name: cName,
        description: cDescription,
        address: createCLocation(req),
        items: collectionItems
    }
       await db.addCollectionPoint(collectionPoint,projectId);
       res.redirect('/projects');
})

app.get('/close-collection-point', async function(req, res) {
    await db.closeCollectionPoint(req.query.prId);
    res.redirect('/projects');
});  
app.get('/close-distribution-point', async function(req, res) {
    await db.closeDistributionPoint(req.query.prId);
    res.redirect('/projects');
});  
app.listen(process.env.PORT || 4000, () =>{
    console.log('Server started listening on port 4000');
})