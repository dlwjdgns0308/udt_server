var mysql = require('mysql2/promise');
require('dotenv').config();
const db = mysql.createPool({
    host : process.env.HOST,
    port: 31405,
    user : 'root',
    password : process.env.PASSWORD,
    database : 'udtown'
});


module.exports = db;