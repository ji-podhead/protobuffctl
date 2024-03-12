// Initialize and export the shared instances
const {WatcherManager ,componentMap  } = require('./classes.js');
const watcherManagerInstance = new WatcherManager();

const { exec } = require('child_process');
const {ProtobuffGenerator} = require("@ji-podhead/protoc-helper")
const chokidar = require('chokidar');
const fs = require('fs');
const path = require('path');

const generator = new ProtobuffGenerator()



function createConfig() {
 const configPath = path.join(__dirname, 'protobuffctl.json');
 const defaultConfig = {
    watchers: [],
    components: [],
    // Weitere Konfigurationsoptionen können hier hinzugefügt werden
 };

 if (!fs.existsSync(configPath)) {
    fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2), 'utf8');
    console.log('Konfigurationsdatei wurde erstellt.');
 } else {
    console.log('Konfigurationsdatei existiert bereits.');
 }
}
function init(configPath) {
    try {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        console.log('Configuration loaded successfully.');
        const componentMap = new Map();
        for (const key in config) {
            config[key].forEach(jsonObject => {
                const component = deserialize(JSON.stringify(jsonObject));
                componentMap.set(jsonObject.type, component);
            });
        }
        return componentMap;
    } catch (error) {
        console.error('Error initializing:', error);
        throw error; // Werfen Sie den Fehler weiter, um ihn außerhalb der Funktion zu behandeln
    }
}
function save(outputPath) {
   try {
       const config = {};
       for (const [key, component] of componentMap.entries()) {
           config[key] = component.toJSON();
       }
       const jsonString = JSON.stringify(config, null, 2);
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
   const fields = Object.keys(json).filter(key => key !== 'type');
   const args = fields.map(field => json[field]);
   return new componentType(...args);
}
function generateProtobuff(language, protopath, protofile,outputdir) {
   generator.generateProtobuf(language,protopath,protofile,outputdir)
}
function createProtoComponent(type, ...args) {
   if (!componentMap.has(type)) {
      throw new Error(`Unsupported component type: ${type}`);
   }
   const Constructor = componentMap.get(type);
   const component = new Constructor(...args);
   return component;
}
function addWatcher(){
   watcherManagerInstance.addWatcher(filePath);   
}
function removeWatcher(filePath){
   watcherManagerInstance.removeWatcher(filePath);
}
function stopAll(){
   watcherManagerInstance.stopAllWatchers();
}
function startAll(){
   watcherManagerInstance.startAllWatchers();
}
module.exports = {
    watcherManagerInstance, componentMap,init, save, deserialize, generateProtobuff,  createProtoComponent,addWatcher,removeWatcher, stopAll,startAll, createConfig                             
    // Export other shared instances or functions
};