var mysql = require('mysql2/promise');
const db = mysql.createPool({
    host : 'udtown.cfgvimc4xhxi.ap-northeast-2.rds.amazonaws.com',
    port: 3306,
    user : 'user',
    password : 'dkssud12',
    database : 'udtown'
});


module.exports = db;