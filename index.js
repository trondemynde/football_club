const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const db = new sqlite3.Database(':memory:');

app.use(bodyParser.urlencoded({ extended: true }));

// Create players table
db.serialize(() => {
  db.run("CREATE TABLE players (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, position TEXT, number INTEGER)");
});

// Serve HTML forms
app.get('/', (req, res) => {
    res.send(`
      <h1>Football Club</h1>
      <form action="/create" method="POST">
        <input type="text" name="name" placeholder="Player Name" required>
        <input type="text" name="position" placeholder="Position" required>
        <input type="number" name="number" placeholder="Number" required>
        <button type="submit">Add Player</button>
      </form>
      <form action="/update" method="POST">
        <input type="number" name="id" placeholder="Player ID" required>
        <input type="text" name="name" placeholder="Player Name" required>
        <input type="text" name="position" placeholder="Position" required>
        <input type="number" name="number" placeholder="Number" required>
        <button type="submit">Update Player</button>
      </form>
      <h2>Players</h2>
      <ul id="player-list"></ul>
      <script>
        fetch('/players')
          .then(response => response.json())
          .then(players => {
            const list = document.getElementById('player-list');
            players.forEach(player => {
              const li = document.createElement('li');
              li.textContent = \`\${player.name} (\${player.position}) - \${player.number}\`;
              li.innerHTML += \` <a href="/delete/\${player.id}">Delete</a>\`;
              list.appendChild(li);
            });
          });
      </script>
    `);
  });
  

// Create a player
app.post('/create', (req, res) => {
  const { name, position, number } = req.body;
  db.run("INSERT INTO players (name, position, number) VALUES (?, ?, ?)", [name, position, number], function (err) {
    if (err) {
      return console.log(err.message);
    }
    res.redirect('/');
  });
});

// List existing players
app.get('/players', (req, res) => {
  db.all("SELECT * FROM players", (err, rows) => {
    if (err) {
      res.status(500).send(err.message);
      return;
    }
    res.json(rows);
  });
});

// Delete a player
app.get('/delete/:id', (req, res) => {
  const id = req.params.id;
  db.run("DELETE FROM players WHERE id = ?", id, function (err) {
    if (err) {
      return console.error(err.message);
    }
    res.redirect('/');
  });
});

// Update a player
app.post('/update', (req, res) => {
    const { id, name, position, number } = req.body;
    db.run("UPDATE players SET name = ?, position = ?, number = ? WHERE id = ?", [name, position, number, id], function (err) {
      if (err) {
        return console.log(err.message);
      }
      res.redirect('/');
    });
  });
  

// Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
