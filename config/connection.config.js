const { Pool } = require("pg");

const pool = new Pool({
    host: process.env.HOST,
    user: process.env.DB_USER,
    port: process.env.DB_PORT,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});

pool.connect()
    .then(() => {
        console.log("Connected to the database successfully!");
    })
    .catch(err => {
        console.error("Connection failed: ", err.stack);
    });



module.exports=pool;