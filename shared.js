const {
    ProtoFile,
    ProtobuffFile,
    ProtoUser,
    ProtoUserComponent,
    Endpoint,
    MainEndpoint,
    languageFileExtensions
} = require('./classes.js');
const { protobuffctl } = require("./protobuffctl")
//const ProtoFileExtractor=require("./extractors.js")
const { exec } = require('child_process');
const chokidar = require('chokidar');
const { Console } = require('console');
const path = require('path');
const { types } = require('util');
const serialize = require('serialize-javascript');
const fs = require('fs');

function toJson() {
    const configPath = path.join(__dirname, 'protobuffctl.json');
    const defaultConfig = {}
    componentMap.forEach((value, key) => {
        console.log(key)
        console.log(value)
        defaultConfig[key] = [];
    });
    defaultConfig["ProtoFilePath"][0] = dir
    defaultConfig["ProtoFile"][0] = "helloworld.proto"
    if (!fs.existsSync(configPath)) {
        fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2), 'utf8');
        console.log('Konfigurationsdatei wurde erstellt.');
    } else {
        console.log('Konfigurationsdatei existiert bereits.');
    }
}

function init() {
    protobuffctl.watcherManager.init();
}function save() {
    protobuffctl.watcherManager.save();
}
function addWatcher() {
    protobuffctl.watcherManager.addWatcher(filePath);
}
function removeWatcher(filePath) {
    protobuffctl.watcherManager.removeWatcher(filePath);
}
function stopAll() {
    protobuffctl.watcherManager.stopAllWatchers();
}
function startAll() {
    protobuffctl.watcherManager.startAllWatchers();
}

function createProto(file, path) {
    try {
        const proto = new ProtoFile(file, path)
        console.log("created proto" + String(proto.id))
        return (proto)
    }
    catch (err) {
        console.log("had err while creating proto" + err)
        return ("had err while creating proto" + err)
    }

}
function getProto(id, file, path) {
    let proto
    try {
        if (id != undefined) {
            proto = protobuffctl.componentRegistry.get(id)
        }
        else {
            proto = Array.from(protobuffctl.componentRegistry.protoFiles.values()).find(
                protoFile => protoFile.file === file && protoFile.path === path
            );
        }
        console.log("found proto" + String(proto.id))
        return (proto)
    }
    catch (err) {
        console.log("had err while getting proto" + err)
        return ("had err while getting proto" + err)
    }
}
function generateProtobuff(protoFile, lang, out) {
    if (typeof (protoFile) == String) {
        protoFile = protobuffctl.componentRegistry.protoFiles.get(protoFile)
    }
}
const dir = String(__dirname) + "/helloworld.proto"
getProto(dir)
module.exports = {
    protobuffctl, init, save,  generateProtobuff, createProto, getProto, addWatcher, removeWatcher, stopAll, startAll
};



//const extractor = new ProtoFileExtractor(componentMap);
//const protoFileElements = extractor.extractProtoFileElements();
//console.log(protoFileElements);