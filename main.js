
const { exec } = require('child_process');
const {ProtobuffGenerator} = require("@ji-podhead/protoc-helper")
const { content, messeage, Enum, ProtoFilePath, ProtoFile, Client, Request, Callback, Stream, ProtobuffFilePath, ProtobuffFile, ProtobuffUserPath, ProtobuffUser, ProtobuffUserComponentPreset, ProtobuffUserComponent, EndpointPath, Endpoint, MainEndpoint, Filewatcher,WatcherManager } = require('./classes.js');
const prototypes = ["nested", "double", "float", "int32", "int64", "uint32", "uint64", "sint32", "sint64", "fixed32", "fixed64", "sfixed32", "sfixed64", "bool", "string", "bytes"]
const chokidar = require('chokidar');
const ProtobufGenerator = require("@ji-podhead/protoc-helper")
const fs = require('fs');
const path = require('path');
const cli =require("./cli.js")
const generator = new ProtobuffGenerator()
const { watcherManagerInstance } = require('./shared.js');
const componentMap = new Map([
   ['content', new Map()],
   ['messeage', new Map()],
   ['Enum', new Map()],
   ['ProtoFilePath', new Map()],
   ['ProtoFile', new Map()],
   ['Client', new Map()],
   ['Request', new Map()],
   ['Callback', new Map()],
   ['Stream', new Map()],
   ['ProtobuffFilePath', new Map()],
   ['ProtobuffFile', new Map()],
   ['ProtobuffUserPath', new Map()],
   ['ProtobuffUser', new Map()],
   ['ProtobuffUserComponentPreset', new Map()],
   ['ProtobuffUserComponent', new Map()],
   ['EndpointPath', new Map()],
   ['Endpoint', new Map()],
   ['MainEndpoint',new Map()]
]);
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
function generateProtobuff(language, protopath, protobuffpath) {
   const dir = String(__dirname)+"/"
   const generator = new ProtobuffGenerator()
   generator.generateProtobuf("go",dir,"helloworld.proto",dir)
}
function createComponent(type, ...args) {
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
module.exports = {componentMap,watcherManagerInstance,cli,init, save, deserialize, generateProtobuff, createComponent,addWatcher,removeWatcher, stopAll,startAll};