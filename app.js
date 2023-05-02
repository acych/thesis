const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const db = require("./db/dbOperations");

const app = express();



// db.createUser({ name: 'Foo',email:'test1234@test.com',password:'1234567890',address:'address1',tax_id:123456709, city:'city',country:'Country', postal_code:12345, phone:1234560890, tax_id:123956789 });

// const user = await findUser('test1234@test.com', '1234567890');
// console.log(user);

// const user = await db.findUser('example@example.com', 'password123');
// console.log(user);
// db.findUser('test1234@test.com', '1234567890');
// // db.findUser('aaaa','aaaa');


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
        title: 'I AM',
        option1: 'INDIVIDUAL',
        option1Next: '/individual',
        image1: './img/choices/individual.png',
        option2: 'ORGANIZATION',
        option2Next: '/organization',
        image2: './img/choices/organization.png'
    }
    res.render('index',{variables:variables})
})

app.get('/individual', (req,res)=>{
    const variables = {
        title: 'I WANT',
        option1: 'FIND',
        option1Next: '/find',
        image1: './img/choices/find.png',
        option2: 'OFFER',
        option2Next: '/offer',
        image2: './img/choices/offer.png'
    }
    res.render('index',{variables:variables});
})

app.get('/organization',(req,res)=>{
    res.redirect('/login');
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
    const variables = {
        title: 'SELECT',
        option1: 'PROJECTS',
        option1Next: '/projects',
        image1: './img/choices/projects.png',
        option2: 'PROFILE',
        option2Next: '/profile',
        image2: './img/choices/individual.png'
    }
    res.render('index',{variables:variables});
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
  


app.get('/register', (req,res)=>{
    res.render('register',{});
})
app.post('/register', async function(req,res){
    if(req.body.password!==req.body.validPassword){
        res.render('register', { error: "Passwords don't match" });
    }
    else{
       let userData = {
        email: req.body.email,
        password: req.body.password,
        address: req.body.address,
        city: req.body.city,
        postal_code: req.body.postal_code,
        country: req.body.country,
        phone: req.body.phone,
        tax_id: req.body.taxID
       } 
       try{
        await db.connect();
        const user = await db.registerUser(userData);
        req.session.user = user;
        const variables = {
            title: 'SELECT',
            option1: 'PROJECTS',
            option1Next: '/projects',
            image1: './img/choices/projects.png',
            option2: 'PROFILE',
            option2Next: '/profile',
            image2: './img/choices/individual.png'
        }
        res.render('index',{variables:variables});
       }
       catch (err) {
        // handle any errors that occur
        console.error(err);
        res.render('error', { error: 'An error occurred' });
    } 
    }
});
    // console.log("Email is " + req.body.email + " and password is " + req.body.password + " taxID is "+ req.body.taxID + " password rewrite " + req.body.validPassword);

// })

app.listen(4000, () =>{
    console.log('Server started listening on port 4000');
})