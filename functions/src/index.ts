const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");
const bodyParser = require("body-parser");

const app = express();
app.use(cors({ origin: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
//initialize firebase admin SDK

admin.initializeApp(functions.config().firebase);

/*firestore database*/
//const db = admin.firestore();

/*realtime database*/
const dbPersons = admin.database().ref("/persons");

//db.settings({ timestampsInSnapshots: true });

app.post("/addUsers", (req, res) => {
  dbPersons.push(req.body);
  res.send(req.body);
});

app.get("/getUsers", (req, res) => {
  dbPersons.on(
    "value",
    snapshot => {
      const persons = [];
      snapshot.forEach(user => {
        persons.push(user);
      });
      res.send(persons);
    },
    errorObject => {
      console.log("The read failed: " + errorObject.code);
    }
  );
});

app.put("/:id", (req, res) => {
  const id = req.params.id;
  const updated = {
    firstName: req.body.firstName,
    lastName: req.body.lastName
  };
  dbPersons.child(id).set(updated);
  res.send(updated);
});

app.delete("/:id", (req, res) => {
  const id = req.params.id;
  dbPersons.child(id).set(null);
});

exports.app = functions.https.onRequest(app);
