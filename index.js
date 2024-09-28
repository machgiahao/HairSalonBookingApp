const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
dotenv.config();

const port = process.env.PORT;
const app = express();

app.use(cors()); 
app.use(cookieParser());
app.use(express.json());



app.listen(port, () => {
    console.log(`Server is running on ${port}`)
});