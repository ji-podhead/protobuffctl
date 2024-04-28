// main.js
const { Worker } = require('worker_threads');
const { getAll, remove, findAllUsages, add, del, protogenArr, pull, push, createFromConfig, get, toJson, create, addWatcher, removeWatcher, stopAllWatchers, startAllWatchers, startServer } = require('../src/shared.js');
const { time } = require('console');
const express = require('express');
const net = require('net');
const redis = require('redis');
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))
const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' };

class apiWrapper {
    constructor(port) {
      this.port=port!=undefined?port:3001
        this.checkPort(this.port)
            .then(isAvailable => {
                if (isAvailable) {
                    console.log('Port ist verfügbar');
                    console.log("starting middleware process")
                   
                } else {
                    return   console.log('Port ist belegt');
                }
            })
            .catch(err => {
                console.error('Fehler beim Überprüfen des Ports:', err);
            });
        this.proccesStartTime = Date.now()
        this.startApiServer()
    }
    checkPort(port, host = 'localhost') {
        return new Promise((resolve, reject) => {
            const server = net.createServer()
                .once('error', err => {
                    if (err.code === 'EADDRINUSE') {
                        resolve(false); // Der Port ist belegt
                    } else {
                        reject(err); // Ein anderer Fehler ist aufgetreten
                    }
                })
                .once('listening', () => {
                    server.close(); // Port ist frei, Server schließen
                    resolve(true);
                })
                .listen(port, host);
        });
    }
    apiCall(command,args){
        this.worker.postMessage({command:command,args:args});
    }
    startApiServer(){
        this.worker = new Worker('./worker.js');
        this.proccesStartTime = Date.now()
        this.worker.on('message', (message) => {
            console.log(`Main thread received message: ${message}`);
        });
    
        this.apiServer = express();
        this.apiServer.use(express.json());
        const client = redis.createClient({
            host: 'localhost', // oder Ihre Redis-Host-Adresse
            port: 6379 // oder Ihren Redis-Port
        });
        client.on('error', (err) => {
            console.error(`Redis error: ${err}`);
        });
        this.apiServer.post('/protobuffctl', (req, res) => {
            const command = req.body.command;
            let args = req.body.args;
            if (!Array.isArray(args)) {
                args = [];
            }
            console.log("server executes command " + command + " \n" + JSON.stringify(args));
            try {
                apiCall(command, args)
                res.json({ cmd: command, value: payload });

            } catch (error) {
                console.error('Fehler beim Ausführen des Befehls:', error);
                res.status(500).json({ error: 'Ein Fehler ist aufgetreten.' });
            }
        });

        this.apiServer.listen(this.port, () => {
            console.log(`protobuffctl api server  is running on ${this.port}`);
        })
    }
    /**
     * @description ${classDescriptions.Protobuffctl.methods.stopDaemon}
     */
    stopApiServer() {
        if (this.apiServer) {
            this.apiServer.close(() => {
                console.log('protobuffctl api server stopped');
            });
            this.serverStatus().then(() => {
                console.log('Server status resolved');
                this.serverStatus = false; // Setzen Sie serverStatus auf false, nachdem das Promise aufgelöst wurde
            });
        } else {
            console.log('Server is not running');
        }
    }
    getProcessStatus() {
        const formattedDate = this.proccesStartTime.toLocaleString('de-DE', options);
        console.log("protobuffctl process is running since " + formattedDate)
        return formattedDate
    }
}
module.exports = {
    apiWrapper
}

/*
         // Beispiel-Endpunkt zum Speichern von Daten
         this.apiServer.post('/save', (req, res) => {
            const key = req.body.key;
            const value = JSON.stringify(req.body.value); // Konvertieren Sie die Map in einen String
            client.set(key, value, (err) => {
               if (err) res.status(500).send(err);
               else res.send('Daten gespeichert');
            });
         });
         
         // Beispiel-Endpunkt zum Abrufen von Daten
         this.apiServer.get('/get/:key', (req, res) => {
            const key = req.params.key;
            client.get(key, (err, data) => {
               if (err) res.status(500).send(err);
               else res.json(JSON.parse(data)); // Konvertieren Sie den String zurück in eine Map
            });
         });
  const delay = ms => new Promise(resolve => setTimeout(resolve, ms))
            this.serverStatus = new Promise(async (promise) => {
                for (; ;) {
                    await delay(100);
                    console.log(this.serverStatus)
                    if (this.serverStatus == false) return resolve()
                }
            })
            */
                           /* // const key = req.body.key;
                 // Verwenden Sie 'key', um einen Wert aus Redis zu holen
                 client.get(key, (err, data) => {
                     if (err) {
                         res.status(500).send(err);
                     } else {
                         // Konvertieren Sie den String zurück in eine Map
                       
                     }
                  });
                 */