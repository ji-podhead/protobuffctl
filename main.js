
const { exec } = require('child_process');
const { content, messeage, Enum, ProtoFilePath, ProtoFile, Client, Request, Callback, Stream, ProtobuffFilePath, ProtobuffFile, ProtobuffUserPath, ProtobuffUser, ProtobuffUserComponentPreset, ProtobuffUserComponent, EndpointPath, Endpoint, ProtobufGenerator, MainEndpoint, Filewatcher } = require('./classes.js');
const prototypes = ["nested", "double", "float", "int32", "int64", "uint32", "uint64", "sint32", "sint64", "fixed32", "fixed64", "sfixed32", "sfixed64", "bool", "string", "bytes"]
const chokidar = require('chokidar');

const fs = require('fs');
const path = require('path');
const program = require('commander');


program
    .command('add <filePath>')
    .description('Add a watcher for the specified file path')
    .action(async (filePath) => {
        await WatcherManager. addWatcher(filePath);
    });

program
    .command('remove <filePath>')
    .description('Remove the watcher for the specified file path')
    .action((filePath) => {
      WatcherManager.removeWatcher(filePath);
    });

program
    .command('start')
    .description('Start all watchers')
    .action(() => {
      WatcherManager.startAllWatchers();
    });

program
    .command('stop')
    .description('Stop all watchers')
    .action(() => {
        watcherManager.stopAllWatchers();
    });

// Weitere CLI-Befehle können hier hinzugefügt werden

program.parse(process.argv);
function init(configPath) {
    try {
        // Lesen Sie die Konfigurationsdatei
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        console.log('Configuration loaded successfully.');

        // Erstellen Sie eine neue Map für die Komponenten
        const componentMap = new Map();

        // Iterieren Sie über die Arrays in der Konfiguration
        for (const key in config) {
            // Für jedes Array in der Konfiguration
            config[key].forEach(jsonObject => {
                // Deserialisieren Sie das JSON-Objekt in eine Instanz der Klasse
                const component = deserialize(JSON.stringify(jsonObject));
                // Fügen Sie die Instanz in die Map ein
                componentMap.set(jsonObject.type, component);
            });
        }

        return componentMap;
    } catch (error) {
        console.error('Error initializing:', error);
        throw error; // Werfen Sie den Fehler weiter, um ihn außerhalb der Funktion zu behandeln
    }
}

function save(componentMap, outputPath) {
   try {
       // Erstellen Sie ein leeres Objekt, das später in JSON umgewandelt wird
       const config = {};

       // Iterieren Sie über die Map und serialisieren Sie jedes Element
       for (const [key, component] of componentMap.entries()) {
           // Verwenden Sie die toJSON-Methode, um das Element in ein JSON-Objekt umzuwandeln
           config[key] = component.toJSON();
       }

       // Konvertieren Sie das Objekt in eine JSON-Zeichenkette
       const jsonString = JSON.stringify(config, null, 2);

       // Schreiben Sie die JSON-Zeichenkette in eine Datei
       fs.writeFileSync(outputPath, jsonString, 'utf8');

       console.log(`Configuration saved successfully to ${outputPath}.`);
   } catch (error) {
       console.error('Error saving configuration:', error);
       throw error; // Werfen Sie den Fehler weiter, um ihn außerhalb der Funktion zu behandeln
   }
}
function deserialize(jsonString) {
   const json = JSON.parse(jsonString);
   const componentType = componentMap.get(json.type); // Angenommen, jedes JSON-Objekt hat ein Feld "type", das den Namen der Klasse enthält

   if (!componentType) {
      throw new Error(`Unknown component type: ${json.type}`);
   }

   // Extrahieren Sie die Felder aus dem JSON-Objekt
   const fields = Object.keys(json).filter(key => key !== 'type');
   const args = fields.map(field => json[field]);

   // Erstellen Sie eine neue Instanz der Klasse mit den extrahierten Feldern
   return new componentType(...args);
}
class WatcherManager {
   constructor() {
      // @ts-ignore
      if (WatcherManager.instance) {
         return WatcherManager.instance;
      }

      this.watchers = new Map();
      WatcherManager.instance = this;
   }

   static getInstance() {
      if (!WatcherManager.instance) {
         new WatcherManager();
      }
      return WatcherManager.instance;
   }

   async initialize(configPath) {
      try {
         const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
         console.log('Configuration loaded successfully.');

         for (const protoFile of config.protoFiles) {
            await this.addWatcher(protoFile);
         }

         for (const protobuffFile of config.protobuffFiles) {
            await this.addWatcher(protobuffFile);
         }

         for (const component of config.components) {
            await this.addWatcher(component);
         }

         console.log('All watchers added.');
      } catch (error) {
         console.error('Error initializing:', error);
      }
   }
   async addWatcher(protofile) {
      const filewatcher = new Filewatcher(protofile);
      await filewatcher.startWatcher();
      this.watchers.set(protofile, filewatcher);
      console.log(`Watcher added for ${protofile}`);
   }

   stopAllWatchers() {
      for (const watcher of this.watchers.values()) {
         watcher.close();
      }
      console.log('All watchers stopped.');
   }
}

// Exportieren Sie die Singleton-Instanz

// Funktion, die aufgerufen wird, wenn eine Datei geändert wird

// Beispiel, wie man den Watcher von außen beenden kann
// watcherPromise.then(watcher => watcher.stop());
// Starten Sie den Watcher
//startWatcher().catch(console.error);
function generateProtobuff(language, protopath, protobuffpath) {
   const generator = new ProtobufGenerator();
   generator.generateProtobuf(language, protopath, protobuffpath)
      .then(output => console.log(output))
      .catch(error => console.error(error));
}
// Die universelle Funktion createComponent
function createComponent(type, ...args) {
   if (!componentMap.has(type)) {
      throw new Error(`Unsupported component type: ${type}`);
   }

   const Constructor = componentMap.get(type);
   const component = new Constructor(...args);
   return component;
}
const componentMap = new Map([
   ['content', content],
   ['messeage', messeage],
   ['Enum', Enum],
   ['ProtoFilePath', ProtoFilePath],
   ['ProtoFile', ProtoFile],
   ['Client', Client],
   ['Request', Request],
   ['Callback', Callback],
   ['Stream', Stream],
   ['ProtobuffFilePath', ProtobuffFilePath],
   ['ProtobuffFile', ProtobuffFile],
   ['ProtobuffUserPath', ProtobuffUserPath],
   ['ProtobuffUser', ProtobuffUser],
   ['ProtobuffUserComponentPreset', ProtobuffUserComponentPreset],
   ['ProtobuffUserComponent', ProtobuffUserComponent],
   ['EndpointPath', EndpointPath],
   ['Endpoint', Endpoint],
   ['MainEndpoint', MainEndpoint]
]);
module.exports = WatcherManager.getInstance();