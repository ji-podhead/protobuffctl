const {  
    Protobuffctl,
    ProtoFile,
    ProtobuffFile,
    ProtobuffComponent,
    ProtoUser,
    ProtoUserComponent,
    Endpoint,
    MainEndpoint,
    languageFileExtensions
} = require('./classes.js');
const ProtoFileExtractor=require("./extractors.js")
const { ProtobuffGenerator } = require("@ji-podhead/protoc-helper")
const { exec } = require('child_process');
const chokidar = require('chokidar');
const { Console } = require('console');
const fs = require('fs');
const path = require('path');
const generator = new ProtobuffGenerator()
const protobuf = require('protobufjs');
const { types } = require('util');
const dir = String(__dirname) + "/helloworld.proto"
const protobuffctl = new Protobuffctl()
extractTypesFromProtoFile(dir).then(()=>{
    console.log(protobuffctl.componentRegistry)
})
async function getroot(protoFilePath) {
    const root = await protobuf.load(protoFilePath);
    return root
}
function extractTypesFromProtoFile(protoFilePath) {
    return new Promise((resolve, reject) => {
        const parts = protoFilePath.split('/');
        const pathWithoutFileName = parts.slice(0, -1).join('/');
        const partBeforeFileName = parts[parts.length - 1];
        protobuffctl.componentRegistry.protoFilePaths.set(partBeforeFileName, pathWithoutFileName);
        const protoObj = new ProtoFile(partBeforeFileName, [], [], [], []);

        getroot(protoFilePath).then((root) => {
            traverseProtoElements(root, function (obj, type) {
            },protoObj).then(() => {
             //   console.log(protobuffctl.componentRegistry)
                console.log("_____________")
                generateProtobuff(protoObj,"go",__dirname)
                resolve(); // Resolve das Promise mit dem protoObj, wenn alle rekursiven Aufrufe abgeschlossen sind
            }).catch(reject); // Fangen Sie Fehler und leiten Sie sie an das Promise weiter
        }).catch(reject); // Fangen Sie Fehler und leiten Sie sie an das Promise weiter
    });


function traverseProtoElements(current, fn,protoObj) {
    return new Promise((resolve, reject) => {
        // Überprüfen, ob das aktuelle Element eine Instanz von protobuf.Type, protobuf.Service, protobuf.Enum oder protobuf.Namespace ist
        switch (true) {
            case current instanceof protobuf.Type:
                console.log("________TYPE________");
                // Verarbeitung für Typen
                var name = current.name;
                console.log(name);
                jsonObj = current.toJSON();
                const fields = [];
                Object.entries(jsonObj["fields"]).map(([key, val]) => {
                    const cFields = protobuffctl.componentRegistry.fields;
                    const id = name + "_" + key;
                    if (cFields.get(key) == undefined) {
                        cFields.set(id, val);
                    }
                    fields.push(id);
                });
                protobuffctl.componentRegistry.types.set(name, fields);
                protoObj.types.push(name);
                fn(current, 'Type',protoObj);
                break;
            case current instanceof protobuf.Service:
                console.log("________SERVICE________");
                // Verarbeitung für Services
                var name = current.name;
                console.log(name);
                jsonObj = current.toJSON();
                const methods = [];
                Object.entries(jsonObj["methods"]).map(([key, val]) => {
                    const cMethods = protobuffctl.componentRegistry.methods;
                    const id = name + "_" + key;
                    if (cMethods.get(key) == undefined) {
                        cMethods.set(id, val);
                    }
                    methods.push(id);
                });
                protobuffctl.componentRegistry.services.set(name, methods);
                protoObj.services.push(name);
                fn(current, 'Service',protoObj);
                break;
            case current instanceof protobuf.Enum:
                console.log("________Enum________");
                var name = current.name;
                console.log(name);
                jsonObj = current.toJSON();
                const values = [];
                Object.entries(jsonObj["values"]).map(([key, val]) => {
                    const cEnumValues = protobuffctl.componentRegistry.enumValues;
                    const id = name + "_" + key;
                    if (cEnumValues.get(key) == undefined) {
                        cEnumValues.set(id, val);
                    }
                    values.push(id);
                });
                protobuffctl.componentRegistry.enumValues.set(name, values);
                protoObj.enums.push(name);
                fn(current, 'Enum',protoObj);
                break;
            case current instanceof protobuf.Namespace:
                console.log("________Namespace________");
                jsonObj = current.toJSON();
                // Verarbeitung für Namespaces
                fn(current, 'Namespace');
                break;
            default:
                // Standardverarbeitung oder Fehlerbehandlung
                console.log('Unbekannter Typ:', current);
        }
        // Rekursive Iteration über die nestedArray, falls vorhanden
        if (current.nestedArray) {
            Promise.all(current.nestedArray.map(nested => {
                return traverseProtoElements(nested, fn,protoObj);
            })).then(resolve).catch(reject); // Warten Sie auf alle rekursiven Aufrufe, bevor Sie das Promise auflösen
        } else {
            resolve(); // Auflösen des Promises, wenn keine rekursiven Aufrufe vorhanden sind
        }
    });
}
}
function createConfig() {
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
function init(configPath, componentMap) {
    try {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        console.log('Configuration loaded successfully.');
        for (const key in config.components) {
            config.components[key].forEach(jsonObject => {
                const component = deserialize(JSON.stringify(jsonObject), componentMap);
             //   componentMap.get(key).push(component);
            });
        }
        return componentMap;
    } catch (error) {
        console.error('Error initializing:', error);
        throw error;
    }
}
function save(outputPath, componentMap) {
    try {
        const config = {
            watchers: [],
            components: {},
            protopaths: {}
        };
        for (const [key, value] of componentMap.entries()) {
            config.components[key] = value.map(component => component.toJSON());
        }
        const jsonString = JSON.stringify(config, null, 2);
        fs.writeFileSync(outputPath, jsonString, 'utf8');
        console.log(`Configuration saved successfully to ${outputPath}.`);
    } catch (error) {
        console.error('Error saving configuration:', error);
        throw error;
    }
}
function deserialize(jsonString, componentMap) {
    const json = JSON.parse(jsonString);
    const componentType = protobuffctl.componentRegistry.json.type;
    if (!componentType) {
        throw new Error(`Unknown component type: ${json.type}`);
    }
    const fields = Object.keys(json).filter(key => key !== 'type');
    const args = fields.map(field => json[field]);
    return new componentType(...args);
}
function generateProtobuff(protoFile,lang,out) {
   console.log(protoFile)
    const file=protoFile.file
    console.log(file)
    const protoName=protoFile.file.split(".proto")[0]
    console.log(protoName)
    const protobuff_file_name=protoName+".pb."+ languageFileExtensions[lang]["fileExtension"]
    const path=protobuffctl.componentRegistry.protoFilePaths.get(file)
    generator.generateProtobuf(lang,path,file,out)
    protobuffctl.componentRegistry.ProtobuffFilePaths.set(protobuff_file_name,out)
    const protobuffFileObj=new ProtobuffFile(out,file, lang,path,[],[],[],[],[])
    console.log(protobuffFileObj)
    //TODO add obj
}
/**
 * *------------------ addProtobuffUser --------------------- *  
 * This function creates a new ProtobuffUser object  *  and establishes a clear assignment between both components in the component registry, *  acting as a bridge. The 'components' map consists of the name of the prototype or the name *  of the ProtobuffUserComponent, ensuring a direct link between the two within the registry. */
function addProtobuffUser(file, targetProtobuff,targetFields,targetMethods){

    const protobuffUserObj=new ProtoUser()

}


function createProtoComponent(type, ...args) {
    if (!componentMap.has(type)) {
        throw new Error(`Unsupported component type: ${type}`);
    }
    return component;
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

module.exports = {
    protobuffctl, init, save, deserialize, generateProtobuff, createProtoComponent, addWatcher, removeWatcher, stopAll, startAll, createConfig
};


    
    //const extractor = new ProtoFileExtractor(componentMap);
    //const protoFileElements = extractor.extractProtoFileElements();
    //console.log(protoFileElements);