import express from 'express';
import cors from 'cors';
import { getDatabase } from './lib/database';
import { parseSwiftCodes } from './lib/dataImport';


// Load environment variables and asign a port.
require('dotenv').config();
const PORT = process.env.PORT || 8080;

const app = express();

app.use(express.json());
app.use(cors());

const testDatabaseAndImport = async () => {
    try {
        const db = await getDatabase();
    } catch (error) {
        console.error('Error during testing:', error);
    }
};

testDatabaseAndImport(); 

app.get('/', (req, res) => {
    res.send('Test');
})

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});