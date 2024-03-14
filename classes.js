const chokidar = require('chokidar');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const { ProtobuffGenerator } = require("@ji-podhead/protoc-helper")
const { classDescriptions } = require("./descriptions/classdescriptions")
const {Protobuffctl} = require("./protobuffctl")
const protobuf = require('protobufjs');
const protobuffctl = new Protobuffctl()

// TO DO !!!!! 
// >>>> USE PATH LIBARY FOR WINDOWS USERS!!!   <<<<

//also irgendwie versteh ich mein code hier nicht. ich nehme eine map und package zum klassennahmen die methods rein, aber vorher gucke ich in der registry nach ob die methods schon existieren, adde sie dann aber nicht dazu falls nicht, also wird das niemals wahr sein.
//was mich aber viel  mehr stört ist, das ich später die mthoden in der protouser und protobufffile brauche. naja eigentlich auch nicht so wirklich, dann ist ein callback/request immer erstmal einem service zugewiesen und hat zusätzlich ein unterpunkt method. aber ich wollte in der protouser sektion eigentlich codespezifische namen nehmen wie client, request. was für ein type das ist, ist ja dem anderen server egal... hmm naja nicht wenn der ein genaues objekt erwartet. ich kann das ja so machen 
//dann hat die registry kein methods feld, aber eine art übersetzung dazu
//also wir halten fest: in der protoregistry sind die methods den services untergeordnet und haben kein eigenes feld. das wäre ja schwachsinning, aber wir können  noch eine gesammtliste machen, wo wir das für suchfunktionen übernehmen können, das ist dann aber nicht codespezifisch zu verwenden, (bzw nur beim erstellen neuer types durch kopie) weil das die struktur und die typensicherheit gefährden würde. ich wollte das uhrsprünglich machen damit unterschiedliche services auf den selben method pointen können, aber das geht ja mit protofiles eh nicht oder?
// ---------------------------- STATIC ------------------------------------
const prototypes = ["double", "float", "int32", "int64", "uint32", "uint64", "sint32", "sint64", "fixed32", "fixed64", "sfixed32", "sfixed64", "bool", "string", "bytes"]
const languageFileExtensions = {
    go: {
        fileExtension: '.go',
        command: '--go_out'
    },
    java: {
        fileExtension: '.java',
        command: '--java_out'
    },
    python: {
        fileExtension: '.py',
        command: '--python_out'
    },
    csharp: {
        fileExtension: '.cs',
        command: '--csharp_out'
    },
    ruby: {
        fileExtension: '.rb',
        command: '--ruby_out'
    },
    objc: {
        fileExtension: '.m',
        command: '--objc_out'
    },
    php: {
        fileExtension: '.php',
        command: '--php_out'
    },
    dart: {
        fileExtension: '.dart',
        command: '--dart_out'
    },
    rust: {
        fileExtension: '.rs',
        command: '--rust_out'
    },
    swift: {
        fileExtension: '.swift',
        command: '--swift_out'
    },
    kotlin: {
        fileExtension: '.kt',
        command: '--kotlin_out'
    },
    scala: {
        fileExtension: '.scala',
        command: '--scala_out'
    },
    js: {
        fileExtension: '.js',
        command: '--js_out'
    }
};
function getUniqueName(map, baseName) {
    const keys = Array.from(map.keys());
    const filteredKeys = keys.filter(key => key.startsWith(baseName));
    const keysWithNumbers = filteredKeys.map(key => {
        const match = key.match(/_(\d+)$/);
        return { key, number: match ? parseInt(match[1], 10) : 0 };
    });
    keysWithNumbers.sort((a, b) => a.number - b.number);
    return keysWithNumbers.map(item => item.key);
}
function createEndpoint(path, lang) {
    const pathParts = path.split('/'); // oder '\\' für Windows-Pfade
    const endpointName = pathParts[pathParts.length - 1]; // Der letzte Teil des Pfades ist der Endpoint-Name
    let finalObject;
    for (const point of protobuffctl.componentRegistry.endPoints.values()) {
        if (point.lang === lang) {
            const pointPathParts = point.path.split('/'); // oder '\\' für Windows-Pfade
            const pointEndpointName = pointPathParts[pointPathParts.length - 1];
            if (endpointName === pointEndpointName) {
                finalObject = point;
                break;
            }
        }
    }
    if (!finalObject) {
        finalObject = new Endpoint(endpointName,lang,path,[],[]);
    }
    return finalObject;
}

// ---------------------------- OOP ------------------------------------
// EXAMPLES NUR FÜR PROTO. js code wird automatisch erzeugt
/**         ------------------ ProtoFile ---------------------    
 * @description ${classDescriptions.ProtoFile.description}
 */
class ProtoFile {
    constructor(file, path, services, methods, types, enums, protobuffFiles, protobuffComponents, protoUserComponent) {
        const protoFilePath=path+"/"+file
        console.log("creating " + protoFilePath)
        const uniqueId = getUniqueName(protobuffctl.componentRegistry.protoFiles,file);
        const existingProtoFile = Array.from(protobuffctl.componentRegistry.protoFiles.values()).find(
            protoFile => protoFile.file === file && protoFile.path === path
        );
        this.id = existingProtoFile ? existingProtoFile.id : uniqueId || [];
        this.services = existingProtoFile ? existingProtoFile.services : services || [];
        this.methods = existingProtoFile ? existingProtoFile.methods : methods || [];
        this.types = existingProtoFile ? existingProtoFile.types : types || [];
        this.enums = existingProtoFile ? existingProtoFile.enums : enums || [];
        this.protobuffFiles = existingProtoFile ? existingProtoFile.protobuffFiles : protobuffFiles || [];
        this.protobuffComponents = existingProtoFile ? existingProtoFile.protobuffComponents : protobuffComponents || [];
        this.protoUserComponent = existingProtoFile ? existingProtoFile.protoUserComponent : protoUserComponent || [];
        if(existingProtoFile!=undefined){
        }
        else{

        }
        protobuffctl.componentRegistry.protoFilePaths.set(this.id, path);
        protobuffctl.componentRegistry.protoFiles.set(file, this);

        this.extractTypesFromProtoFile(protoFilePath).then(()=>{
            console.log(protobuffctl.componentRegistry)
            protobuffctl.save()
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
        this.lang = lang
        this.protoUsers=[]
        this.protobuffComponents=[] //{ name,client,method,args,returns,line,protoBuffFile,ProtoFile}
        const protoName=protoFile.file.split(".proto")[0]
        const file_name=protoName+".pb"+ languageFileExtensions[lang]["fileExtension"]
        this.path=out+"/"+path
        try{
            this.generateProtobuff()
        }catch(err){console.log("error while creating ProtobuffFile"); return(err)}
        this.id=(getUniqueName(protobuffctl.componentRegistry.ProtobuffFiles,file_name))
        protobuffctl.componentRegistry.ProtobuffFiles.set(this.id,this)
        protobuffctl.componentRegistry.ProtobuffFilePaths.set(this.id,this.path)
        const endPoint=createEndpoint(path,lang,protobuffctl)
        endPoint.protoBuffFiles.push(this)
        endPoint.protoFiles.push(this)
        console.log(protoFile)
        console.log(file)
        console.log(protoName)
        console.log(endPoint)
    }
    generateProtobuff(){
        generator.generateProtobuf(lang,this.protoFile.path,this.protoFile.file,out)
     }

    generateProtobuffComponent(protobuffFile,protoFile,service,method){
    
        const protobufComponent = new ProtobuffComponent()
    }
}
/**         ------------------ ProtobuffUser ---------------------    
 * @description ${classDescriptions.ProtobuffUser.description}
 */
class ProtoUser {
    constructor(name, path, lang, protobuffComponents, protoUserComponent) {
        this.name = name; // The name of the file
        this.path = path; // The path to the file
        this.lang=lang
        this.protobuffComponents=protobuffComponents    
        this.protoUserComponent = protoUserComponent; // The components defined within the file
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
 * @description ${classDescriptions.Endpoint.description}
 */

class Endpoint {
    constructor(name,lang,path,protoUsers,protobuffFiles) {
        this.protoFiles = protoFiles;
        this.protobuffFiles = protobuffFiles;
        this.protoUsers=protoUsers
        this.lang=lang
        this.name = name;
        this.path = path;
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