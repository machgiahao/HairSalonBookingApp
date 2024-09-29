const { Pool } = require("pg");
<<<<<<< HEAD

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

=======
const pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "demo-db",
    password: "12345",
    port: 5432
})

module.exports = pool;
>>>>>>> 90b48651f91132c974b8c224d1c9770ddf567b21
