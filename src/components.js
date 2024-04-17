// TO DO !!!!! 
// >>>> USE PATH LIBARY FOR WINDOWS USERS!!!   <<<<
// Funktion, um zu überprüfen, ob ein Pfad ein Unterordner eines anderen Pfades ist
const chokidar = require('chokidar');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const { ProtobuffGenerator } = require("protoc-helper")
const { classDescriptions } = require("../descriptions/classdescriptions")
const { Protobuffctl, } = require("./protobuffctl")
const { getUniqueName, isSubdirectory, prototypes, childless, languageFileExtensions, mergeFields, initObject, usagesRelations, childRelations } = require("../util/utils")
const protobuf = require('protobufjs');
const { set, writeAndReplaceProto, generateProtoFromServices, getElementsRecoursive, getProtoContent, removeOld, getAllChildren, getChildrenRec, getParentsRec, addRelation } = require('./protoUtils');
const { stringify } = require('querystring');
const { type } = require('os');
const protobuffctl = new Protobuffctl()
generator = new ProtobuffGenerator()
class ProtoFileMaster {
    constructor(file_name, file_path, services, methods, types, enums, fields, protobuffFiles, options, syntax, proto_package, id) {
    
    }
}
function objectExistsInArray(array, object) {
    return array.some(item => JSON.stringify(item) === JSON.stringify(object));
}
async function createBuff(lang, out, file_name, file_path) {
    return new Promise((resolve, reject) => {

        new ProtobuffGenerator().generateProtobuff(lang, out, file_name, file_path)
        resolve()
    }).catch((err) => console.log("failed to create buff " + err))
}
/**         ------------------ ProtoFile ---------------------    
 * @description ${classDescriptions.ProtoFile.description}
 */
class ProtoFile {
    constructor(file_name, file_path, protobuffFiles, protobuffComponents, protoUserComponent, options, syntax, proto_package, id,keep_old=false) {
        
        this.protobuffFiles = protobuffFiles; this.protobuffComponents = protobuffComponents; this.protoUserComponent = protoUserComponent; this.id = id;
        initObject(this, [     "protobuffFiles", "protobuffComponents", "protoUserComponent", "options"])
        this.id = path.basename(file_name, ".proto")//getUniqueName(protobuffctl.componentRegistry.hashlookupTable, path.basename(file_name,".proto"));
        this.absolute_path = path.join(file_path, this.id + ".proto")
        console.log("___________________  ")
        console.log(this.id)
        console.log("creating " + this.absolute_path)
        
        const existingProtoFile = Array.from(protobuffctl.componentRegistry.protoFiles.values()).find(
            protoFile => protoFile.absolute_path === this.absolute_path
        );
        this.file_name = this.id + ".proto"
        this.file_path = file_path
        this.absolute_path = path.join(file_path, file_name)
        if(protobuffctl.componentRegistry.relations["protoFiles"].get(this.id)==undefined){
            protobuffctl.componentRegistry.relations["protoFiles"].set(this.id,{children:[],parents:[]})
        }
        this.extractTypesFromProtoFile(this.absolute_path).then(() => {
            //console.log(protobuffctl.componentRegistry)
            protobuffctl.componentRegistry.methods.forEach((method)=>{
                method=Object.values(method)[0]
                const resp=protobuffctl.componentRegistry.hashlookupTable.get(method["responseType"])
                const req=protobuffctl.componentRegistry.hashlookupTable.get(method["requestType"])
                const reqHash=protobuffctl.componentRegistry.hashlookupTable.get(req)
                const respHash=protobuffctl.componentRegistry.hashlookupTable.get(resp)
                if(respHash==undefined){

                }
            })

            if (existingProtoFile != undefined) {

                removeOld(this, existingProtoFile)//  ["services", "methods", "types", "fields", "enums", "protobuffFiles", "protobuffComponents", "protoUserComponent"])
                this.id = existingProtoFile.id
            }
            else {
                // const sourceFilePath = path.join(file_path, file_name);
                //  const destinationFilePath = this.absolute_path;
                protobuffctl.componentRegistry.protoFilePaths.set(this.id, this.absolute_path);
                protobuffctl.componentRegistry.protoFiles.set(this.id, this)
                protobuffctl.componentRegistry.hashlookupTable.set(this.id, "protoFiles")
            }
            const temp={
                children:[],
                parents:[]
            }
            const relations=protobuffctl.componentRegistry.relations
            protobuffctl.componentRegistry.relations["protoFiles"]==undefined?protobuffctl.componentRegistry.relations["protoFiles"]=new Map():protobuffctl.componentRegistry.relations["protoFiles"]
            let relP=protobuffctl.componentRegistry.relations["protoFiles"].get(this.id)
            if(relP==undefined){
                const temp={
                    children:[],
                    parents:[]
                }
                relP=temp
            }
            const c={type:"protoFiles",id:this.id}
            Object.entries(this).map(([key,val])=>{
            if(["types","enums","services"].includes(key)){
                const childName=val[0]
            let rel=protobuffctl.componentRegistry.relations[key].get(childName)
            if(rel==undefined){
                const temp={
                    children:[],
                    parents:[]
                }
                rel=temp
            }
          
            objectExistsInArray(rel["parents"],c)==false&&rel["parents"].push(c)
            protobuffctl.componentRegistry.relations[key].set(childName,rel)
            
            const c2={type:key,id: childName}
            objectExistsInArray(relP["children"],c2)==false&&relP["children"].push(c2)
            console.log(`--------------- >> set relation ${childName} <<`)
            console.log(rel)
            console.log("---------------")
        }
            })
            protobuffctl.componentRegistry.relations["protoFiles"].set(this.id,relP)

            let clone =JSON.parse(JSON.stringify(this))// Object.assign(Object.create(Object.getPrototypeOf(this)), this)            
            protobuffctl.save()
            getProtoContent(clone, true)
          //  protobuffctl.convertToJsonCompatible(__dirname + ("/out.json"))
            
        
          //const buff = new ProtobuffFile(__dirname, this, "ts")
        })
    }
    async getroot(protoFilePath, v = false) {
        console.log(protoFilePath)
        if (!fs.existsSync(protoFilePath)) {
            throw new Error(`Datei existiert nicht: ${protoFilePath}`);
        }
        let fileContent = fs.readFileSync(protoFilePath, 'utf8');
        fileContent = fileContent.replace(/syntax\s*=\s*(?!="proto3";|="proto2";).*;/, 'syntax="proto3";');
        fileContent = fileContent.replace(/package\s*;/, `package ${this.id};`);
        const serviceRegex = /service[\s\S]*?\n\s*}/g
        const services = fileContent.match(serviceRegex);
        fileContent = fileContent.replace(serviceRegex, '');
        if (services) {
            fileContent += '\n\n' + services.join('\n\n');
        }
        console.log(fileContent)
        this.syntax = "syntax" + (fileContent.split('syntax')[1].split("\n")[0])
        this.proto_package = (fileContent.match(/^package\s+\w+\s*(?!=\s*".*";)(?!options\s*=.*);/m)[0])
        // >> adding missing types before loading with protobuffjs to avoid errors!! <<
        const rpcRegex = /rpc\s+\w+\s*\([^\)]+\)\s*returns\s*\([^\)]+\)\s*\{*\}/g;
        const typeRegex = /\(([^)]+)\)\s*returns\s*\(([^)]+)\)/;
        const rpcMatches = fileContent.match(rpcRegex);
        const typeDefinitions = fileContent.split('\n').filter(line => line.includes('message') || line.includes('enum'));
        if (rpcMatches) {
            rpcMatches.forEach(rpc => {
                const typeMatch = rpc.match(typeRegex);
                if (typeMatch) {
                    const e=typeMatch[1].trim()
                    const e2=typeMatch[2].trim()
                    const requestType = e.includes("stream")?e.split("stream ")[0]:e 
                    const responseType = e2.includes("stream")?e2.split("stream ")[0]:e2
                    const requestTypeExists = typeDefinitions.some(line => line.includes(requestType));
                    const responseTypeExists = typeDefinitions.some(line => line.includes(responseType));
                    if (!requestTypeExists) {
                        fileContent+= `\nmessage ${requestType} { \n}`
                        console.log(`ading missing Type: The requestType '${requestType}' is not defined.`);
                    }
                    if (!responseTypeExists) {
                        fileContent+= `\nmessage ${responseType} { \n}`
                        console.log(`add missing type: The responseType '${responseType}' is not defined.`);
                    }
                }
            });
        }
        console.log(fileContent)
        fs.writeFileSync(protoFilePath, fileContent, 'utf8');
        console.log(this.syntax + " " +  this.proto_package);
        let root;
        try {
            
            root = await protobuf.load(protoFilePath);
        } catch (error) {
            console.error(`Fehler beim Laden der .proto-Datei: ${error}`);
            throw error; // Fehler weiterleiten
        }
        const options = root.options;
        const opArray = []
        Object.entries(options).forEach(([key, value]) => {
            const valstr = typeof (value) == "string" ? `"${value}"` : String(value)
            const opstr = (`option ${key} = ${valstr};`);
            v ==true&& console.log(opstr)
            opArray.push(opstr)
        });
        protobuffctl.componentRegistry.options.set(this.id + "_op", opArray)
        protobuffctl.componentRegistry.hashlookupTable.set(this.id + "_op", "options")
        this.options = this.id + "_op"
        return root
    }
    extractTypesFromProtoFile(protoFilePath) {
        return new Promise((resolve, reject) => {
            this.
            getroot(protoFilePath).then((root) => {
                this.traverseProtoElements(root, function (obj, type) {
                }, this).then(() => {
                    
                    resolve();
                }).catch(reject);
            }).catch(reject);
        });
    }

    traverseProtoElements(current, fn, v = false) {
        return new Promise((resolve, reject) => {
            const jsonObj = current.toJSON();
            var name = current.name;
            const componentID = name//this.id+"_"+name
            v==true&&console.log(name);
            const protoRel=protobuffctl.componentRegistry.relations["protoFiles"].get(this.id)
            let rel
            switch (true) {
                case current instanceof protobuf.Type:
                    v ==true&& console.log("________TYPE________");
                    const fields = [];
                    addRelation("protoFiles",this.id,"types",componentID,"children")
                    addRelation("types",componentID,"protoFiles",this.id,"parents")
                    Object.entries(jsonObj["fields"]).map(([key, val]) => {
                        let id = key// this.id+"_"+key;
                        if((prototypes.includes(val["type"]))){
                        set("fields", id, { [key]: val })
                        
                    }else{
                        if(protobuffctl.componentRegistry.hashlookupTable.get(key)!="enum"){
                            const fieldName=key
                            const fieldObject={[id]:{type:val["type"],id:val["id"]}}
                            set("fields", fieldName, fieldObject)
                            id=fieldName
                        }

                        else{
                            console.warn(key + " is neither an enum, or a nested type. please create such first")
                        }
                    }
                        
                        fields.push(id);
                    });
                    set("types", componentID, fields)
                    //this.fields = this.fields.concat(fields)
                    //this.types.push(componentID);
                    fn(current, 'Type');
                    break;
                case current instanceof protobuf.Service:
                    v ==true&& console.log("________SERVICE________");
                    const methods = [];
                    addRelation("protoFiles",this.id,"services",componentID,"children")
                    addRelation("services",componentID,"protoFiles",this.id,"parents")    
                    Object.entries(jsonObj["methods"]).map(([key, val]) => {
                        const id = key//this.id+"_"+key;
                        val["requestType"] = val["requestType"]// this.id + "_" + val["requestType"]
                        val["responseType"] = val["responseType"]// this.id + "_" + 
                        set("methods", id, { [key]: val })
                        methods.push(id);
                    });
                    set("services", componentID, methods)
                //this.methods = this.methods.concat(methods)
                    fn(current, 'Service');
                    break;
                case current instanceof protobuf.Enum:
                    v ==true&& console.log("________Enum________");
                    addRelation("protoFiles",this.id,"enums",componentID,"children")
                    addRelation("enums",componentID,"protoFiles",this.id,"parents")       
                    set("enums", componentID, {[componentID]:jsonObj["values"]})
                                 //this.enums.push(componentID);
                    fn(current, 'Enum');
                    break;
                case current instanceof protobuf.Namespace:
                    v ==true&& console.log("________Namespace________");
                    fn(current, 'Namespace');
                    break;
                default:
                    console.log('Unbekannter Typ:', current);
            }
            protobuffctl.componentRegistry.relations["protoFiles"].set(this.id,protoRel)

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
        this.file_name = protoFile.id + languageFileExtensions[lang]["fileExtension"]
        this.absolute_path = path.join(out, this.file_name)
        //const existingProtobuffFile = Array.from(protobuffctl.componentRegistry.protobuffFiles.values()).find(
        //    protobuffFile => protobuffFile.file_name === this.file_name && protobuffFile.absolute_path === this.absolute_path
        //);
        this.id = getUniqueName(protobuffctl.componentRegistry.protobuffFiles, this.protoFile.id+"_"+lang)  //existingProtobuffFile ? existingProtobuffFile.id : getUniqueName(protobuffctl.componentRegistry.hashlookupTable, this.file_name + "_");
        protoFile.protobuffFiles.push(this.id)
        protobuffctl.componentRegistry.protobuffFiles.set(this.id, this);
        protobuffctl.componentRegistry.hashlookupTable.set(this.id, "protobuffFiles")
        protobuffctl.componentRegistry.protobuffFilePaths.set(this.id, this.absolute_path);
        const endPoint = new Endpoint({ lang: this.lang, file_path: this.absolute_path, protoUsers: [this.protoUsers], protobuffFiles: [this.id], protoFiles: [this.protoFile] })
        this.endPoint = endPoint.id
        try {
            createBuff(this.lang, this.out, protoFile.file_name, protoFile.file_path,).then(() => {
                protobuffctl.save()
                // protobuffctl.convertToJsonCompatible(__dirname+"/protobuffctl.json")
            })
        } catch (err) {
            return err;
        }
    }
    generateProtobuff(){
        createBuff(this.lang, this.out, protoFile.file_name, protoFile.file_path,).then(() => {
            protobuffctl.save()
            // protobuffctl.convertToJsonCompatible(__dirname+"/protobuffctl.json")
        })
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
        const uniqueId = getUniqueName(protobuffctl.componentRegistry.hashlookupTable, name);
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
    constructor(id, protobuffComponent, callback, lang, file_name) {
        this.protobuffComponent = protobuffComponent
        this.callback = callback
        this.file_name = file_name
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
        this.id = getUniqueName(protobuffctl.componentRegistry.hashlookupTable, tempID)
        this.protobuffFiles = protobuffFiles
        this.protoUsers = protoUsers
        this.protoFiles = protoFiles
        for (const point of protobuffctl.componentRegistry.endPoints.values()) {
            if (point.lang === lang) {
                // merge because of same directory
                if (point.path == this.path) {
                    finalObject = point
                    mergeFields(this, finalObject, ["protoUsers", "protobuffFiles", "protoFiles"])
                    this.id = finalObject.id
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
            mergeFields(this, finalObject, ["protoUsers", "protobuffFiles", "protoFiles"])
            this.path = isParent ? this.path : finalObject.path
            this.id = isParent ? this.id : finalObject.id
        }
        protobuffctl.componentRegistry.endPoints.set(this.id, this)
        protobuffctl.componentRegistry.hashlookupTable.set(this.id, "endPoint")
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
    createBuff,
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
