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

/*
*-------------------------------getElementsRecoursive---------------------------
*/

module.exports = {
    set, getParentsRec, addRelation,getChildrenRec, findAllU, getProtoContent, removeOld,addMissingtype
}
/*
_______________________________________________________________
*                           E N D 
_______________________________________________________________
*/

/*
// NOT USED
function findAllU(type, name, v = false) {
    type = addS(type)

    const appearances = []
    getParentsRec(type, name, appearances)
    return appearances
    //  getParentsRec(type,name,appearances)
    //  return appearances
    relations[type].map((relation) => {

        protobuffctl.componentRegistry[relation].forEach((val, key) => {
            //  console.log(key)
            //console.log(val)
            if (Array.isArray(val[type])) {
                const arr = val[type]
                arr.map((element) => {
                    if (element == name) {
                        appearances.push({ id: key, type: relation })
                    }
                })
            }
            else if (Array.isArray(val) && val.includes(name)) {
                appearances.push({ id: key, type: relation })
            }
            else if (key == name) {

                appearances.push({ id: key, type: relation })

            }
            if (relation == "methods") {
                const req = Object.values(val)[0]["requestType"]
                const resp = Object.values(val)[0]["responseType"]
                const use = req == name ? "requestType" : resp == name ? "responseType" : ""
                if (use != "") {
                    appearances.push({ id: key, type: relation, use: use })
                }
            }

        })
    })
    if (v == true) {
        console.log("found " + String(Math.abs(appearances.length)) + " usages:")
        console.log(appearances)
    }
    return appearances
}
function getElementsRecoursive(element, name, depth, v = false) {

    v ==true&& console.log("------------------------------START getElementsRecoursive---------------")
    const parentType = protobuffctl.componentRegistry.hashlookupTable.get(name)
    if (Array.isArray(element)) {
        v ==true&& console.log("------------START RECOURSIVE ARRAY MAP---------------")
        v ==true&& console.log("name " + name + " type " + parentType)
        element.map((item, index) => {
            if (typeof item === "object" && item !== null) {
                v ==true&& console.log(item.key)
                v ==true&& console.log(item.value)
                const type = protobuffctl.componentRegistry.hashlookupTable.get(item.key)
                v ==true&& console.log(type)
                if (childless.includes(type)) {
                    v ==true&& console.log(item)
                    item = Object.values(item)[0];
                    const child = protobuffctl.componentRegistry[type].get(item.key)
                    v ==true&& console.log(child)
                    item = getElementsRecoursive(child, type, depth - 1)
                    element[index] = item
                    v ==true&& console.log(item)
                    v ==true&& console.log(element)
                    return item
                }
            } else {
                v ==true&& console.log("-------- hash in array ---------")
                const type = protobuffctl.componentRegistry.hashlookupTable.get(item)
                v ==true&& console.log(`type ${type} item ${item}`)
                const child = protobuffctl.componentRegistry[type].get(item)
                v ==true&& console.log(`item  ${child} `)
                if (childless.includes(type)) {
                    item = child
                    v ==true&& console.log(Object.values(item)[0])
                    element[index] = item
                    v ==true&& console.log(item)
                    v ==true&& console.log(element)
                    return item
                }
                else {
                    item = getElementsRecoursive(child, item, depth - 1)
                    element[index] = item
                    v ==true&& console.log(item)
                    v ==true&& console.log(element)
                    return item
                }
            }
        })
        v ==true&& console.log("______________ recoursive array map finished________________")
        v ==true&& console.log(element)
        if (["endPoints", "protoFiles", "protobuffFiles", "protoUsers"]
            .includes(parentType)) {
            return { element }
        } else {
            return { [name]: element }
        }
    }
    else if (typeof element === "object" && element !== null) {
        v ==true&& console.log("----------- OBJECT -----------")
        v ==true&& console.log(element)
        v ==true&& console.log(name)
        Object.entries(element).forEach(([key, value]) => {
            v ==true&& console.log(key)
            v ==true&& console.log(value)
            if (key == "options") {
                const opt = protobuffctl.componentRegistry.options.get(value)
                v ==true&& console.log(opt)
                element[key] = opt
                return opt
            } else if (typeof (value) == "string") {
                return element[key] = value
            }
            else if (value == undefined) {
                return []
            }
            else if (Array.isArray(value)) {

                item = getElementsRecoursive(value, key, depth - 1)
                item = Object.values(item)[0];
                element[key] = item
                return item
            }
            else {
                const type = protobuffctl.componentRegistry.hashlookupTable.get(item.key)
                v ==true&& console.log(type)
                if (childless.includes(type)) {
                    v ==true&& console.log(item)
                    item = Object.values(item)[0];
                    //const child=protobuffctl.componentRegistry[type].get(key)
                    element[key] = child
                    v ==true&& console.log(child)
                    return item
                }
                else {
                    //item = Object.values(item)[0];
                    item = getElementsRecoursive({ [key]: value }, "tesat", -1)
                    element[key] = item
                    v ==true&& console.log(element)
                    v ==true&& console.log(child)
                    return item
                }
            }
        })
        return element
    }
    else {
        console.log(element)
        return element
    }
}

//only for init -- to complex
function getAllChildren(type, source, children, recoursive = true) {
    //  getChildrenRec(type,source,children)
    //  return children
    const relation = childRelations[type] != undefined ? childRelations[type][0] : false
    const sourceObject = protobuffctl.componentRegistry[type].get(source)
    if (type == "protoFiles") {
        Object.entries(sourceObject).map(([key, val]) => {
            try {
                val.map((id) => {
                    if (protobuffctl.componentRegistry.hashlookupTable.get(id)) {
                        recoursive && children.push({ type: key, id })
                        !recoursive && children.push(id)
                    }
                })
            } catch { }
        })
    }
    else if (type == "methods") {
        const val = Object.values(sourceObject)[0]
        const req = val["requestType"]
        const resp = val["responseType"]
        const item1 = recoursive == true ? { type: "type", id: req } : req
        const item2 = recoursive == true ? { type: "type", id: resp } : resp

        objectExistsInArray(children, item1) == false && children.push(item1)
        objectExistsInArray(children, item2) == false && children.push(item2)
        recoursive && getAllChildren("types", req, children)
        recoursive && getAllChildren("types", resp, children)
    }
    else if (type == "fields") {
        //const typename=Object.values(sourceObject)["type"]
        const en = checkIfEnum(source)
        if (en != false) {
            const item = recoursive == true ? { "type": "enums", id: en } : en
            objectExistsInArray(children, item) == false && children.push(item)
        }
    }
    else {
        if (sourceObject == undefined) {
            return console.warn("cant get  " + type + " " + source + "!!!" + " PLEASE CREATE IT FIRST!!!")
        }
        sourceObject.map((el) => {
            if (type == "types") {
                const item = recoursive == true ? { "type": "types", id: el } : el
                objectExistsInArray(children, item) == false && children.push(item)
            }

            const item = recoursive == true ? { "type": relation, id: el } : el
            objectExistsInArray(children, item) == false && children.push(item)
            const childRel = childRelations[relation] != undefined ? childRelations[relation][0] : false
            if (childRel != false) {
                recoursive && getAllChildren(relation, el, children)
            }
        })
    }
}


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
// NOT USED
function writeAndReplaceProto(abs_path, type, name, string) {
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
// NOT USED
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





function childUsage(source, target, add) {
    const sourceType = protobuffctl.componentRegistry.hashlookupTable.get(source)
    const targetType = protobuffctl.componentRegistry.hashlookupTable.get(target)
    if (typeof (sourceType) == "string" && typeof (targetType) == "string") {
        const sourceObject = protobuffctl.componentRegistry[sourceType].get(source)
        const targetObject = protobuffctl.componentRegistry[targetType].get(target)
        if (typeof (targetObject) == "object" && typeof (sourceObject) == "object") {
            if (add) {
                if(!Array.isArray(sourceObject)){
                Object.entries(sourceObject).map(
                    ([val, key]) => {
                        if (Array.isArray(val)) {
                            val.map((el) => {
                                if (targetObject[key].includes(el) == false) {
                                    targetObject[key].push(el)
                                }
                            })
                        }
                    })
                }
                else{
                    sourceObject.map((el)=>{
                        const childType=protobuffctl.componentRegistry.hashlookupTable.get(el)
                        if( targetObject[childType]!=undefined&&targetObject[childType].includes(el)==false){
                            targetObject[childType].push(el)
                            console.log("added " + childType+ " " + el +" to "+ targetType + " " + target)

                            if(childless.includes(childType)==false){
                                childUsage(el,target,true)
                            }
                        }
                    })
                }
                protobuffctl.componentRegistry[targetType].set(target, targetObject)
            } else {
                //         >> Removing <<
                console.log(sourceObject)
                if(!Array.isArray(sourceObject)){
                Object.entries(sourceObject).map(([val, key]) => {
                    if (Array.isArray(val)) {
                        val.map((el) => {
                            const usages = findAllU(el)
                            targetObject[key].push(el)

                        })
                    }
                })
            }
            else{ //         >> Removing childLess <<
                sourceObject.map((el)=>{
                    const childType=protobuffctl.componentRegistry.hashlookupTable.get(el)
                   // if( targetObject[childType]!=undefined){
                   //     targetObject[childType].filter((arEl)=>{arEl!=el})
                   // }
                  const isArray=(Array.isArray(targetObject))
                   if((isArray&&targetObject.includes(el))||(!isArray&&targetObject[childType].includes(el))){
                        const usages = findAllU(childType,el)
                        let stillNeeded
                        usages.map((usage)=>{
                            console.log(source + " has usage " + usage)
                            if(usage["type"]=="protoFiles"&&usages["id"]==target){
                                const usages2=findAllU(usage["type"],usage["id"])
                                usages2.map((el2)=>{
                                    if(el2["id"]==target){
                                        stillNeeded=usages["id"]
                                    }
                                })
                            }
                        })
                        if(!stillNeeded){
                            if(Array.isArray(targetObject) ){
                                targetObject=targetObject.filter((arEl)=>{arEl!=el})
                            }
                            else{
                               targetObject[childType]=targetObject[childType].filter((arEl)=>{arEl!=el})
                            }
                        console.log("removed " + childType+ " " + el +" from "+ targetType + " " + target)
                    }
                    else{
                        console.log(childType+ " " + el + " still needed by " + stillNeeded)
                    }
                    }
                })
            }
            }
            protobuffctl.componentRegistry[targetType].set(target,targetObject)
        }
        
        else {
            return console.log("couldnt get objects from componentregistry")
        }
    } else {
        return console.log("either source, or target is not existing")
    }
}
*/


