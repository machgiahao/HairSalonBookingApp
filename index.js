//INIT 
const routesApiV1=require("./api/v1/routes/index.route");
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");




const dotenv = require("dotenv");
dotenv.config();
const routesApiV1 = require("./api/v1/routes/index.route");


const app = express();
const port = process.env.PORT;

//USE MIDDLEWARES
app.use(cors()); 
app.use(cookieParser());
app.use(express.json());



routesApiV1(app);

app.listen(port, () => {
    console.log(`Server is running on ${port}`)
});

