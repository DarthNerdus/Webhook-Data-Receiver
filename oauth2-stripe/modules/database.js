const fs = require('fs');
const ini = require('ini');
const MySQL = require('mysql');
const moment = require('moment');

// LOAD CONFIGS
const config = ini.parse(fs.readFileSync('./config.ini', 'utf-8'));

// DATABASE CONNECTION
const database = MySQL.createConnection({
  host: config.DATABASE.host,
  user: config.DATABASE.username,
  password: config.DATABASE.password,
  port: config.DATABASE.port,
  database : config.DATABASE.rdm_db_name
});

database.runQuery = (query, data, success) => {
  database.query(query, data, function (err, user, fields) {
    if(err){ return console.error(err); }
    else{ if(success){ console.log(success); } }
  });
}

module.exports = database;
