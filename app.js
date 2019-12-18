const express = require('express');
const bodyParser = require("body-parser");
const path = require('path');
const db = require("./db");
const collection = "todo";
const app = express();
const Joi = require('joi');


const schema = Joi.object().keys({
    todo: Joi.string().required()
});

app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// read
app.get('/getTodos', (req, res) => {
    //  tar alla todo docu inom våran todo kollektion
    // skicka tillbaka till användare som json
    db.getDB().collection(collection).find({}).toArray((err, documents) => {
        if (err)
            console.log(err);
        else {
            res.json(documents);
        }
    });
});

// update
app.put('/:id', (req, res) => {
    // Våran primär nyckel av todo docu som vi önskar att uppdatera
    const todoID = req.params.id;
    // Docu används för att uppdatera!
    const userInput = req.body;
    // Hitta dokument via ID och uppdatera! 
    db.getDB().collection(collection).findOneAndUpdate({ _id: db.getPrimaryKey(todoID) }, { $set: { todo: userInput.todo } }, { returnOriginal: false }, (err, result) => {
        if (err)
            console.log(err);
        else {
            res.json(result);
        }
    });
});


//create
app.post('/', (req, res, next) => {
    // Dokument för att bli iniaterad
    const userInput = req.body;

    // Validate document
    // Om dokumentet är ogiltigt överförs till error middleware 
    // annars infoga dokument i todo-samlingen
    Joi.validate(userInput, schema, (err, result) => {
        if (err) {
            const error = new Error("Invalid Input");
            error.status = 400;
            next(error);
        } else {
            db.getDB().collection(collection).insertOne(userInput, (err, result) => {
                if (err) {
                    const error = new Error("Failed to insert Todo Document");
                    error.status = 400;
                    next(error);
                } else
                    res.json({ result: result, document: result.ops[0], msg: "Successfully inserted Todo!!!", error: null });
            });
        }
    })
});



//delete
app.delete('/:id', (req, res) => {
    // Primär Nyckel av Todo Document
    const todoID = req.params.id;
    // Hitta dokument efter ID och ta bort dokument från posten
    db.getDB().collection(collection).findOneAndDelete({ _id: db.getPrimaryKey(todoID) }, (err, result) => {
        if (err)
            console.log(err);
        else
            res.json(result);
    });
});

// Middleware för hantering av Error
// Skickar Error Response tillbaka till användare
app.use((err, req, res, next) => {
    res.status(err.status).json({
        error: {
            message: err.message
        }
    });
})





db.connect((err) => {
    if (err) {
        console.log('unable to connect to database');
        process.exit(1);
    } else {
        app.listen(9000, () => {
            console.log('connected to database, app listenning on port 9000');
        });
    }
});