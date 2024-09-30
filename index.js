//INIT 
require("dotenv").config();
const route=require("./api/v1/routes/index.route");
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const port = process.env.PORT;
const portDB=process.env.DB_PORT;

const app = express();

//USE MIDDLEWARES
app.use(cors()); 
app.use(cookieParser());
app.use(express.json());


//PORT NOTIFICATION
app.listen(port, () => {
    console.log(`Server is running on ${port}`);
    console.log(`DB server is running on ${portDB}`);
});

route(app);