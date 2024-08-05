const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const { exec } = require('child_process');
const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(express.static('public'));

const db = new sqlite3.Database(':memory:');

db.serialize(() => {
    db.run("CREATE TABLE scores (id INTEGER PRIMARY KEY, name TEXT, score INTEGER, date TEXT)");
});

app.get('/highscore', (req, res) => {
    db.get("SELECT MAX(score) as highscore FROM scores", (err, row) => {
        if (err) {
            res.status(500).send(err.message);
        } else {
            res.json({ highscore: row.highscore || 0 });
        }
    });
});

app.post('/score', (req, res) => {
    const { name, score } = req.body;
    const date = new Date().toISOString();
    console.log(`Received score: ${score} from ${name} on ${date}`);
    db.run("INSERT INTO scores (name, score, date) VALUES (?, ?, ?)", [name, score, date], function(err) {
        if (err) {
            console.error(`Error saving score: ${err.message}`);
            res.status(500).send(err.message);
        } else {
            console.log(`Score saved with ID: ${this.lastID}`);
            res.status(201).send({ id: this.lastID });
        }
    });
});

// Debug endpoint to retrieve all scores
app.get('/scores', (req, res) => {
    db.all("SELECT * FROM scores ORDER BY score DESC", (err, rows) => {
        if (err) {
            console.error(`Error retrieving scores: ${err.message}`);
            res.status(500).send(err.message);
        } else {
            console.log(`Scores retrieved: ${JSON.stringify(rows)}`);
            res.json(rows);
        }
    });
});

// Endpoint to shut down the server
app.post('/shutdown', (req, res) => {
    res.send('Shutting down the server...');
    console.log('Shutting down the server...');
    process.exit();
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
    // Open the browser automatically
    exec(`start http://localhost:${port}`);
});