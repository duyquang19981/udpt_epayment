const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const expbhs = require('express-handlebars');
const app = express();


app.use('/course',express.static('public/template'));
app.use(express.static('public/template'));

app.use('/course/:id',express.static('public/unicat'),express.static('public'));

app.use('/Login/',express.static('public/unicat'),express.static('public'));

app.use(express.static('public'));
app.use(express.static('public/unicat'));
app.use(express.static('public/Login'));

app.use(express.static('public/scripts'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const passport = require('passport')
    , LocalStrategy = require('passport-local').Strategy;
const User = require('./Models/schema/User.model');
const db = require('./db');
passport.use('local', new LocalStrategy(
    {
        usernameField: 'email',
        passwordField: 'password'
    },
    async function (email, password, done) {
        db._connect();
        const user =  await User.findOne({ Email: email });
        if(user == null){
            return done(null, false, { message: 'Incorrect email.' });
        }
        if(!comparePassword(password,user.Password)){
            return done(null, false, { message: 'Incorrect password.' });
        }
        
        return done(null, user);
    }
));
const bcrypt = require('bcrypt');
const comparePassword = (myPassword, hash) => {
    return bcrypt.compareSync(myPassword, hash);
}

passport.serializeUser(function(user, done) {
    done(null, user);
});
  
passport.deserializeUser(function(user, done) {
    
    done(null, user);
});

const session = require('express-session');
const { connection } = require('mongoose');
app.use(session({
	secret: "mysession",
	cookie: {
		maxAge: 600000 //đơn vị là milisecond
	},
	saveUninitialized: true,
	resave: true
}));

app.use(passport.initialize());
app.use(passport.session());
const flash = require('connect-flash');

app.use(flash());
app.set('view engine', 'hbs');
app.engine('hbs', expbhs({
    defaultLayout: 'main',
    extname: 'hbs',
    layoutsDir: path.join(__dirname, 'views/Layouts'),
    partialsDir: path.join(__dirname, 'views/Partials'),
    
}));

app.use('/',require('./Controllers/Home.controllers'));
//useraccount(profile, )
app.use('/category',require('./Controllers/Category.controllers'));
app.use('/category',express.static('public/unicat'),express.static('public'));
app.use('/userprofile', express.static('public/unicat'), express.static('public'));
app.use('/userprofile', require('./Controllers/userprofile.controllers'));
app.use('/course', express.static('public/unicat'),express.static('public/scripts'));
app.use('/course', require("./Controllers/course.controllers")) ;
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));