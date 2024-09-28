const { Pool } = require("pg");

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASS,
    port: process.env.DB_PORT
});

pool.connect()
    .then(() => {
        console.log("Connected to the database successfully!");
    })
    .catch(err => {
        console.error("Connection failed: ", err.stack);
    });


module.exports = pool;

