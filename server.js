const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");

const app = express();
const db = new sqlite3.Database("database.db");

// Middleware
app.use(cors());
app.use(express.json());

// Crear tabla si no existe
db.run(`CREATE TABLE IF NOT EXISTS juegos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    foto TEXT,
    descripcion TEXT,
    video TEXT,
    videoescritura BOOLEAN,
    cantidad INTEGER NOT NULL,
    jugadores_min INTEGER NOT NULL,
    jugadores_max INTEGER NOT NULL,
    capacidades TEXT
)`);

// Agregar un nuevo juego
app.post("/agregar", (req, res) => {
    const { nombre, foto, descripcion, video, videoescritura, cantidad, jugadores_min, jugadores_max, capacidades } = req.body;
    db.run(`INSERT INTO juegos (nombre, foto, descripcion, video, videoescritura, cantidad, jugadores_min, jugadores_max, capacidades) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [nombre, foto, descripcion, video, videoescritura, cantidad, jugadores_min, jugadores_max, JSON.stringify(capacidades)],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: this.lastID });
        }
    );
});

// Obtener todos los juegos
app.get("/juegos", (req, res) => {
    db.all("SELECT * FROM juegos", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows.map(juego => ({ ...juego, capacidades: JSON.parse(juego.capacidades) })));
    });
});

// Iniciar servidor
app.listen(3000, () => console.log("Servidor en http://localhost:3000"));
