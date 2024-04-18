const { getAll, get, create, toJson, stopAll, startAll, findAllUsages, del, pull, add, push, remove } = require("../src/shared");
const { set } = require('../src/protoUtils');


const { Protobuffctl } = require("../src/protobuffctl");
let protobuffctl


const port = 3001;
const functions = {
   getAll: getAll,
   get: get,
   create: create,
   toJson: toJson,
   stopAll: stopAll,
   startAll: startAll,
   findAllUsages: findAllUsages,
   del: del,
   pull: pull,
   add: add,
   push: push,
   remove: remove,
   set: set
}
// Erstellen Sie eine Redis-Client-Instanz
const client = redis.createClient({
   host: 'localhost', // oder Ihre Redis-Host-Adresse
   port: 6379 // oder Ihren Redis-Port
});

client.on('error', (err) => {
   console.error(`Redis error: ${err}`);
});



app.post('/protobuffctl', (req, res) => {
   const command = req.body.command;
   let args = req.body.args;
   if (!Array.isArray(args)) {
       args = [];
   }
   console.log("server executes command " + command + " \n" + JSON.stringify(args));
   try {
       const payload = functions[command](...args);
       console.log("server returns payload: ");
       // Extrahieren Sie 'key' aus dem Body des Requests
       res.json({ cmd: command, value: payload });

     // const key = req.body.key;
     // // Verwenden Sie 'key', um einen Wert aus Redis zu holen
     // client.get(key, (err, data) => {
     //     if (err) {
     //         res.status(500).send(err);
     //     } else {
     //         // Konvertieren Sie den String zurück in eine Map
     //       
     //     }
     //  });
   } catch (error) {
       console.error('Fehler beim Ausführen des Befehls:', error);
       res.status(500).json({ error: 'Ein Fehler ist aufgetreten.' });
   }
});
// Beispiel-Endpunkt zum Speichern von Daten
app.post('/save', (req, res) => {
   const key = req.body.key;
   const value = JSON.stringify(req.body.value); // Konvertieren Sie die Map in einen String
   client.set(key, value, (err) => {
      if (err) res.status(500).send(err);
      else res.send('Daten gespeichert');
   });
});

// Beispiel-Endpunkt zum Abrufen von Daten
app.get('/get/:key', (req, res) => {
   const key = req.params.key;
   client.get(key, (err, data) => {
      if (err) res.status(500).send(err);
      else res.json(JSON.parse(data)); // Konvertieren Sie den String zurück in eine Map
   });
});

;
