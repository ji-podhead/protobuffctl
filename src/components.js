// TO DO !!!!! 
// >>>> USE PATH LIBARY FOR WINDOWS USERS!!!   <<<<
// Funktion, um zu überprüfen, ob ein Pfad ein Unterordner eines anderen Pfades ist
const chokidar = require('chokidar');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const { ProtobuffGenerator } = require("protoc-helper")
const { classDescriptions } = require("../descriptions/classdescriptions")
const { Protobuffctl,set } = require("./protobuffctl")
const { getUniqueName, isSubdirectory, prototypes, languageFileExtensions,mergeFields, initObject } = require("../util/utils")
const protobuf = require('protobufjs');
const protobuffctl = new Protobuffctl()
generator = new ProtobuffGenerator()
async function createBuff(lang,out,file_name, file_path){
    
    return new Promise((resolve,reject)=>{

        new ProtobuffGenerator().generateProtobuff(lang,out,file_name, file_path  )
        resolve()      
    }).catch((err)=>console.log("failed to create buff " +err))

}


async function updateProtoFile(protoFilePath, newElements) {
    try {
        // Schritt 1: Laden des Protofiles
        const root = await protobuf.load(protoFilePath);

        // Schritt 2: Hinzufügen oder Aktualisieren von Elementen
        // Hier ist ein Beispiel, wie Sie einen neuen Service hinzufügen könnten
        // Sie müssten die Logik anpassen, um die spezifischen Elemente zu aktualisieren, die Sie hinzugefügt haben
        const newService = root.add({
            name: 'MyNewService',
            type: 'service',
            methods: {
                myMethod: {
                    requestType: 'MyRequestType',
                    responseType: 'MyResponseType',
                },
            },
        });

        // Schritt 3: Speichern des Protofiles
        // `protobufjs` bietet keine direkte Methode zum Speichern von Änderungen im Protofile.
        // Sie müssen die Änderungen manuell in das Protofile schreiben.
        // Hier ist ein einfaches Beispiel, wie Sie das tun könnten:
        const updatedProtoContent = root.toDescriptor('proto3');
        fs.writeFileSync(protoFilePath, updatedProtoContent);

        console.log('Protofile erfolgreich aktualisiert.');
    } catch (error) {
        console.error('Fehler beim Aktualisieren des Protofiles:', error);
    }
}

// Beispielaufruf der Funktion
//updateProtoFile('/path/to/your/protofile.proto', { /* neue Elemente */ });
/**         ------------------ ProtoFile ---------------------    
 * @description ${classDescriptions.ProtoFile.description}
 */
class ProtoFile {
    constructor(file_name, file_path, services, methods, types, enums,fields, protobuffFiles, protobuffComponents, protoUserComponent, id) {
        this.absolute_path= path.join(file_path,file_name)
        this.services=services;this.methods=methods;this.types=types;this.enums=enums;this.protobuffFiles=protobuffFiles;this.protobuffComponents=protobuffComponents;this.protoUserComponent=protoUserComponent;this.id=id;
        initObject(this,["services","methods","types","enums","fields","protobuffFiles","protobuffComponents","protoUserComponent"])
        console.log("creating " + this.absolute_path)
        this.id = file_name+"_"+getUniqueName(protobuffctl.componentRegistry.protoFiles, file_name);
        console.log("___________________  ")
        console.log(this.id)
        const existingProtoFile = Array.from(protobuffctl.componentRegistry.protoFiles.values()).find(
            protoFile => protoFile.absolute_path=== this.absolute_path
        );
        this.file_name = file_name
        this.file_path = file_path

        this.extractTypesFromProtoFile(this.absolute_path).then(() => {
            //console.log(protobuffctl.componentRegistry)
            if (existingProtoFile != undefined) {
                mergeFields(this,existingProtoFile,["services","methods","types","enums","protobuffFiles","protobuffComponents","protoUserComponent"])
                this.id=existingProtoFile.id
            }
            else{
                protobuffctl.componentRegistry.protoFilePaths.set(this.id, this.absolute_path);
                protobuffctl.componentRegistry.protoFiles.set(this.id,this)
            }
            const buff = new ProtobuffFile(__dirname, this, "ts")
        })
    }
    async getroot(protoFilePath) {
        const root = await protobuf.load(protoFilePath);
        return root
    }

  
   
    extractTypesFromProtoFile(protoFilePath) {
        return new Promise((resolve, reject) => {

            this.getroot(protoFilePath).then((root) => {
                this.traverseProtoElements(root, function (obj, type) {
                }, this).then(() => {
                    //   console.log(protobuffctl.componentRegistry)
                    console.log("_____________")
                    protobuffctl.save()
                    resolve();
                }).catch(reject);
            }).catch(reject);
        });
    }
    traverseProtoElements(current, fn) {
        return new Promise((resolve, reject) => {
            // Überprüfen, ob das aktuelle Element eine Instanz von protobuf.Type, protobuf.Service, protobuf.Enum oder protobuf.Namespace ist
            const jsonObj = current.toJSON();
            switch (true) {
                case current instanceof protobuf.Type:
                    console.log("________TYPE________");
                    // Verarbeitung für Typen
                    var name = current.name;
                    console.log(name);
                    const fields = [];
                    Object.entries(jsonObj["fields"]).map(([key, val]) => {
                        //const cFields = protobuffctl.componentRegistry.fields;
                        const id =  key;
                        set("fields",id,val)
                        //if (cFields.get(key) == undefined) {
                        //    cFields.set(id, {name:val});
                        //}
                        fields.push(id);
                    });
                    set("types",name,fields)
                    //protobuffctl.componentRegistry.types.set(name, fields);
                    this.fields.push(fields)
                    this.types.push(name);
                    fn(current, 'Type');
                    break;
                case current instanceof protobuf.Service:
                    console.log("________SERVICE________");
                    // Verarbeitung für Services
                    var name = current.name;
                    console.log(name);
                    const methods = [];
                    Object.entries(jsonObj["methods"]).map(([key, val]) => {
                       // const cMethods = protobuffctl.componentRegistry.methods;
                        const id =  key;
                        set("methods",id,val)
                        methods.push(id);
                    });
                  //  protobuffctl.componentRegistry.services.set(name, methods);
                    set("services",name,methods)
                    this.methods.push(methods)
                    this.services.push(name,methods);
                    fn(current, 'Service');
                    break;
                case current instanceof protobuf.Enum:
                    console.log("________Enum________");
                    var name = current.name;
                    console.log(name);
                    const values = [];
                    Object.entries(jsonObj["values"]).map(([key, val]) => {
                       // const cEnumValues = protobuffctl.componentRegistry.enumValues;
                        const id =  key;
                        //if (cEnumValues.get(key) == undefined) {
                        //    cEnumValues.set(id, val);
                        //}
                        set("enumvalues",id,val )
                        values.push(id);
                    });
                    //protobuffctl.componentRegistry.enumValues.set(name, values);
                    set("enums",name,values)
                    this.enums.push(name);
                    fn(current, 'Enum');
                    break;
                case current instanceof protobuf.Namespace:
                    console.log("________Namespace________");
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
                    return this.traverseProtoElements(nested, fn);
                })).then(resolve).catch(reject); // Warten Sie auf alle rekursiven Aufrufe, bevor Sie das Promise auflösen
            } else {
                resolve(); // Auflösen des Promises, wenn keine rekursiven Aufrufe vorhanden sind
            }
        });
    }
}
class ProtobuffComponent {
    constructor(name, client, method, args, returns, line, protoBuffFile, ProtoFile) {
        this.name = name;
        this.client = client;
        this.method = method;
        this.args = args;
        this.returns = returns;
        this.line = line;
        this.protoBuffFile = protoBuffFile;
        this.ProtoFile = ProtoFile;
    }
}
/**         ------------------ ProtobuffFile ---------------------    
 * @description ${classDescriptions.ProtobuffFile.description}
 */
class ProtobuffFile {
    constructor(out, protoFile, lang) {
        this.out = out;
        this.protoFile = protoFile.id;
        this.lang = lang;
        this.protoUsers = [];
        this.protobuffComponents = []; // { name, client, method, args, returns, line, protoBuffFile, ProtoFile }
        this.file_name = path.basename(protoFile.file_name,".proto")+languageFileExtensions[lang]["fileExtension"]
        this.absolute_path = path.join(out,this.file_name)
        const existingProtobuffFile = Array.from(protobuffctl.componentRegistry.protobuffFiles.values()).find(
            protobuffFile => protobuffFile.file_name === this.file_name && protobuffFile.absolute_path === this.absolute_path
        );
        this.id = existingProtobuffFile ? existingProtobuffFile.id : this.file_name+"_"+getUniqueName(protobuffctl.componentRegistry.protobuffFiles, this.file_name);
        protobuffctl.componentRegistry.protobuffFiles.set(this.id, this);
        protobuffctl.componentRegistry.protobuffFilePaths.set(this.id, this.absolute_path);
        const endPoint = new Endpoint({ lang: this.lang, file_path: this.absolute_path, protoUsers: [this.protoUsers], protobuffFiles: [this.id], protoFiles: [this.protoFile] })
        this.endPoint=endPoint.id
        try {
            createBuff(this.lang, this.out,protoFile.file_name, protoFile.file_path,  ).then(()=>{
                protobuffctl.save()
                protobuffctl.convertToJsonCompatible(__dirname+"/protobuffctl.json")
        
                console.log(protobuffctl)
            })
        } catch (err) {
            console.log("error while creating ProtobuffFile" + err);
            return err;
        }
    }
    generateProtobuff() {
       
    }

    generateProtobuffComponent(protobuffFile, protoFile, service, method) {
        const protobufComponent = new ProtobuffComponent();
       // protobuffctl.save()
    }
}
/**         ------------------ ProtobuffUser ---------------------    
 * @description ${classDescriptions.ProtobuffUser.description}
 */
class ProtoUser {
    constructor(name, path, lang, protobuffComponents, protoUserComponent) {
        const protoUserPath = path + "/" + name;
        console.log("creating " + protoUserPath);
        const uniqueId = getUniqueName(protobuffctl.componentRegistry.protoUsers, name);
        console.log("___________________ ");
        console.log(uniqueId);
        const existingProtoUser = Array.from(protobuffctl.componentRegistry.protoUsers.values()).find(
            protoUser => protoUser.name === name && protoUser.path === path
        );
        this.id = existingProtoUser ? existingProtoUser.id : uniqueId;
        this.name = name;
        this.path = existingProtoUser ? existingProtoUser.path : path || [];
        this.lang = lang;
        this.protobuffComponents = existingProtoUser ? existingProtoUser.protobuffComponents : protobuffComponents || [];
        this.protoUserComponent = existingProtoUser ? existingProtoUser.protoUserComponent : protoUserComponent || [];

        if (existingProtoUser === undefined) {
            protobuffctl.componentRegistry.protoUserPaths.set(name, path);
            this.path = protobuffctl.componentRegistry.protoUserPaths.get(name);
        }
        protobuffctl.componentRegistry.protoUsers.set(name, this);
    }
}
/**         ------------------ ProtobuffUserComponent ---------------------    
 * @description ${classDescriptions.ProtobuffUserComponent.description}
 */
//componentID->client->request&callback -> args
class ProtoUserComponent {
    constructor(id, protobuffComponent, callback, lang, file_name ) {
        this.protobuffComponent = protobuffComponent
        this.callback = callback
        this.file_name= file_name
        this.id = id //name/field of the function needs to be atomar like serviceeUser_1 
        this.lang = lang;
    }
}
/**         ------------------ Endpoint ---------------------    
 * @description creates a new Endpoint and will check for parent-, or child-endpoints and merge if so
 */
class Endpoint {
    constructor({ lang, file_path, protoUsers, protobuffFiles, protoFiles }) {
        let finalObject
        let isParent = false
        this.path = path.dirname(file_path)
        const folder = path.basename(this.path)
        this.lang = lang
        let tempID = lang + "_" + folder + "_"
        this.id = tempID + getUniqueName(protobuffctl.componentRegistry.endPoints, tempID)
        this.protobuffFiles = protobuffFiles
        this.protoUsers = protoUsers
        this.protoFiles = protoFiles
        for (const point of protobuffctl.componentRegistry.endPoints.values()) {
            if (point.lang === lang) {
                // merge because of same directory
                if (point.path == this.path) {
                    mergeFields(this,finalObject,["protoUsers","protobuffFiles","protoFiles"])
                    this.id= finalObject.id
                    break
                }
                else {
                    const a = isSubdirectory(this.path, point.path)
                    if (a < 2) {
                        finalObject = point
                        if (a == 0) {
                            isParent = true
                        }
                        break
                    }
                }
            }
        }
        if (finalObject) { // merge because is parent or child
            mergeFields(this,finalObject["protoUsers","protobuffFiles","protoFiles"])
            this.path=isParent ? this.path : finalObject.path
            this.id=isParent ? this.id : finalObject.id
        }
        protobuffctl.componentRegistry.endPoints.set(this.id, this)
    }
}

/// ---------------------------- exports ------------------------------------
module.exports = {
    ProtoFile,
    ProtobuffComponent,
    ProtobuffFile,
    ProtobuffComponent,
    ProtoUser,
    ProtoUserComponent,
    Endpoint,
    protobuffctl,
    languageFileExtensions
};

//_____________________________________________________________________________________

//                                    E   N   D
//_____________________________________________________________________________________

// ---------------------------- SINGLETON ------------------------------------
/**         ------------------ MainEndpoint ---------------------    
 * @description ${classDescriptions.MainEndpoint.description}
 */
class MainEndpoint extends Endpoint {
    constructor(protoFiles, protobuffFiles, name, index, path, buildTarget) {
        super(protoFiles, protobuffFiles, name, index, path);
        this.buildTarget = buildTarget; // Additional property for the build target
    }
}
