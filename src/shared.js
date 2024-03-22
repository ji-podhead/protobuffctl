const { ProtoFile, ProtobuffFile, ProtoUser, ProtoUserComponent, Endpoint, MainEndpoint, languageFileExtensions, } = require('./components.js');
//const ProtoFileExtractor=require("./extractors.js")
const { exec } = require('child_process');
const path = require('path');
const { addS, childless, deepClone } = require("../util/utils.js")
const fs = require('fs');
const { Protobuffctl } = require("./protobuffctl");
const { getElementsRecoursive, getProtoContent } = require('./protoUtils.js');
const protobuffctl = new Protobuffctl()
/*
*-------------------------- get --------------------
*/
function get(type, name, depth) {
    type = addS(type)
    console.log("get " + type + " " + name)
    depth = Math.abs(depth)
    if (depth == "i") {
        depth = 99999
    }
    else if (depth == undefined) {
        depth = 1
    }
    try {
        let element = protobuffctl.componentRegistry[type].get(name)
        let clone = Object.assign(Object.create(Object.getPrototypeOf(element)), element)            

     //   console.log(clone)
        if (!childless.includes(type)) {
            const elementNew = getElementsRecoursive(clone, name, depth)
            console.log("____________________")
            console.log(JSON.stringify(elementNew))
            return elementNew
        }
        else {
            console.log(clone)
            return clone
        }
    }
    catch (err) {
        console.error("🤕 had err while getting object 🚑 🚨 " + err + " 🚨 🚑")
        return ("🤕  had err while getting object 🚑 🚨 " + err + " 🚨 🚑")
    }
}
function getAll(type, describe, jsonOut) {
    const protobuffctl = new Protobuffctl()
    const keys = []
    try {
        const jsonObject = []
        protobuffctl.componentRegistry[type].forEach((value, key) => {
            keys.push(key)
            describe == false && console.log(key);
            if (describe=="true") {
                obj = get(type, key, "i")
                    jsonObject.push(obj)
            }
        })
        if (describe=="true") {
            console.log(JSON.stringify(jsonObject))
            if (jsonOut=undefined) {
                //fs.writeFileSync(path.join(type, element + ".json"), jsonObject);
            }
            return obj
        }
        else {
            console.log(keys)
            return (keys)
        }
    }
    catch (err) {
        console.error("🤕 had err while looking for object 🚑 🚨 " + err + " 🚨 🚑")
        return ("🤕  had err while looking for object 🚑 🚨 " + err + " 🚨 🚑")
    }

}
function toJson(out, id) {
    if (id != "none") {
        type = protobuffctl.componentRegistry.hashlookupTable(element)
        element = protobuffctl.componentRegistry[type].get(id)
        const elementNew = JSON.stringify(getElementsRecoursive(element, id, depth))
        fs.writeFileSync(path.join(filepath, element + ".json"), obj);
    }
    else {
        if(out=="./" ){out=path.join(__dirname,"protobuffctl.json")}
        console.log("no elment specified, generating flatenned json")
        protobuffctl.convertToJsonCompatible(out)
        
    }
}
/*
*--------------------- create/edit --------------------
*/
function protogenArr(protofiles) {
    const proto = protobuffctl.componentRegistry.protoFiles.get(file)
    for (buff of proto.protobuffFiles) {
        buff = protobuffctl.protobuffFiles.get(buff)
    }
    createBuff(buff.lang, buff.out, buff.file_name, buff.file_path,).then(() => {
    })
}
/**
 * Initializes a new Proto-object or ProtobuffFile in the registry.
 * @example * // Example for creating a ProtoFile
 * create("proto", "example.proto", "/path/to/proto/files");
 * @example * // Example for creating a ProtobuffFile
 * create("protobuff", "example.id", "ts", "/path/to/output");
 * @param {string} type - The type of object to create. Can be "proto" for ProtoFile or "protobuff" for ProtobuffFile.
 * @param {string} arg1 - The first argument, which is the file name for "proto" type or the protoFile ID for "protobuff" type.
 * @param {string} arg2 - The second argument, which is the file path for "proto" type or the language for "protobuff" type.
 * @param {string} arg3 - The third argument, which is the output path for "protobuff" type.
 * @param {string} arg4 - The fourth argument, which is not used in the current implementation.
  */
function create(type, arg1, arg2, arg3, arg4) {
    switch (type) {
        case ("proto"):
            console.log(arg1)
            try {
                const file = arg1; const folder_path = arg2
                console.log((file));
                if (typeof (file) != "string" || typeof (folder_path) != "string") {
                    return console.error("🤕 wrong arguments! arguments are\n arg1: <string> - file-name. \n arg2: <string> - folder_path")
                }
                                // Überprüfen, ob die Datei existiert
                const abs=path.join(folder_path,file)
                if (!fs.existsSync(abs)) {
                    // Die Datei existiert nicht, also erstellen Sie sie mit baseProto
                    const base= path.basename(file,".proto")
                    const baseProto = `
syntax="proto3";
option java_multiple_files = true;
option java_package = "./";
option java_outer_classname = "${base}";
option objc_class_prefix = "HLW";
option go_package = "./";

package ${base};`;
                    fs.writeFileSync(abs, baseProto);
                    console.log("empty proto file was created: " + abs);
                } else {
                    console.log("using existing protoFile: " + abs);
                }
                const proto = new ProtoFile(file, folder_path)
                return proto
            }
            catch (err) {
                console.error("🤕 had err while creating proto: 🚑 🚨 " + err + " 🚨 🚑")
                return err
            }
        case ("protobuff"): {
            let protoFile = arg1; let lang = arg2; let out = arg3
            if (typeof (protoFile) != "string" || typeof (lang) != "string" || typeof (out) != "string") {
                return console.warn("🤕 wrong arguments! arguments are\n arg1: <string> - proto-id. \n arg2: <string> - language,\n arg3: <string> - output_folder_path")
            }
            try {
                if(out=="./" ){out=path.join(__dirname)}
                
                console.log(protobuffctl.componentRegistry.protoFiles)
                type = protobuffctl.componentRegistry.hashlookupTable.get(protoFile)
                console.log(type)
                protoObj = protobuffctl.componentRegistry[type].get(protoFile)

                console.log(protoObj)
                console.log(out)
                //getProtoContent(protoObj, true)
                const buff = new ProtobuffFile(out, protoObj, lang)
                console.log("successuflly created protobuff file 🤑🤑🤑 ")
                return buff
            } catch (err) {
                console.error("🤕 we had an err:  🚑 🚨 " + err + " 🚨 🚑"); return err
            }
        }
    }
}
function createFromConfig(protoFiles) {

}

function remove(type, name, values, pull) {

}
function add(type, name, values, pull) {

}
//update the protofiles and protobuffs
function pull(protoFiles, remove_missing) {

}//update the registry if protos have changed
function push(protoFiles, remove_missing) {
    for (file of protoFiles) {

    }
}
/*
*------------------------ watchers --------------------
*/
function addWatcher() {
    protobuffctl.watcherManager.addWatcher(filePath);
}
function removeWatcher(filePath) {
    protobuffctl.watcherManager.removeWatcher(filePath);
}
function stopAllWatchers() {
    protobuffctl.watcherManager.stopAllWatchers();
}
function startAllWatchers() {
    protobuffctl.watcherManager.startAllWatchers();
}
/*
*------------------------ exports --------------------
*/
module.exports = {
    getAll, remove, add, protogenArr, pull, push, createFromConfig, get, toJson, create, addWatcher, removeWatcher, stopAll: stopAllWatchers, startAll: startAllWatchers,
};
/*_______________________________________________________________
*                           E N D 
_______________________________________________________________*/

/*
       fs.writeFile(__dirname+"/test.json", str, (err) => {

       
       })
       return
       const  string=generateProtoFromServices(elementNew)
       writeAndReplaceProto(file.absolute_path,type,name,string)
       fs.copyFile(sourceFilePath, destinationFilePath, (err) => {
       if (err) {
           console.error('Fehler beim Kopieren der Datei:', err);
           return;
       }
       console.log('copied your file');
       });

       fs.copyFile(sourceFilePath, destinationFilePath, (err) => {
       if (err) {
           console.error('Fehler beim Kopieren der Datei:', err);
           return;
       }
       replaceMessageNamesInProtoFile(this.absolute_path,this.id+"_")
       console.log('copied your file');
       });
       return (proto)
       */