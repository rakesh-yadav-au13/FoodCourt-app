const express = require('express');
const hbs = require('hbs');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');
const MongodbStore = require('connect-mongo')(session);
const flash = require('express-flash');

//  import MongoDB connection
const initMongo = require('./app/config/dbConnection');
initMongo()

// use for getting time and date in order page
hbs.registerHelper('dateFormat', require('handlebars-dateformat'));

const app = express();
const PORT = process.env.PORT || 8900;

// body-parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


// createing mongo store for storeing the sessions 
const mongoStore = new MongodbStore({
    mongooseConnection: mongoose.connection,
    collection: 'sessions'
});

// create session 
app.use(session({
    secret: 'key101',
    store: mongoStore,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 }
}));


app.use(flash());

// **** custom middlewere for make available session in layout.hbs
app.use((req, res, next) => {
    res.locals.session = req.session;
    res.locals.user = req.session.token;
    next();
})


// for static files
app.use(express.static(path.join(__dirname, 'public')));

// set view emgine and path of views file
app.set('view engine', 'hbs')
app.set('views', path.join(__dirname, 'public/views'));

// **** importing Routers File
const webroutes = require('./routes/web');
const adminroutes = require('./routes/admin');


// web routes

app.use('/', webroutes);     // all customers routes

app.use('/admin', adminroutes);     // All admin routes 




app.listen(PORT, () => {
    console.log(`Listioning on localhost:${PORT}`)
})