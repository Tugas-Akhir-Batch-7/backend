//setup npm
const express = require('express');
const bodyParser = require('body-parser')
var session = require('express-session')

//setup import
const db = require('./db/models')
const router = require('./router/router')
const errorHandler = require('./middlewares/error-handler');

//setup express
const app = express();
const port = process.env.PORT || 5000;

//session
app.use(session({
    secret: 'sessoin',
    resave: true,
    saveUninitialized: false,
  }));


// const routers = require('./routes'); // mengarah ke index.js di folder routes

app.use(express.json());
// app.use(routers);

//body parse
// app.use(bodyParser.raw())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extented: false }))

app.use(router)

// app.get('/', (req, res) => res.send('Hello World!'));

app.use(errorHandler)


//handle route yang tidak ada
app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        message: 'URL Not found'
    });
})


app.listen(port, () => console.log(`Example app listening on http://localhost:${port} !`));