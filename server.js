var express = require('express');
var morgan = require('morgan');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var ejs = require('ejs');
var engine = require('ejs-mate');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var flash = require('express-flash');
//for saving the session and MongoStore work with a session without session it won't work this save session as well on the DB
const  MongoStore = require('connect-mongo')(session);
var passport = require('passport');

var secret = require('./config/secret');
var User = require('./models/user');
var Category = require('./models/category');

var app = express();

mongoose.connect(secret.database, function(err) {
if (err) {
console.log(err);
}else {
  console.log("Connected to the database");
}


});

//Middleware
app.use(express.static(__dirname + '/public'));
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(session({
resave:true,
saveUnitialized: true,
secret: secret.secretkey,
store: new MongoStore({url: secret.database , autoReconnect: true
})
}));

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(function(req,res, next){
  res.locals.user = req.user;
  next();
});

app.use(function(req,res,next) {
  // find all the categories for a specific query please add something inside the {} example Category.find({'food'} , function(err, categories) {
  Category.find({} , function(err, categories) {
    if (err) return next(err);
    res.locals.categories = categories;
    next();
  })
});


app.engine('ejs' , engine);
app.set('view engine' , 'ejs');



var mainRoutes = require('./routes/main');
var userRoutes = require('./routes/user');
var adminRoutes = require('./routes/admin');
var apiRouter = require('./api/api');
app.use(mainRoutes);
app.use(userRoutes);
app.use(adminRoutes);
app.use('/api', apiRouter);

app.listen(secret.port, function(err) {
  if (err) throw err;
  console.log("Server is Running on port " + secret.port);
});
