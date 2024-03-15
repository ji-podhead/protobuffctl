const chokidar = require('chokidar');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const { ProtobuffGenerator } = require("protoc-helper")
const { classDescriptions } = require("./descriptions/classdescriptions")
const {Protobuffctl} = require("./protobuffctl")
const{getUniqueName,isSubdirectory,splitPath,joinPath,prototypes,languageFileExtensions}= require("./utils")
const protobuf = require('protobufjs');
const protobuffctl = new Protobuffctl()

generator=new ProtobuffGenerator()
// TO DO !!!!! 
// >>>> USE PATH LIBARY FOR WINDOWS USERS!!!   <<<<
// Funktion, um zu überprüfen, ob ein Pfad ein Unterordner eines anderen Pfades ist


// ---------------------------- OOP ------------------------------------
// EXAMPLES NUR FÜR PROTO. js code wird automatisch erzeugt
/**         ------------------ ProtoFile ---------------------    
 * @description ${classDescriptions.ProtoFile.description}
 */
class ProtoFile {
    constructor(file, path, services, methods, types, enums, protobuffFiles, protobuffComponents, protoUserComponent,id) {
        const protoFilePath=path+"/"+file
        console.log("creating " + protoFilePath)
        const uniqueId = getUniqueName(protobuffctl.componentRegistry.protoFiles,file);
       console.log("___________________  ")
       console.log( uniqueId)
        const existingProtoFile = Array.from(protobuffctl.componentRegistry.protoFiles.values()).find(
            protoFile => protoFile.file === file && protoFile.path === path
        );
        this.id = existingProtoFile ? existingProtoFile.id : id? id: uniqueId;
        this.services = existingProtoFile ? existingProtoFile.services : services || [];
        this.methods = existingProtoFile ? existingProtoFile.methods : methods || [];
        this.types = existingProtoFile ? existingProtoFile.types : types || [];
        this.enums = existingProtoFile ? existingProtoFile.enums : enums || [];
        this.protobuffFiles = existingProtoFile ? existingProtoFile.protobuffFiles : protobuffFiles || [];
        this.protobuffComponents = existingProtoFile ? existingProtoFile.protobuffComponents : protobuffComponents || [];
        this.protoUserComponent = existingProtoFile ? existingProtoFile.protoUserComponent : protoUserComponent || [];
        this.file=file
        this.path = existingProtoFile ? existingProtoFile.path : path || [];

        if(existingProtoFile!=undefined){
        
        }
        else{
            protobuffctl.componentRegistry.protoFilePaths.set(file, path);
            this.path=protobuffctl.componentRegistry.protoFilePaths.get(file)
        }
        
        protobuffctl.componentRegistry.protoFiles.set(file, this);

        this.extractTypesFromProtoFile(protoFilePath).then(()=>{
            console.log(protobuffctl.componentRegistry)
            const buff = new ProtobuffFile(__dirname,this,"ts")
            
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
                },this).then(() => {
                 //   console.log(protobuffctl.componentRegistry)
                    console.log("_____________")
                    protobuffctl.save()
                 //   generateProtobuff(this,"go",__dirname)
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
                        const cFields = protobuffctl.componentRegistry.fields;
                        const id = name + "_" + key;
                        if (cFields.get(key) == undefined) {
                            cFields.set(id, val);
                        }
                        fields.push(id);
                    });
                    protobuffctl.componentRegistry.types.set(name, fields);
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
                        const cMethods = protobuffctl.componentRegistry.methods;
                        const id = name + "_" + key;
                        if (cMethods.get(key) == undefined) {
                            cMethods.set(id, val);
                        }
                        methods.push(id);
                    });
                    this.methods.push(methods)
                    protobuffctl.componentRegistry.services.set(name, methods);
                    this.services.push(name);
                    fn(current, 'Service');
                    break;
                case current instanceof protobuf.Enum:
                    console.log("________Enum________");
                    var name = current.name;
                    console.log(name);
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
        this.protoFile = protoFile;
        this.lang = lang;
        this.protoUsers = [];
        this.protobuffComponents = []; // { name, client, method, args, returns, line, protoBuffFile, ProtoFile }
        console.log(protoFile)
        this.protoName = protoFile.file.split(".proto")[0];
        this.file_name = this.protoName + ".pb" + languageFileExtensions[lang]["fileExtension"];
        this.path =  out + "/" + this.file_name;
        try {
            this.generateProtobuff();
        } catch (err) {
            console.log("error while creating ProtobuffFile");
            return err;
        }
        const existingProtobuffFile = Array.from(protobuffctl.componentRegistry.protobuffFiles.values()).find(
            protobuffFile => protobuffFile.file_name === this.file_name && protobuffFile.path === this.path
        );
        this.id = existingProtobuffFile ? existingProtobuffFile.id : getUniqueName(protobuffctl.componentRegistry.protobuffFiles, this.file_name);
       console.log(protobuffctl.componentRegistry.protobuffFilePaths)
        protobuffctl.componentRegistry.protobuffFiles.set(this.id, this);
        protobuffctl.componentRegistry.protobuffFilePaths.set(this.id, this.path);
        const endPoint = new Endpoint({lang:this.lang,path:this.path, protoUsers:[this.protoUsers],protobuffFiles:[this],protoFiles:[this.protoFile]})
        console.log(protoFile);
        console.log(this.file_name);
        console.log(this.protoName);
        console.log(this.endPoint);
        protobuffctl.save()
        console.log(protobuffctl)
    }
    generateProtobuff() {
        console.log(
            this.lang+"\n"+ this.protoFile.path+"\n"+ this.protoFile.file+"\n"+ this.out
        )
        generator.generateProtobuf(this.lang, this.protoFile.path, this.protoFile.file, this.out);
        protobuffctl.save()
    }

    generateProtobuffComponent(protobuffFile, protoFile, service, method) {
        const protobufComponent = new ProtobuffComponent();
        protobuffctl.save()
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
    constructor(id,protobuffComponent,callback,lang,file) {
       this.protobuffComponent=protobuffComponent
       this.callback=callback
       this.file =file
       this.id=id //name/field of the function needs to be atomar like serviceeUser_1 
       this.lang=lang;    
    }
}

/**         ------------------ Endpoint ---------------------    
 * @description creates a new Endpoint and will check for parent-, or child-endpoints and merge if so
 */
class Endpoint {
    merge(finalpath, point){
        this.path=finalpath
        this.id=point.id
        this.protobuffFiles=Array.concat(point.protoBuffFiles,this.protobuffFiles)
        this.protoUsers=Array.concat(point.protoUsers,this.protoUsers)
        this.protoFiles=Array.concat(point.protoFiles,this.protoFiles)
        protobuffctl.componentRegistry.endPoints.set(point.id, this)
    }
    constructor({lang,path,protoUsers,protobuffFiles,protoFiles}) {
        let finalObject
        let isParent=false
        let splittedPath=splitPath(this.path).slice(0,-1)
        const folder = splittedPath[splittedPath.length-1]
        path=joinPath(splittedPath) 
        this.lang=lang
        let tempID=lang+"_"+folder+"_"
        tempID = tempID+getUniqueName(protobuffctl.componentRegistry.endPoints)
        this.path=path
        this.id=tempID;
        this.protobuffFiles=protobuffFiles 
        this.protoUsers=protoUsers 
        this.protoFiles=protoFiles
        for (const point of protobuffctl.componentRegistry.endPoints.values()) {
            if (point.lang === lang) {
                // merge because of same directory
                if(point.path==path){
                    this.merge(path,point)
                break
                }
                else{ 
                    const a =isSubdirectory(path,point.path)
                    if(a<2){
                    finalObject=point    
                    if (a==0){
                        isParent=true
                    }
                    break
                }
                }
           }
        }
        if (finalObject) { // merge because is parent or child
       
            this.merge(isParent?path:point.path,finalObject)
       
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
class CustomMap extends Map {
    constructor(callback) {
        super();
        this.callback = callback;
    }

    set(key, value) {
        // Führen Sie die Callback-Funktion aus, bevor der Wert gesetzt wird
        this.callback(key, value);
        // Rufen Sie die ursprüngliche set-Methode auf
        super.set(key, value);
    }
}