const {
    ProtoFile,
    ProtobuffFile,
    ProtoUser,
    ProtoUserComponent,
    Endpoint,
    MainEndpoint,
    languageFileExtensions,
    // protobuffctl
} = require('./components.js');
//const { protobuffctl } = require("./protobuffctl.js")
//const ProtoFileExtractor=require("./extractors.js")
const { exec } = require('child_process');
const chokidar = require('chokidar');
const { Console } = require('console');
const path = require('path');
const { types } = require('util');
const serialize = require('serialize-javascript');
const fs = require('fs');
const { Protobuffctl } = require("./protobuffctl")
const protobuffctl = new Protobuffctl()
function init() {
    protobuffctl.watcherManager.init();
} function save() {
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
function set(type, name, component_names_and_values, protoFiles, createProtobuff) {
    if (type == "service") {
        setService(name, component_names_and_values, protoFiles, createProtobuff)
        // const proto = protobuffctl.componentRegistry.protoFiles.get(protofile).setService(name,component_names_and_values.false)
        console.log(proto)
    }
}

function getAll(type) {
    const protobuffctl = new Protobuffctl()

    const elements = []
    //   console.log(protobuffctl)
    protobuffctl.componentRegistry[type].forEach((value, key) => {
        console.log(key);
        // Sie können hier auch auf 'value' zugreifen, wenn Sie es benötigen
    });
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
function updateProtoFiles(protoFiles,rescan){
   
    for (file of protoFiles) {
        const proto = protobuffctl.componentRegistry.protoFiles.get(file)
        proto.services
       
        if (this.protobuffFiles != []) {
            for (buff of this.protobuffFiles) {
                buff = protobuffctl.protobuffFiles.get(buff)
                createBuff(buff.lang, buff.out, buff.file_name, buff.file_path,).then(() => {
                })
            }
        }
 else {
        console.warn("no protobuff-file objects! please create those before! flagg ignored ")
        //const buff = new ProtobuffFile(__dirname, this, "ts")
    }

}
}
/**
   * Fügt ein neues Element (Service, Type, Enum) zum Protofile hinzu.
   * @param {string} elementType - Der Typ des Elements (Service, Type, Enum).
   * @param {Object} details - Die Details des Elements, abhängig vom Typ.
   */
function setService(service_name, component_names_and_values, protoFiles, createProtobuff) {
    console.log("SSSSSSSSSSSSSSSSS")
    createProtobuff = createProtobuff === undefined ? false : createProtobuff;
    let element = protobuffctl.componentRegistry.services.get(service_name)
    if (element != undefined) {

    }
    else {
        protobuffctl.componentRegistry.services.set(service_name, [])
        element = protobuffctl.componentRegistry.services.get(service_name)
        for (file of protoFiles){
            protobuffctl.protoFiles.get(file).set("services",service_name)
        }
    }
    for (item of component_names_and_values) {
        const name = item[0]
        const values = item[1]
        protobuffctl.componentRegistry.services.set("methods", { [name]: values });
        element.push(name)
        for (file of protoFiles){
            const proto=protobuffctl.componentRegistry.protoFiles.get(file)
            proto.set("methods",name)
        }
    }
  
    protobuffctl.save()
    protobuffctl.convertToJsonCompatible(__dirname + "/protobuffctl.json")

    if(createProtobuff){
        updateProtoFiles(protoFiles,false)
    }
}




const dir = String(__dirname) + "/helloworld.proto"
//getProto(dir)
module.exports = {
    protobuffctl, init, save, getAll, set, generateProtobuff, createProto, getProto, addWatcher, removeWatcher, stopAll, startAll
};



//const extractor = new ProtoFileExtractor(componentMap);
//const protoFileElements = extractor.extractProtoFileElements();
//console.log(protoFileElements);