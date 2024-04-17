const { ProtoFile, ProtobuffFile, ProtoUser, ProtoUserComponent, Endpoint, MainEndpoint, languageFileExtensions, createBuff, } = require('./components.js');
//const ProtoFileExtractor=require("./extractors.js")
const { exec } = require('child_process');
const path = require('path');
const { addS, childless, deepClone, relations } = require("../util/utils.js")
const fs = require('fs');
const { Protobuffctl } = require("./protobuffctl");
const { getElementsRecoursive, getProtoContent, set, findAllU,getChildrenRec, getParentsRec, addMissingtype } = require('./protoUtils.js');
const protobuffctl = new Protobuffctl()
/**
 * Retrieves a specific component from the registry.
 * @example
 * // Example for retrieving a specific service
 * get("service", "Greeter", 1);
 * 
 * @param {string} type - The type of the component to retrieve.
 * @param {string} name - The name of the component to retrieve.
 * @param {number} depth - The depth of recursion for retrieving related components.
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
        let clone = JSON.stringify(element) //Object.assign(Object.create(Object.getPrototypeOf(element)), element)
        clone = JSON.parse(clone)
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
/**
 * Retrieves all elements of a specified type from the registry.
 * @example
 * // Example for retrieving all protoFiles
 * getAll("protoFiles", true, true);
 * @example
 * // Example for retrieving all services
 * getAll("services", false, false);
 * @param {string} type - The type of elements to retrieve (e.g., "protoFiles", "services", "methods", etc.).
 * @param {boolean} describe - A boolean indicating whether to describe the elements in detail.
 * @param {boolean} jsonOut - A boolean indicating whether to output the results in JSON format.
 */
function getAll(type, describe, jsonOut) {
    const protobuffctl = new Protobuffctl()
    const keys = []
    if (type == undefined) {
        console.log(protobuffctl.componentRegistry.hashlookupTable)
        return protobuffctl.hashlookupTable
    }
    try {
        const jsonObject = []
        protobuffctl.componentRegistry[type].forEach((value, key) => {
            keys.push(key)
            console.log(key);
            if (describe == "true") {
                obj = get(type, key, "i")
                jsonObject.push(obj)
            }
        })
        if (describe == "true") {
            console.log(JSON.stringify(jsonObject))
            if (jsonOut = undefined) {
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
/**
 * Converts the registry to a JSON file.
 * @example
 * // Example for converting the registry to a JSON file
 * toJson("/path/to/output.json", "helloworld");
 * 
 * @param {string} out - The output path for the JSON file.
 * @param {string} id - The ID of the component to include in the JSON file.
 */
function toJson(out, id) {
    if (id != undefined) {
        type = protobuffctl.componentRegistry.hashlookupTable.get(id)
        element = protobuffctl.componentRegistry[type].get(id)
        const elementNew = getElementsRecoursive(JSON.parse(JSON.stringify(element)), id, depth)
        fs.writeFileSync(path.join(filepath, elementNew + ".json"), obj);
    }
    else {
        if (out == "./") { out = path.join(__dirname, "protobuffctl.json") }
        console.log("no elment specified, generating flatenned json")
        protobuffctl.convertToJsonCompatible(out)

    }
}
/**
 * Finds all usages of a specified component in the registry.
 * @example
 * // Example for finding all usages of a service
 * findAllUsages("service", "Greeter");
 * 
 * @param {string} type - The type of the component to find usages for.
 * @param {string} name - The name of the component to find usages for.
 */
function findAllUsages(type, name) {
    if (type == "protoFiles") {
        return []
    }
    return findAllU(type, name)
}
/**
 * Generates Protobuff files for an array of proto files.
 * @example
 * // Example for generating Protobuff files
 * protogenArr(["helloworld.proto", "test.proto"]);
 * 
 * @param {Array<string>} protofiles - An array of proto file names or IDs.
 */
function protogenArr(protofiles) {
    protofiles.map((file) => {
        const proto = protobuffctl.componentRegistry.protoFiles.get(file)
        for (buff of proto.protobuffFiles) {
            buff = protobuffctl.protobuffFiles.get(buff)
        }
        createBuff(buff.lang, buff.out, buff.file_name, buff.file_path,).then(() => {
        })
    })
}

/**
 * Initializes a new Proto-object or ProtobuffFile in the registry.
 * @example * // Example for creating a ProtoFile
 * create("proto", "example.proto", "/path/to/proto/files");
 * @example * // Example for creating a ProtobuffFile
 * create("protobuff", "example.id", "ts", "/path/to/output");
 * @example * // create a method
 * create("method", "SayHello", 'HelloRequest', 'HelloReply';
 * @example * // create a field
 * create("field", "test_field", 'string')
 * 
 * @param {string} type - The type of object to create. Can be "proto" for ProtoFile or "protobuff" for ProtobuffFile.
 * @param {string} arg1 - The first argument, which is the file name for "proto" type or the protoFile ID for "protobuff" type.
 * @param {string} arg2 - The second argument, which is the file path for "proto" type or the language for "protobuff" type.
 * @param {string} arg3 - The third argument, which is the output path for "protobuff" type.
 * @param {string} arg4 - The fourth argument, which is not used in the current implementation.
  */
function create(type, arg1, arg2, arg3) {
    switch (type) {
        //----------------------- >> P R O T O << ---------------------------------------
        case ("proto"):
            console.log(arg1)
            try {
                const file = arg1; const folder_path = arg2
                console.log((file));
                if (typeof (file) != "string" || typeof (folder_path) != "string") {
                    return console.error("🤕 wrong arguments! arguments are\n arg1: <string> - file-name. \n arg2: <string> - folder_path")
                }
                // Überprüfen, ob die Datei existiert
                const abs = path.join(folder_path, file)
                if (!fs.existsSync(abs)) {
                    // Die Datei existiert nicht, also erstellen Sie sie mit baseProto
                    const base = path.basename(file, ".proto")
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
        //----------------------- >> P R O T O B U F F<< ---------------------------------------
        case ("protobuff"): {
            let protoFile = arg1; let lang = arg2; let out = arg3
            if (typeof (protoFile) != "string" || typeof (lang) != "string" || typeof (out) != "string") {
                return console.warn("🤕 wrong arguments! arguments are\n arg1: <string> - proto-id. \n arg2: <string> - language,\n arg3: <string> - output_folder_path")
            }
            try {
                if (out == "./") { out = path.join(__dirname) }

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
        //----------------------- >> S E R V I C E << ---------------------------------------
        case ("service"): {
            const name = arg1; let methods = ((arg2.split(",")));
            let status = protobuffctl.componentRegistry.hashlookupTable.get(name)
            if (status != "services" && status != undefined) {
                (console.error("service " + name + "cant get created because of component id allready in use as: " + JSON.stringify(status)))
            } else {
                methods.map((method) => {
                    console.log(method)
                    const status = protobuffctl.componentRegistry.hashlookupTable.get(method)
                    if (status == undefined) {
                        methods = methods.filter((m) => m !== method);
                        return (console.error("method " + method + " does not exist! please create it first!"))
                    } else if (status != "services") {
                        return (console.error("method " + method + "cant get created because another compnent allready uses that id: " + JSON.stringify(status)))
                    }
                    console.log(status)
                })
                set("service", name, methods)
            }
            break
        }
        //----------------------- >> T Y P E << ---------------------------------------
        case ("type"): {
            let fields; const name = arg1;
            if (arg2 == undefined) {
                fields = []
            } else {
                fields = ((arg2.split(",")));
                if (!Array.isArray(fields)) {
                    fields = [fields]
                }
            }
            console.log("fields " + JSON.stringify(fields))
            let status = protobuffctl.componentRegistry.hashlookupTable.get(name)
            if (status != "type" && status != undefined) {
                (console.error("type " + name + "cant get created because of component id allready in use as: " + JSON.stringify(status)))
            } else {
                const validFields = []
                fields.map((field) => {
                    console.log(field)
                    status = protobuffctl.componentRegistry.hashlookupTable.get(field)
                    if (status == undefined) {
                        (console.error("field " + field + " does not exist! please create it first!"))
                    } else if (status != "fields" && status != "enum") {
                        (console.error(status + " " + name + "getting removed from fields, because it is: " + JSON.stringify(status)))
                    }
                    else {
                        validFields.push(field)
                    }
                    console.log(status)
                })
                //const element = { [name]: fields }
                set("type", name, validFields)
            }
            break
        }
        //----------------------- >> F I E L D << ---------------------------------------
        case ("field"): {
            const fieldtype = arg2; const name = arg1;
            const status = protobuffctl.componentRegistry.hashlookupTable.get(name)
            if (status != "fields" && status != undefined) {
                (console.error("type " + name + "cant get created because of component id allready in use as: " + JSON.stringify(status)))
            } else {
                const element = { [name]: { type: fieldtype, id: -1 } }
                set("fields", name, element)
            }
            break;
        }
        //----------------------- >> E N U M << ---------------------------------------
        case ("enum"): {
            const enumvalues = arg2; const name = arg1;
            const status = protobuffctl.componentRegistry.hashlookupTable.get(name)
            if (status != "enum" && status != undefined) {
                (console.error("enum " + name + "cant get created because of component id allready in use as: " + JSON.stringify(status)))
            } else {
                const element = { [name]: { type: fieldtype, id: -1 } }
                set("fields", name, element)
            }
            break;
        }
        //----------------------- >> M E T H O D << ---------------------------------------
        case ("method"):
            {
                const status = protobuffctl.componentRegistry.hashlookupTable.get(arg1)
                if (status != "fields" && status != undefined) {
                    (console.error("type " + arg1 + "cant get created because of component id allready in use as: " + JSON.stringify(status)))
                } else {
                    const element = { [arg1]: { requestType: arg2, responseType: arg3 } }
                    set("methods", arg1, element)
                }
                break;
            }
    }
    protobuffctl.save()
}
/**
 * Creates components from a configuration file.
 * @example
 * // Example for creating components from a configuration file
 * createFromConfig(["helloworld.proto", "test.proto"]);
 * 
 * @param {Array<string>} protoFiles - An array of proto file names or IDs.
 */
function createFromConfig(protoFiles) {

}

/**
 * Adds a component to another component.
 * @example
 * // Example for adding a service to a protoFile
 * add("service", "Greeter", "helloworld.proto", true);
 * 
 * @param {string} type - The type of the component to add.
 * @param {string} source - The name of the source component.
 * @param {string} target - The name of the target component.
 * @param {boolean} pull - A boolean indicating whether to pull the changes to the registry.
 */
function add(type, source, target, pull) {
    type = addS(type)


    if (protobuffctl.componentRegistry.hashlookupTable.get(source) == undefined) {
        return console.log("source " + source + " not found in haslookuptable! please create it first")
    }
    else if (protobuffctl.componentRegistry.hashlookupTable.get(target) == undefined) {
        return console.log("target " + target + " not found in haslookuptable! please create it first")
    }
    try {
        const children = []
        getChildrenRec(type, source, children)
        console.log(children)
        function addChildrenToProto(protoFile) {
            children.map((item) => {
                const childType = item["type"]
                const childId = item["id"]
                childId && (protoFile[childType]).includes(childId) == false && protoFile[childType].push(id)
            })
        }

        let appearances = []

        if (type == "types" || type == "services") {
            const protoFile = protobuffctl.componentRegistry["protoFiles"].get(target)
            protoFile[type].includes(source) == false && protoFile[type].push(source)
            addChildrenToProto(protoFile)
            appearances.push(protoFile.id)

        }
        else if (type == "methods" || type == "enums" || type == "fields") {
            const rel = relations[type][0]
            const t = protobuffctl.componentRegistry[rel].get(target)
            if (rel != "protoFiles") {
                t.push(source)
                const usages = findAllUsages(relations[type][0], target)
                usages != [] && usages.map((element) => {
                    if (element["type"] == "protoFiles") {
                        const proto = protobuffctl.componentRegistry["protoFiles"].get(element["id"])
                        addChildrenToProto(proto)
                        proto[type].push(source)
                        appearances.push(proto.id)
                    }
                })
            } else { //proto
                t[type].push(source)
                const sourceObject = protobuffctl.componentRegistry[type].get(source)
                Object.entries(t).map(([val, key]) => {
                    if (Array.isArray(val) && sourceObject[key] != undefined) {
                        val = val.concat(sourceObject[key])
                    }
                })
                protobuffctl.componentRegistry["protoFiles"].set(target, t)
                appearances.push(target)
            }


        }
        else { console.log("wrong arguments") }
        if (pull == "true") {
            pull(appearances)
        }
        //    childUsage(source,target,true)
        protobuffctl.save()
    } catch (err) {
        console.error(err)
        return err
    }
}
const rel = {
    types: "methods",
    methods: "service",
    fields: "types",
    service: "protoFiles",
    emums: "fields",
}
function checkIfStillNeeded(sourceType, source, target, usages, remove_from_components) {
    let stillNeeded = false
    const relation = rel[sourceType]
    usages.map((y) => {
        if (y["id"] != target) {
            let targetObject
           
            if (y["type"] == "methods" || y["type"] == "services") {
                targetObject = Object.values(protobuffctl.componentRegistry[y["type"]].get(y["id"]))[0]

                if (remove_from_components == true) {
                    if (y["type"] == "methods" && sourceType == "types") {
                        console.log("----------------\n>>:" + sourceType + " " + source + " still needed! Gonna edit " + relation + " " + y["id"] + " <<") 
                        console.log(" setting values to NONETYPE"+"\n------------------")
                        const requestType=targetObject["requestType"]
                        const responseType=targetObject["responseType"]
                        if (requestType == source||responseType==source) {
                            const rel =protobuffctl.componentRegistry.relations["methods"].get(y["id"])
                        if (requestType == source) {
                            targetObject["requestType"] = "NONETYPE"
                            rel["children"]=rel["children"].filter((c)=>c["id"]!=targetObject["requestType"])

                      
                        }  if (responseType == source) {
                            targetObject["responseType"] = "NONETYPE"
                            rel["children"]=rel["children"].filter((c)=>c["id"]!=targetObject["responseType"])

                        }
                       
                        protobuffctl.componentRegistry[y["type"]].set(y["id"], {[y["id"]]:targetObject})

                        addMissingtype("NONETYPE",y["id"])

                    }
                        else{
                            console.log(source + " not in Method "+responseType + "," +requestType)
                        }
                        return
                    }
                    else {
                        console.log("remove_from_components: method " + source + " from  service " + y["id"])
                        targetObject = targetObject.filter((z) => z !== source)
                        protobuffctl.componentRegistry[y["type"]].set(y["id"], {[y["id"]]:targetObject})

                    }
                } else {
                    stillNeeded = true
                    console.log("----------------\n>> " + sourceType + " " + source + " still required by " + relation + " " + y["id"] + " <<\n----------------")   
                    return true
                }
            }
        else if (y["type"] == "types") {
            if (remove_from_components == false) {
            console.log("----------------\n>> " + sourceType + " " + source + " still required by " + relation + " " + y["id"] + " <<\n----------------")
            stillNeeded = true
            return true
            }
            else{
                console.log("----------------\n>> remove_from_components: " + sourceType + " " + source + " from " + relation + " " + y["id"] + " << ----------------")
                //newObject = targetObject.filter((el) => el !== source);
                //protobuffctl.componentRegistry[y["type"]].set(y["id"], newObject)
                remove(source,y["id"],false,false,{}) 
            }
        }
    }
    })
    return stillNeeded
}
/**
 * Deletes a component from the registry.
 * @example
 * // Example for deleting a protoFile
 * del("protoFile", "helloworld", true);
 * 
 * @param {string} type - The type of the component to delete.
 * @param {string} id - The ID of the component to delete.
 * @param {boolean} [remove_from_components=true] - A boolean indicating whether to remove the component from other components.
 */

function del(type, id, recoursive, remove_from_components=true,deleteChildren = true) {
    
    recoursive = recoursive== "false"?false:recoursive==undefined?false:recoursive
    remove_from_components = remove_from_components== "false"?false:remove_from_components==undefined?true:remove_from_components
    console.log("childless " + type + "  " + JSON.stringify(childless.includes(type)))
    type = addS(type)
        const children = []
        const avoid=["fields"]
        avoid.includes(type) == false && getChildrenRec(type, id, children)
        let deleteStatus = children.reduce((acc, child) => {
            acc[child.id] = [];
            return acc;
        }, {})
        
        const protoUsages=[]
        const enumUsages=[]
        if (type == "protoFiles") {
            children.map((x) => {
                const usages = protobuffctl.componentRegistry.relations[x["type"]].get(x["id"])["parents"]
                usages.map((y) => {
                    y["type"] != "protoFiles" && remove(x["id"], y["id"], recoursive,remove_from_components, deleteStatus)
                })
            })
        }
        else {
           
            const usages = protobuffctl.componentRegistry.relations[type].get(id)["parents"]// findAllUsages(type, id)
            if (usages.length > 0) {
                usages.reverse().forEach((usage, index) => {
                    if (usage["type"] == "enums") {
                    enumUsages.push(usage)
                    }
                    else if (usage["type"]) {
                        remove(id, usage["id"], recoursive, remove_from_components, deleteStatus);
                        usages.splice(usages.length - index, 1);
                    }
                });
            } 
           //  if (children.length > 0) {
           //     
           //     children.map((child) => {
           //         remove(child["id"], id, false,false, deleteStatus)
           //     }
           //     )
           // } 
        }
        //if(deleteStatus[source]==true){
        Object.entries(deleteStatus).map(([e, s]) => {
            const c=s.filter((e)=>e==false)
            s = c.length>0?true:false
            const t = protobuffctl.componentRegistry.hashlookupTable.get(e)
            if (t && s )//&& !(!deleteChildren && id != e)) 
            { //source != e)) {
                protobuffctl.componentRegistry[t].delete(e)
                protobuffctl.componentRegistry.hashlookupTable.delete(e)
                protobuffctl.componentRegistry.relations[t].delete(e)
                console.log("delete " + e)
                //console.log(protobuffctl.componentRegistry.hashlookupTable)
            }
        })
   // }
        protobuffctl.save()
        return
    
}

function removeChildRelation(child,childType,parent,parentType){
    try{
  const childRel= protobuffctl.componentRegistry.relations[childType].get(child)
  const temp={type:parentType,id:parent}  
  childRel["parents"]=childRel["parents"].filter((e) =>  e.id != temp.id);
  protobuffctl.componentRegistry.relations[childType].set(child,childRel)
    }catch(err){
        return console.error("cant set childrelationship ")
    }
}
function removeParentRelation(child,childType,parent,parentType){
try{
  const parentRel= protobuffctl.componentRegistry.relations[parentType].get(parent)
  const temp={type:childType,id:child}  
  parentRel["children"] = parentRel["children"].filter((e) =>  e.id != temp.id);
  protobuffctl.componentRegistry.relations[parentType].set(parent,parentRel)
}catch(err){
    return console.error("cant set parentrelationship ")
}
}
/**
 * Removes a component from another component.
 * @example
 * // Example for removing a service from a protoFile
 * remove("service", "Greeter", {}, true);
 * 
 * @param {string} type - The type of the component to remove.
 * @param {string} name - The name of the component to remove.
 * @param {Object} values - The values associated with the component to remove.
 * @param {boolean} pull - A boolean indicating whether to pull the changes to the registry.
 */
function remove(source, target, recoursive,remove_from_components, deleteStatus, pull = false) {
    recoursive = recoursive== "false"?false:recoursive==undefined?false:recoursive
    remove_from_components = remove_from_components== "false"?false:remove_from_components==undefined?true:remove_from_components
    //deleteStatus=deleteStatus==undefined?deleteStatus={}:deleteStatus
    const sourceType = protobuffctl.componentRegistry.hashlookupTable.get(source)
    const targetType = protobuffctl.componentRegistry.hashlookupTable.get(target)
    const targetObject = protobuffctl.componentRegistry[targetType].get(target)
    const children = []
   
   // const usages = findAllU(sourceType, source)
    const parents = protobuffctl.componentRegistry.relations[sourceType].get(source)["parents"]// findAllUsages(type, id)
    const parentsRec=[]
    getParentsRec(sourceType,source,parentsRec)
    const  stillNeeded=checkIfStillNeeded(sourceType, source, target, parents, remove_from_components)
    deleteStatus[source]=deleteStatus[source]==undefined?[]:deleteStatus[source]
    deleteStatus[source].push(stillNeeded)    
    if ((stillNeeded == false || (stillNeeded&&remove_from_components))) {
            
             getChildrenRec(sourceType, source, children)
                children.map((child, index) => {
                    removeChildRelation(child["id"],child["type"],source,sourceType)
                    if(recoursive){
                    if (child["type"] == "types" || child["type"] == "fields"||child["type"] == "enums") {
                        remove(child["id"], source, recoursive,remove_from_components, deleteStatus)
                    }
                    else if(child["type"]=="enums"){

                    }
                }
                })
                parents.map((parent)=>{
                    removeParentRelation(source,sourceType,parent["id"],parent["type"],)

                })
    }
    protobuffctl.save()
}
/**
 * Pulls changes from the registry and edits the specified proto files.
 * @example
 * // Example for pulling changes from proto files
 * pull(["helloworld.proto", "test.proto"]);
 * 
 * @param {Array<string>} protoFiles - An array of proto file names or IDs.
 */function pull(protoFiles) {
    if (typeof (protoFiles) == "string") {
        protoFiles = protoFiles.split(",")
        if (!Array.isArray(protoFiles)) { protoFiles = [protoFiles] }
    }
    if (Array.isArray(protoFiles)) {
        protoFiles.map((file) => {
            const type = protobuffctl.componentRegistry.hashlookupTable.get(file)
            if (type != undefined && type == "protoFiles") {
                const obj = protobuffctl.componentRegistry.protoFiles.get(file)
                const content = getProtoContent(obj, true)
                obj.protobuffFiles.map((buff) => {
                    buff = protobuffctl.componentRegistry.protobuffFiles.get(buff)
                    createBuff(buff.lang, buff.out, obj.file_name, obj.file_path,)
                })
            } else {
                return console.warn("protoFile " + file + " is not exisiting")
            }
        })
    } else {
        return console.warn("either pass an array, or a string that seperates the files with a ,")
    }
    //protobuffctl.save()

}
/**
 * Updates the registry with changes from the specified proto files.
 * @example
 * // Example for pushing changes to proto files
 * push(["helloworld.proto", "test.proto"], true);
 * @param {Array<string>} protoFiles - An array of proto file names or IDs.
 */
function push(protoFiles) {
    if (typeof (protoFiles) == "string") {
        protoFiles = protoFiles.split(",")
        if (!Array.isArray(protoFiles)) { protoFiles = [protoFiles] }
    }
    for (file of protoFiles) {
        file = protobuffctl.componentRegistry.protoFiles.get(file)
        create("proto", file.file_name, file.file_path,)
    }
    protobuffctl.save()
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
    getAll, remove, findAllUsages, add, del, protogenArr, pull, push, createFromConfig, get, toJson, create, addWatcher, removeWatcher, stopAllWatchers, startAllWatchers,
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
       
       ----------------
         const elementType = element["type"]
        let elementArr
        const elementId = element["id"]
        const target = protobuffctl.componentRegistry[elementType].get(elementId)
        if (elementType == "protoFiles") {
            Object.entries(target).map(([key, val]) => {
                console.log(key)
                console.log(val)
                if (Array.isArray(val) && val.includes(id)) {

                    val = val.filter((item) => item !== id);
                    target[key] = val
                    protobuffctl.componentRegistry[elementType].set(elementId, target)
                }
            })
        }//<<< ENUM FIELD!!!!!!
        else if (Object.values(target)[0]["type"] == id) {
            protobuffctl.componentRegistry[elementType].delete(elementId)
        }
        else if (elementType == "methods") {
            Object.values(target)[0][element["use"]] = "NONETYPE"
            console.log(target)
        }
        //<<< Type
        else if (Array.isArray(target) && target.includes(id)) {
            const arr = target.filter((item) => item != id)
            protobuffctl.componentRegistry[elementType].set(elementId, arr)
        }
        else {
            protobuffctl.componentRegistry[elementType].delete(elementId)
            //elementArr=element
        }

        protobuffctl.save()
       
       
       */