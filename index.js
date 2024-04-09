import express from "express";
import multer from "multer";

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import dotenv from "dotenv";
dotenv.config();


import { MongoClient, ObjectId } from "mongodb";

const upload = multer();

const app = express();
app.use(express.json());

app.listen(9090, () => {
    console.log("connected");
});

//  Mongo

// Connection URL
const url = "mongodb://localhost:27017"; 
const client = new MongoClient(url);

// Database Name
const dbName = "equipes";

let db;

async function main() {
    await client.connect();

    console.log("Connected successfully to server");
    db = client.db(dbName);
    return "done.";
}

main();
// JWT

// Middleware d'authentification JWT
const isAuthenticated = (req, res, next) => {
    const token = req.headers.authorization;
    console.log(token);
    if (!token) {
        return res.status(401).json({ message: 'Token non fourni' });
    }
    jwt.verify(token.split(" ")[1], process.env.SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Token invalide' });
        }
        req.user = decoded;
        next();
    });
};
// Route protégée nécessitant un token JWT pour accéder
app.get('/protected', isAuthenticated, (req, res) => {
    res.json({ message: 'Accès autorisé' });
});

// register
app.post('/register', async (req, res) => {
    const { username, password, email } = req.body;
    try {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds); // Hacher le mot de passe
        const collection = getCollection();
        const result = await collection.insertOne({ username, password: hashedPassword, email});
        res.status(201).json({ message: 'Utilisateur créé avec succès' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Route pour la connexion et la génération du token JWT
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const collection = client.db(dbName).collection("equipes");
        const equipes = await collection.findOne({ username });
        if (!equipes) {
            return res.status(401).json({ message: 'Nom d\'utilisateur ou mot de passe incorrect' });
        }
        const passwordMatch = await bcrypt.compare(password, equipes.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: 'Nom d\'utilisateur ou mot de passe incorrect' });
        }
        const token = jwt.sign({ username: equipes.username }, process.env.SECRET_KEY, { expiresIn: '24h' });
        res.json({ token });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});
//end JWT

// CRUD

//READ
app.get("/equipes", async (req, res) => {
    try {
        const collection = client.db(dbName).collection("equipes");

        const equipes = await collection.find({}).toArray();
        res.status(200).send(equipes);
    } catch (err) {
        res.status(500).send(err);
    }
});

// READ BY ONE , id
app.get("/equipes/:id", async (req, res) => {
    try {
        const id = parseInt(req.params.id);

        const collection = client.db(dbName).collection("equipes");

        // collection.findOne
        const equipe = await collection.findOne({ id: id });
        res.status(200).send(equipe);
    } catch (err) {
        res.status(500).send(err);
    }
});

// READ BY ONE , name
app.get("/equipes/name/:name", async (req, res) => {
    try {
        const name = req.params.name;
        console.log(req.params);

        const collection = client.db(dbName).collection("equipes");
        const equipe = await collection.find({ username: name }).toArray();

        res.status(200).send(equipe);
    } catch (err) {
        res.status(409).send("you cant create user with the same id"); //500
        console.log(err);
    }
});

function getCollection() {
    return client.db(dbName).collection("equipes");
}

// CREATE
app.post("/equipes", upload.any(), async (req, res) => {
    try {
        const collection = getCollection();
        const result = await collection.insertOne(req.body);
        res.status(200).send(result);
    } catch (err) {
        res.status(500).send(err);
    }
});

// update

app.put("/equipes/:id", upload.any(), async (req, res) => {
    try {
        const id = parseInt(req.params.id);

        const collection = getCollection();

        var myquery = { id: id };
        let newvalues = req.body;

        const result = await collection.updateOne(myquery, { $set: newvalues });

        if (result.matchedCount === 0) {
            return res.status(404).send();
        }
        res.status(200).send(result);
    } catch (err) {
        res.status(400).send(err);
    }
});

// dalete

app.delete("/equipes/:id", upload.any(), async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const collection = getCollection();

        const result = await collection.deleteOne({ id });

        if (result.matchedCount === 0) {
            return res.status(404).send();
        }
        res.status(200).send(result);
    } catch (err) {
        res.status(400).send(err);
    }
});

app.delete("/equipes", upload.any(), async (req, res) => {
    try {
        const collection = getCollection();

        const result = await collection.remove({});

        if (result.matchedCount === 0) {
            return res.status(404).send();
        }
        res.status(200).send(result);
    } catch (err) {
        res.status(400).send(err);
    }
});
