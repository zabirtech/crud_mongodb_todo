const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
// name of our database
const dbname = "crud_mongodb";

const uri = "mongodb+srv://TodoListApp:1234@todoapp-eewwk.mongodb.net/test?retryWrites=true&w=majority";

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


const state = {
    db: null
};

const connect = (cb) => {
    // if state is not NULL
    // Means we have connection already, call our CB
    if (state.db)
        cb();
    else {
        // attempt to get database connection
        MongoClient.connect(uri, client, (err, client) => {
            // unable to get database connection pass error to CB
            if (err)
                cb(err);
            // Successfully got our database connection
            // Set database connection and call CB
            else {
                state.db = client.db(dbname);
                cb();
            }
        });
    }
}

// returns OBJECTID object used to 
const getPrimaryKey = (_id) => {
    return ObjectID(_id);
}

// returns database connection 
const getDB = () => {
    return state.db;
}

module.exports = { getDB, connect, getPrimaryKey };