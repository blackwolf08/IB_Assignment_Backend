require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const connectDB = require('./database/index.js');
const app = express();

const PORT = process.env.PORT || 5000;

const mysqlConnection = mysql.createConnection({
  host: process.env.HOST,
  user: process.env.USERNAME,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
});

app.use(bodyParser.urlencoded({ extended: true }));
connectDB.connect(mysqlConnection);

//Importing Routes
require('./routes/index.js')(app, mysqlConnection);

const server = app.listen(PORT, () => {
  console.log('Server Started!');
  console.log('Listening on PORT ', PORT);
});

process.on('SIGINT', () => {
  console.log('\nServer Turn off Sequence Initiated!');
  console.log('Disconnecting from Database');
  connectDB.disconnect(mysqlConnection);
  console.log('Closing Server!');
  server.close();
  console.log('Turn Off Sequence Complete! Exiting');
  process.exit(1);
});
