import express from 'express';

const app = express();
const PORT = 8080;

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Test');
})

app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
});