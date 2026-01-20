const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const route = require('./routes/route');
dotenv.config();



app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
        return res.status(200).json({});
    }
    next();
});
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('Connected to database!');
    })
    .catch((error) => {
        console.error('Connection failed!', error);
    });

app.use("/api/v1", route);



const port = process.env.PORT || 4004;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
