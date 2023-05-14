const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const db = require("./db/dbOperations");

const app = express();

// db.createCollectionPoint('name','description','location',['food','clothes'])
// db.createUser({ name: 'Foo',email:'test1234@test.com',password:'1234567890',address:'address1',tax_id:123456709, city:'city',country:'Country', postal_code:12345, phone:1234560890, tax_id:123956789, projects:[] });


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
        user: req.session.user
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
    req.session.user = null,
    res.redirect('/');
})

app.get('/projects',async (req,res)=>{
    // let user = req.session.user;
    if(req.session.user.projects.length<=0){
        res.render("project");
    }
    else{

            var projects = await db.getAllUserProjects(req.session.user);
            console.log(projects)
            res.render('projects',{projects:projects});
    }
})


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
      if (req.body.distribution) {
        distributionItems = req.body.distribution.map(value => {
            const item = JSON.parse(value);
            return { itemId: item.id, name: item.name };
          });
      }
    var collectionPoint = {
        name: req.body.collectionName,
        description: req.body.collectionDescription,
        address: req.body.collectionLocation,
        items: collectionItems
    }

    var distributionPoint = {
    name: req.body.distributionionName,
    description: req.body.distirbutionDescription,
    address: req.body.distributiontionLocation,
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
    // console.log("Email is " + req.body.email + " and password is " + req.body.password + " taxID is "+ req.body.taxID + " password rewrite " + req.body.validPassword);

// })

app.listen(4000, () =>{
    console.log('Server started listening on port 4000');
})