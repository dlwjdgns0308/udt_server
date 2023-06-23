var mysql = require('mysql2/promise');
const db = mysql.createPool({
    host : 'svc.sel4.cloudtype.app',
    port: 31405,
    user : 'root',
    password : '0308',
    database : 'udtown'
});


module.exports = db;