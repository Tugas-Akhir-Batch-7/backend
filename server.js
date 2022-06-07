const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
// const errorHandler = require('./middlewares/error-handler');

// const routers = require('./routes'); // mengarah ke index.js di folder routes

app.use(express.json());
// app.use(routers);

app.get('/', (req, res) => res.send('Hello World!'));

// app.use(errorHandler)


//handle route yang tidak ada
app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        message: 'URL Not found'
    });
})


app.listen(port, () => console.log(`Example app listening on http://localhost:${port} !`));