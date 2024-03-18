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
const serialize = require('serialize-javascript');
const { addS, childless,deepClone } = require("../util/utils.js")
const fs = require('fs');
const { Protobuffctl, set: setParam } = require("./protobuffctl")
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

//const arch={
//    endPoint,
//    protofile,
//    protobuffFile,
//    serivce,
//    method,
//    type,
//    field,
//    enum
//}
function writeAndAddProto(abs_path, type, name, string) {
    fs.readFile(abs_path, 'utf8', (err, data) => {
        if (err) {
            console.error('Fehler beim Lesen der .proto-Datei:', err);
            return;
        }
        // Fügen Sie den neuen Inhalt am Ende der Datei hinzu
        const updatedData = data + '\n' + string;
        console.log(updatedData);
        fs.writeFile(abs_path, updatedData, 'utf8', (err) => {
            if (err) {
                console.error('Fehler beim Speichern der .proto-Datei:', err);
                return;
            }
            console.log('Die .proto-Datei wurde erfolgreich aktualisiert.');
        });
    });
}
function writeAndReplaceProto(abs_path,type,name,string){
    fs.readFile(abs_path, 'utf8', (err, data) => {
     if (err) {
        console.error('Fehler beim Lesen der .proto-Datei:', err);
        return;
     }
     const updatedData = data.replace(new RegExp(`${type} ${name}.*?\n\n`, 's'), string);     
     console.log(updatedData)
     fs.writeFile(abs_path, updatedData, 'utf8', (err) => {
        if (err) {
          console.error('Fehler beim Speichern der .proto-Datei:', err);
          return;
        }
        console.log('Die .proto-Datei wurde erfolgreich aktualisiert.');
     });
    });
}
function generateProtoFromServices(services) {
    let protoContent = '';
    console.log(services)
    services=services["services"];
    console.log(services)
    services.map(service => {
        const serviceName = Object.keys(service)[0];
        const methods = service[serviceName];
        protoContent += `service ${serviceName} {\n`;
        methods.forEach(method => {
            const methodName = Object.keys(method)[0];
            const methodDetails = method[methodName];
            let methodSignature = ` rpc ${methodName} (`;
            methodSignature += `${methodDetails.requestType}) returns (`;
            if (methodDetails.responseStream) {
                methodSignature += `stream ${methodDetails.responseType}) {}`;
            } else {
                methodSignature += `${methodDetails.responseType}) {}`;
            }
            protoContent += methodSignature + '\n';
        });
        protoContent += '}\n\n';
    });
    return protoContent;
}
/**
 * Sets or updates a component within the Protobuf project management system.
´
 * @param {string} type - The type of component to be set or updated. This could be
 *                        'service', 'method', 'type', etc.
 * @param {string} name - The name of the specific component within the given type.
 * @param {string|Array|Object} values - The values to be assigned to the component.
 *                                     This can be a single value, an array of values, or an object.
 * @example
 * // Set a service named 'Greeter' with the method 'SayHello'
 * set('service', 'Greeter', 'SayHello');
 * @example
 * // Set a method named 'SayHello' with multiple types
 * set('method', 'SayHello', ['type1', 'type2']);
 * @returns {void}
 * @throws {Error} Will throw an error if the type is not recognized or if the component
 *                 cannot be found or updated.
 */
function set(type, name, values) {
    setParam(type, name, values)
}
function getElementsRecoursive(element,name,depth) {
   console.log(element)
    console.log("------------------------------")
    if (Array.isArray(element) ) {
        element.map((item,index) => {
        if (typeof item === "object" && item !== null) {
         console.log (  item.key)
         console.log(item.value)
         const type=protobuffctl.componentRegistry.hashlookupTable.get(item.key)
         console.log(type)
         if(childless.includes(type)){ 
            console.log(item)
            item = Object.values(item)[0];
            const child=protobuffctl.componentRegistry[type].get(item.key)
              console.log(child)
              item= getElementsRecoursive(child)
              element[index]=item
              console.log(item)
              console.log(element)
              return item
          }
        }else{
            const type=protobuffctl.componentRegistry.hashlookupTable.get(item)
            const child=protobuffctl.componentRegistry[type].get(item)
            console.log(child)
            if(childless.includes(type)){
                item=child
                console.log(Object.values(item)[0])

                element[index]=item
                console.log(item)
                console.log(element)
            return     item
            }
            else{
                item = getElementsRecoursive(child)
                element[index]=item
                console.log(item)
                console.log(element)
                return item
            }
        }
        })
        console.log("______________")
        console.log(element)
        return {[name]:element}
    }
    else if (typeof element === "object" && element !== null) {
       console.log(element)
       Object.entries(element).forEach(([key, value]) => {        
        console.log(key)
        if(typeof(value)=="string"){
            return element[key]=value
        }
        else if (Array.isArray(value)){
            
            item= getElementsRecoursive(value,depth -1)
            element[key]=item
            return item
        }
        else{
            const type=protobuffctl.componentRegistry.hashlookupTable.get(item.key)
            console.log(type)
            if(childless.includes(type)){ 
               console.log(item)
               item = Object.values(item)[0];
               //const child=protobuffctl.componentRegistry[type].get(key)
               element[key]=child
               console.log(child)
                 return item
             }
             else{
                //item = Object.values(item)[0];
                item= getElementsRecoursive({[key]:value})
                element[key]=item
                console.log(element)
                console.log(child)
                return item
             }

        }
        
    })
    return element
    }
    else{
        console.log(element)
        return element
    }
}

function get(type, name, depth) {
    type = addS(type)
    console.log("get " + type +  " " + name   )
    depth = Math.abs(depth)
    if (depth == "i") {
        depth = 99999
    }
    else if (depth == undefined) {
        depth = 1
    }
    let element = protobuffctl.componentRegistry[type].get(name)
    console.log(element)
    if(!childless.includes(type)){
        const elementNew = {[type]:[getElementsRecoursive(element,name,depth)]}
        console.log("____________________")
        console.log(JSON.stringify(elementNew))
        //const  string=generateProtoFromServices(elementNew)
        //let namesplit=name.split("_")
        //namesplit=namesplit[0]+"_"+namesplit[1]
        //console.log(namesplit)
        //const file = protobuffctl.componentRegistry.protoFiles.get(namesplit)
        //console.log(file)
        //writeAndReplaceProto(file.absolute_path,type,name,string)
        return elementNew
    }
    else{
        console.log(element)
        return element
    }
}
function getAll(type, depth) {
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
     //   const protoObject= get("protoFile",proto.id,"i")
        const str=(JSON.stringify(protoObject))  
        console.log(str)
        return
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
function updateProtoFiles(protoFiles, rescan) {
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
/*

function setService(type, name, values, protoFiles, createProtobuff) {
    console.log("SSSSSSSSSSSSSSSSS")
    createProtobuff = createProtobuff === undefined ? false : createProtobuff;
    let element = protobuffctl.componentRegistry[type].set(values)
    if (element != undefined) {
    }
    else {
        protobuffctl.componentRegistry[type].set(service_name, [])
        element = protobuffctl.componentRegistry.services.get(service_name)
        for (file of protoFiles) {
            protobuffctl.protoFiles.get(file).set("services", service_name)
        }
    }
    for (item of component_names_and_values) {
        const name = item[0]
        const values = item[1]
        protobuffctl.componentRegistry.services.set("methods", { [name]: values });
        element.push(name)
        for (file of protoFiles) {
            const proto = protobuffctl.componentRegistry.protoFiles.get(file)
            proto.set("methods", name)
        }
    }
    protobuffctl.save()
    protobuffctl.convertToJsonCompatible(__dirname + "/protobuffctl.json")

    if (createProtobuff) {
        updateProtoFiles(protoFiles, false)
    }
}
*/



const dir = String(__dirname) + "/helloworld.proto"
//getProto(dir)
module.exports = {
    protobuffctl, init, save, getAll, get, set, generateProtobuff, createProto, getProto, addWatcher, removeWatcher, stopAll, startAll,writeAndAddProto,writeAndReplaceProto,   generateProtoFromServices
};



//const extractor = new ProtoFileExtractor(componentMap);
//const protoFileElements = extractor.extractProtoFileElements();
//console.log(protoFileElements);