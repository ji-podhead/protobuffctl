const axios = require('axios');

// Die Daten, die Sie senden möchten
const data = {
 command: 'getAll', // Zum Beispiel, ersetzen Sie dies durch den Befehl, den Sie ausführen möchten
 args: ["services"] // Die Argumente für den Befehl, falls erforderlich
};

// Die URL Ihres Servers
const url = 'http://localhost:3000/protobuffctl';

// Senden Sie den POST-Request
axios.post(url, data)
 .then(response => {
    console.log('Erfolg:', response.data);
 })
 .catch(error => {
    console.error('Fehler:', error);
 });