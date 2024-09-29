const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
dotenv.config();
<<<<<<< HEAD
const routesApiV1 = require("./api/v1/routes/index.route");

=======
>>>>>>> 90b48651f91132c974b8c224d1c9770ddf567b21

const app = express();
const port = process.env.PORT;

app.use(cors()); 
app.use(cookieParser());
app.use(express.json());
routesApiV1(app);

app.listen(port, () => {
    console.log(`Server is running on ${port}`)
});

