import express from 'express';
import cors from 'cors';
import { Database } from 'sqlite3'
import * as fs from 'fs'; // file system module
import * as XLSX from 'xlsx'; // parsing excel files module

// Load environment variables and asign a port.
require('dotenv').config();
const PORT = process.env.PORT || 8080;

const app = express();

// Setup a database
const db = new Database('db.sqlite', (error) => {
  if(error) {
    console.error('Error opening a database: ', error);
  }
  else {
    console.log('Database connected');
  }

  // Create Table and parse Swift Codes


});

app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
    res.send('Test');
})

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});