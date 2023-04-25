const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const db = require("./dbOperations");

const app = express();


db.connect();
db.createUser({ name: 'Foo',email:'test1234@test.com',password:'1234567890',address:'address1',tax_id:123456709, city:'city',country:'Country', postal_code:12345, phone:1234560890, tax_id:123956789 });
// console.log(db.findUser({ name: 'Foo' }));
// if(db.findUser({ name: 'Foo' })){
// }

// mongoose.connect('mongodb://localhost:27017/easeAsterDB', { useNewUrlParser: true, useUnifiedTopology: true });

// const userSchema = new mongoose.Schema({
//   _id: { type: String, required: true },
//   name: String,
//   email: String,
//   password: String,
//   address: String,
//   city: String,
//   postal_code: Number,
//   country: String,
//   phone: Number,
// });

// const User = mongoose.model('User', userSchema);

// const user = new User({
//   _id: '012345678',
//   name: 'Name',
//   email: 'test@email.com',
//   password: 'pass',
//   address: 'Address 3',
//   city: 'Athens',
//   postal_code: 12345,
//   country: 'Greece',
//   phone: 2101234569,
// });

// user.save()
//   .then(() => console.log('User saved'))
//   .catch((error) => console.log('Error saving user:', error));

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

app.use(session({
    secret: 'mysecret',
    resave: false,
    saveUninitialized: true
}));

// var userID=null;
// app.use((req, res, next) => {
//     if (req.session.userId) {
//       User.findById(req.session.userId, (err, user) => {
//         if (err) {
//           return next(err);
//         }
//         res.locals.user = user; // Set the user variable in res.locals
//         next();
//       });
//     } else {
//       res.locals.user = null; // Set the user variable to null if the user is not logged in
//       next();
//     }
//   });

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

// app.get('/organization', (req,res)=>{
//     const variables = {
//         title: 'CHOOSE OPTION',
//         option1: 'LOG IN',
//         option1Next: '/login',
//         image1: './img/choices/login.png',
//         option2: 'REGISTER',
//         option2Next: '/register',
//         image2: './img/choices/register.png'
//     }
//     res.render('index',{variables:variables});
// })

app.get('/organization',(req,res)=>{
    res.redirect('/login');
})


// Define the login middleware
// const loginMiddleware = async (req, res, next) => {
//     const { email, password } = req.body;
  
//     try {
//       const user = await User.findOne({ email });
//       if (!user) {
//         return res.status(401).json({ error: 'Invalid credentials' });
//       }
  
//       const isPasswordValid = await user.comparePassword(password);
//       if (!isPasswordValid) {
//         return res.status(401).json({ error: 'Invalid credentials' });
//       }
  
//       const token = jwt.sign({ userId: user._id }, 'mysecretkey');
//       return res.status(200).json({ token });
//     } catch (err) {
//       next(err);
//     }
//   };


app.get('/login', (req,res)=>{
    res.render('login',{});
})

const checkUser = async (email, password, res) => {
    const result = await db.loginUser(email, password);
    // do something else here after firstFunction completes
    if(result===true){
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
    else if(result===false){
        console.log("it is false")
    }
    else{
        console.log("it is sth else" + loggedIn);
    }
  }

app.post('/login', function(req,res){
    checkUser (req.body.email,req.body.password, res);
    // console.log("Email is " + req.body.email + " and password is " + req.body.password);
    // console.log("EEEEE" + db.loginUser(req.body.email,req.body.password))
    // db.loginUser(req.body.email,req.body.password)
    // if(loggedIn===true){
    //     console.log("logged IN")
    // }
    // else if(loggedIn===false){
    //     console.log("it is false")
    // }
    // else{
    //     console.log("it is sth else" + loggedIn);
    // }
    //     const variables = {
    //         title: 'SELECT',
    //         option1: 'PROJECTS',
    //         option1Next: '/projects',
    //         image1: './img/choices/projects.png',
    //         option2: 'PROFILE',
    //         option2Next: '/profile',
    //         image2: './img/choices/individual.png'
    //     }
    //     res.render('index',{variables:variables});
    // }
    // else{
    //     res.render('login',{});
    // }
})


app.get('/register', (req,res)=>{
    res.render('register',{});
})
app.post('/register', function(req,res){
    console.log("Email is " + req.body.email + " and password is " + req.body.password + " taxID is "+ req.body.taxID + " password rewrite " + req.body.validPassword);
})

app.listen(4000, () =>{
    console.log('Server started listening on port 4000');
})