const { exec } = require('child_process');
const chokidar = require('chokidar');
const { Console } = require('console');
const path = require('path');
const serialize = require('serialize-javascript');
const { addS, childless, deepClone, relations, childRelations, usagesRelations } = require("../util/utils.js")
const fs = require('fs');
const { Protobuffctl } = require("./protobuffctl");
const protobuffctl = new Protobuffctl()

function findAllU(type, name, v = false) {
    type = addS(type)

    const appearances = []
    getParentsRec(type, name, appearances)
    return appearances
}
function removeOld(newElement, oldElement) {
    console.log(newElement)
    Object.keys(newElement).forEach((key) => {
        value = newElement[key]
        console.log(value)

        if (Array.isArray(value) && Array.isArray(oldElement[key]) && key !== "options") {

            oldElement[key].map((str) => {
                console.log(JSON.stringify(str))

                if (!value.includes(str)) {
                    try {

                        const type = protobuffctl.componentRegistry.hashlookupTable.get(str)
                        console.log(type)
                        protobuffctl.componentRegistry[key].delete(str)
                        protobuffctl.componentRegistry.hashlookupTable[str].delete(str)
                    } catch (err) { console.warn("couldnt remove element " + err) }
                }
            })
        }
        else {
            try {
                console.log(value)
                console.log(protobuffctl.componentRegistry.hashlookupTable)
                const type = protobuffctl.componentRegistry.hashlookupTable.get(value)
                protobuffctl.componentRegistry[type].delete(key)
            } catch (err) { console.warn("couldnt remove element " + err) }
        }
    });
    if (newElement["options"] && oldElement["options"] != newElement["options"]) {
        try {
            protobuffctl.componentRegistry["options"].remove(oldElement[options])
        } catch (err) { console.warn("couldnt remove element " + err) }
    }
}
/*
*-------------------------------set---------------------------
*/
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
function set(type, name, values, v = false) {
    //hier fehl eigentlich nur noch den parents die children zu setzen bei services
    //das heißt bei services musst du alle children finden und diese dann zu allen protos hinzufügen
    //das schließt auch enums und nested als child von fields mit ein
    if (type) {
        const childType = childRelations[type][0]
        const protobuffctl = new Protobuffctl();
        let element;
        type = addS(type)
        if (!protobuffctl.componentRegistry[type]) {
            console.log(`componentRegistry has no'${type}'. please select one of the following`);
            const fieldNames = Object.keys(protobuffctl.componentRegistry[type]);
            console.log(fieldNames);
        } else {
            values = typeof (values) == "string"&&values!="" ? extractStringsFromArrayString(values) : values
            if(values==""){values=[]}
            if (element && !typeof (values) == "object") {
                console.log(` adding to ${name}`)
                if (!Array.isArray(values)) {
                    values = [values]
                }
                v ==true&& console.log(element)
                v ==true&& console.log(values)
                element = element.concat(values)
                protobuffctl.componentRegistry.hashlookupTable.set(name, type)
            }
            else { // types,services, oder 
                if (Array.isArray(values) || typeof values === "string") {
                    console.log("creating" + " " + name);
                    values.map((val) => {
                        addRelation(type,name,childType,val,"children")
                        addRelation(childType,val,type,name,"parents")
                    })
                    protobuffctl.componentRegistry.hashlookupTable.set(name, type)
                } else {
                    if (childless.includes(type)) {
                        protobuffctl.componentRegistry[type].set(name, values);
                        if (type == "methods") {
                            let protos = protobuffctl.componentRegistry.relations["methods"].get(name)
                            if(protos!=undefined){
                                protos=protos["parents"].filter((e) => e["type"] == "protoFiles")
                            }else{protos=[]}
                            Object.entries(Object.values(values)[0]).map(([t, val]) => {
                                if (val != "responseStream" && val != true) {
                                   
                                    // hier alle children (wenn types, enums oder nested zu protos hinzufügen)
                                    const vChilds = []
                                    getChildrenRec("types", val,vChilds)
                                    protos!=undefined&&protos.map((proto1) => {
                                    vChilds.map((t2) => {
                                        if ((t2["type"]=="enums")) {
                                          
                                                addRelation(t2["type"],t2["id"],"protoFiles",proto1["id"],"parents")
                                            }
                                            })
                                    addRelation("types",val,"protoFiles",proto1["id"],"parents")
                                })
                                addRelation("types",val,"methods",name,"parents")
                                addRelation(type,name,childType,val,"children")
                                    v ==true&& console.log(val)
                                }
                            })
                        }
                        else if (type == "fields") {
                            v ==true&& console.log(name)
                            const en = checkIfEnum(name)
                            if (en != false) {
                                addRelation("enums",en,"fields",name,"parents")
                                addRelation("fields",name,"enums",en,"children")
                            }
                        }
                        protobuffctl.componentRegistry.hashlookupTable.set(name, type)
                    } else {
                        console.log("please pass either an array of values, a string, or an object");
                        return;
                    }
                }
            }
            protobuffctl.save();
            console.log(`successfully set ${type} ${name}\n ${JSON.stringify(protobuffctl.componentRegistry[type].get(name))}`);
        }
    }
}
function addRelation(type,id,targetType,target,cat,v=false){
    console.log(
        `add ${cat} ${target} to ${type} ${id}
        `
    )
    let rel=protobuffctl.componentRegistry.relations[type].get(id)
    if (rel == undefined) {
        const temp = {
            children: [],
            parents: []
        }
        rel = temp
    }
    const temp={type:targetType,id:target}
    
    if(rel[cat].filter((e)=>e["id"]==target).length==0){
    rel[cat].push(temp)
    protobuffctl.componentRegistry.relations[type].set(id,rel)
    v ==true&& console.log(`--------------- >> set relation ${id} <<`)
    v ==true&& console.log(rel)
    v ==true&& console.log("---------------")
    }
}

function addMissingtype(typeName,parent){
    addRelation("types","NONETYPE","methods",parent,"children")
    let parents=[];
    const rel={"children":[],parents:[]}
    protobuffctl.componentRegistry.relations["types"].set(typeName,rel)
    getParentsRec("methods",parent,parents)
    parents=new Array(parents.filter((e)=>e["type"]=="protoFiles").map((e)=>{return e["id"]}))
    parents.map((p)=>{
        p=p[0]
        addRelation("types",typeName,"protoFiles",p,"children")
        addRelation("protoFiles",p,"types",typeName,"parents")
    })

    set("types",typeName,"")
    return 
}
/*
*-------------------------------getProtoContent---------------------------
*/
function getProtoContent(protoFile, write, v = false) {

    const elementNew = getRecFill("protoFile", protoFile.id)// getElementsRecoursive(JSON.parse(JSON.stringify(protoFile)), protoFile.id, "i")
    console.log(elementNew)
    const services = elementNew["services"]
    const types = elementNew["types"]
    const enums = elementNew["enums"]
    const options = elementNew["options"]
    console.log(options)
    const syntax = protoFile.syntax
    const proto_package = protoFile.proto_package
    console.log(`-------writing proto file ${protoFile.id} ---------\n            syntax: ${syntax} \n            package: ${proto_package} \n            services: ${services} \n            types: ${types} \n-------------------------------------------------`)
    let protoContent = syntax
    protoContent += `\n`
    options.forEach(option => {
        protoContent += `${option}\n`;
    });
    protoContent += `\n${proto_package}\n`
    protoContent += `\n`
    console.log(services)
    services.map((service) => {
        const serviceName = Object.keys(service)[0];
        const methods = service[serviceName];
        protoContent += `service ${serviceName} {\n`;
        methods.forEach(method => {
            const methodName = Object.keys(method)[0];
            const methodDetails = method[methodName];
            const repsonseHash=protobuffctl.componentRegistry.hashlookupTable.get(methodDetails.responseType)
            const requestHash= protobuffctl.componentRegistry.hashlookupTable.get(methodDetails.requestType)
           if(repsonseHash==undefined||requestHash==undefined) {
                repsonseHash==undefined&&addMissingtype(methodDetails.responseType,methodName)
                requestHash==undefined&&addMissingtype(methodDetails.requestType,methodName)
           }
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
    protoContent += `\n`

    enums&&enums.forEach(type => {
        const enumName = Object.keys(type)[0];
        console.log(enumName)
        console.log(protobuffctl.componentRegistry.enums)
        const values = Object.entries(Object.values(Object.values(type)[0])[0])//.values.values//Object.values(Object.entries(Object.values(type)[0]))[0];
        console.log(values)
        protoContent += `enum ${enumName} {\n`;
        console.log(values)
        values.map(([key, val]) => {
            console.log(key)
            console.log(val)
            protoContent += `${key} = ${val};\n`;
            console.log(protoContent)
        });
        protoContent += '}\n\n';

    });
    types.forEach(type => {
        const typeName = Object.keys(type)[0];
        const fields = type[typeName];
        protoContent += `message ${typeName} {\n`;
        let idCounter = 0
        fields!=undefined&&fields.forEach(field => {
            console.log(field)
            const fieldName = Object.keys(field)[0];
            const fieldDetails = field[fieldName];
            protoContent += ` ${fieldDetails.type} ${fieldName} = ${idCounter};\n`;
            idCounter += 1

        });
        protoContent += '}\n\n';
    });
    console.log("----------- created proto content -----------")
    console.log(protoContent)
    console.log("----------------------------------------------")
    write && fs.writeFileSync(protoFile.absolute_path, protoContent);

    return protoContent;
}
function checkIfEnum(field) {
    const fieldObject = protobuffctl.componentRegistry["fields"].get(field)
    const val = Object.values(fieldObject)[0]["type"]
    const lookup = protobuffctl.componentRegistry.hashlookupTable.get(val)
    if (lookup && lookup == "enums") {
        return val
    }
    else {
        return false

    }
}
function objectExistsInArray(array, object) {
    return array.some(item => JSON.stringify(item) === JSON.stringify(object));
}
function getChildrenRec(type, source, children, v = false) {

    const childType = type
    const relations = protobuffctl.componentRegistry.relations

    rec(source)

    function rec(newSource) {

        const newType = protobuffctl.componentRegistry.hashlookupTable.get(newSource)
        if (newType == "enums") {
            return
        }
        v==true && console.log(newType)
        const rel = relations[newType]
        const parent = rel.get(newSource)
        v==true && console.log(parent)
        parent["children"].forEach((child, key) => {
            const childObj = { type: child["type"], id: child["id"] }
            objectExistsInArray(children, childObj) == false && children.push(childObj)
            rec(child["id"])

        })
        //protobuffctl.componentRegistry.relations = relations
    }
    console.log(`----------------\n >> allChildren of ${source} <<`)
    console.log(children)
    console.log("-----------------")
}
function getParentsRec(type, source, parents, v = false) {
    const parentType = type
    const relations = protobuffctl.componentRegistry.relations
    rec(source, parentType)
    function rec(newSource, newType) {
        console.log(newSource)
        if (protobuffctl.componentRegistry.hashlookupTable.get(newSource) == "enums") {
            newType = "enums"
        }
        v ==true&& console.log(newType)
        const rel = relations[newType]
        const parent = rel.get(newSource)
        v ==true&& console.log(parent)

        parent["parents"].forEach((parent, key) => {
            const parentObject = { type: parent["type"], id: parent["id"] }
            objectExistsInArray(parents, parentObject) == false && parents.push(parentObject)
            const typeType = usagesRelations[newType][0]
            v ==true&& console.log(typeType)
            if (parent["type"] != "protoFiles") {
                // console.log(children)
                parent["id"]!=undefined&&rec(parent["id"], typeType)

            }
            else {
                // rec(child["id"], "enums")

            }
        })
        //protobuffctl.componentRegistry.relations = relations
    }
    console.log(`----------------\n >> allParents of ${source} <<`)
    console.log(parents)
    console.log("-----------------")
}

function getRecFill(type, id) {
    type = addS(type)
    const children = []
    const childObjects = { //order is important to avoid recoursion
        "fields": new Map(),
        "enums": new Map(),
        "nested": new Map(),
        "types": new Map(),
        "methods": new Map(),
        "services": new Map(),
        "protoFiles": new Map(),
    }
    const childRelations = { //order is important to avoid recoursion
        "fields": [],
        "enums": [],
        "nested": [],
        "types": [],
        "methods": [],
        "services": [],
        "protoFiles": [],
    }
    getChildrenRec(type, id, children)
    children.map((child) => { //SETTING childObjects
        childObjects[child["type"]].set(child["id"], protobuffctl.componentRegistry[child["type"]].get(child["id"]))
        childRelations[child["type"]].push(child)
    })

    childObjects[type].set(id, protobuffctl.componentRegistry[type].get(id))
    const proto = type == "protoFiles" ? childObjects["protoFiles"].get(id) : undefined
    
    
    Object.entries(childRelations).map(([key,cat]) => {  //replace parents
        cat.map((item)=>{
          
        const obj = childObjects[item["type"]].get(item["id"])
        const childtype = item["type"]
        const childId = item["id"]
        const rel = protobuffctl.componentRegistry.relations[childtype].get(childId)
        function replaceinArr(parent) {
            let parObj = childObjects[parent["type"]].get(parent["id"])
            console.log(parObj)
            parObj =Array.isArray(parObj)==false?[]:parObj// parObj.filter((e) => e != item["id"])
            parObj.push(obj)
            childObjects[parent["type"]].set(parent["id"], parObj)
        }
        function setinObj() {
            const parentId=proto.id
            let parObj = childObjects["protoFiles"].get(parentId)
           // parObj[item["type"]]=parObj[item["type"]].filter((x)=>x!=childId)
            console.log(parObj)
            parObj[item["type"]]=parObj[item["type"]]==undefined?[]:parObj[item["type"]]
            parObj[item["type"]].push({[childId]:obj})
            console.log(parObj)
            childObjects["protoFiles"].set(parentId, parObj)
        }
        switch (addS(item["type"])) {
            case ("services"): {  //            >> is In Proto <<
                proto != undefined && setinObj()
                break;
            }
            case ("types"): { //            >> is In Proto <<
                proto != undefined && setinObj()
                
                break;
            }
            case ("enums"): {  //            >> is In Proto <<
                proto != undefined && setinObj()
                break;
            }
            case ("methods"): {
                rel["parents"].map((parent) => {
                    parent["type"] == "services" && replaceinArr(parent)
                })
                break;
            }
            case ("fields"): {
                rel["parents"].map((parent) => {
                    parent["type"] == "types" && replaceinArr(parent)
                })
                break;
            }
        }
    })
})
    const r = childObjects[type].get(id)
    if(type=="protoFiles"){
        r["options"]=protobuffctl.componentRegistry["options"].get(proto["options"])
        r["syntax"]=proto["syntax"]
    }
    console.log(r)
    return r
}
module.exports = {
    set, getParentsRec, addRelation,getChildrenRec, findAllU, getProtoContent, removeOld,addMissingtype
}
/*
_______________________________________________________________
*                           E N D 
_______________________________________________________________
*/
