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
const dbSubscribers = admin.database().ref("/subscribers");
const dbDevices = admin.database().ref("/devices");
//db.settings({ timestampsInSnapshots: true });
app.post("/addUsers", (req, res) => {
    dbPersons.push(req.body);
    res.send(req.body);
});
app.get("/getUsers", (req, res) => {
    dbPersons.on("value", snapshot => {
        const persons = [];
        snapshot.forEach(user => {
            persons.push(user);
        });
        res.send(persons);
    }, errorObject => {
        console.log("The read failed: " + errorObject.code);
    });
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
//runs whenever a new document is created in the subsbscriber's collection
app.post("/sendNotifications", (req, res) => {
    const postdata = {
        userId: req.body.userId,
        subscriberId: req.body.subscriberId
    };
    dbSubscribers.push(postdata);
    const payload = {
        notification: {
            title: "New Subscriber",
            body: `${postdata.subscriberId} is following your content!`
        }
    };
    dbDevices
        .orderByChild("userId")
        .equalTo(postdata.userId)
        .on("value", devices => {
        const tokens = [];
        //setTimeout(() => {
        devices.forEach(data => {
            tokens.push(data.val().token);
        });
        //}, 1000);
        return admin.messaging().sendToDevice(tokens, payload);
    });
});
exports.app = functions.https.onRequest(app);
//# sourceMappingURL=index.js.map