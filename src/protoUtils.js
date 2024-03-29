const { exec } = require('child_process');
const chokidar = require('chokidar');
const { Console } = require('console');
const path = require('path');
const serialize = require('serialize-javascript');
const { addS, childless, deepClone } = require("../util/utils.js")
const fs = require('fs');
const { Protobuffctl } = require("./protobuffctl");
const protobuffctl = new Protobuffctl()
function removeOld(newElement,oldElement) {
    console.log(newElement)
    Object.keys(newElement).forEach((key)  => {
        value=newElement[key]
        console.log(value)

        if (Array.isArray(value) && Array.isArray(oldElement[key])&&key!=="options") {
           
            oldElement[key].map((str)=>{
                console.log(JSON.stringify(str))
                
                if(!value.includes(str)){
                    try{

                       const type= protobuffctl.componentRegistry.hashlookupTable.get(str)
                       console.log(type) 
                       protobuffctl.componentRegistry[key].delete(str)
                       protobuffctl.componentRegistry.hashlookupTable[str].delete(str)
                }catch(err){console.warn("couldnt remove element " + err)}
            }
        })
    }
        else{
            try{
                console.log(value)
                console.log(protobuffctl.componentRegistry.hashlookupTable)
                const type= protobuffctl.componentRegistry.hashlookupTable.get(value)
                 protobuffctl.componentRegistry[type].delete(key)
         }catch(err){console.warn("couldnt remove element " + err)}
     }      
    });
    if (newElement["options"]&&oldElement["options"]!=newElement["options"]){
        try{
             protobuffctl.componentRegistry["options"].remove(oldElement[options])
     }catch(err){console.warn("couldnt remove element " + err)}
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
function set(type, name, values) {
    if (type) {
        const protobuffctl = new Protobuffctl();
        let element;
        type = addS(type)
        if (!protobuffctl.componentRegistry[type]) {
            console.log(`componentRegistry has no'${type}'. please select one of the following`);
            const fieldNames = Object.keys(protobuffctl.componentRegistry[type]);
            console.log(fieldNames);
        } else {
            values = typeof (values) == "string" ? extractStringsFromArrayString(values) : values
            console.log(values)
            element = protobuffctl.componentRegistry[type].get(name);
            if (element && !typeof (values) == "object") {
                console.log(` adding to ${name}`)
                if (!Array.isArray(values)) {
                    values = [values]
                }
                console.log(element)
                console.log(values)
                element = element.concat(values)
                protobuffctl.componentRegistry[type].set(name, element)
                protobuffctl.componentRegistry.hashlookupTable.set(name, type)
            }
            else {
                if (Array.isArray(values) || typeof values === "string") {
                    console.log("creating" + " " + name);
                    element = Array.isArray(values) ? values : [values];
                    protobuffctl.componentRegistry[type].set(name, element);
                    protobuffctl.componentRegistry.hashlookupTable.set(name, type)
                } else {
                    if (childless.includes(type)) {
                        protobuffctl.componentRegistry[type].set(name, values);
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
/*
*-------------------------------getProtoContent---------------------------
*/
function getProtoContent(protoFile, write, v = false) {
    const elementNew = getElementsRecoursive(JSON.parse(JSON.stringify(protoFile)), protoFile.id, "i")
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
    services.forEach(service => {
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
    protoContent += `\n`
    
    enums.forEach(type => {
        const enumName = Object.values(type)[0]["type"];
        console.log(enumName)
        console.log(protobuffctl.componentRegistry.enums)
        const values =(Object.values(protobuffctl.componentRegistry.enums.get(enumName))[0]);
        protoContent += `enum ${enumName} {\n`;
        console.log(values)

        Object.entries(values).forEach((item) => {
            const key= item[0]
            const val= item[1]
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
        fields.forEach(field => {
            console.log(field)
            const fieldName = Object.keys(field)[0];
            const fieldDetails = field[fieldName];
            protoContent += ` ${fieldDetails.type} ${fieldName} = ${fieldDetails.id};\n`;

        });
        protoContent += '}\n\n';
    });
    console.log("----------- created proto content -----------")
    console.log(protoContent)
    console.log("----------------------------------------------")
    write && fs.writeFileSync(protoFile.absolute_path, protoContent);

    return protoContent;
}
/*
*-------------------------------getElementsRecoursive---------------------------
*/
function getElementsRecoursive(element, name, depth, v = false) {
    v && console.log("------------------------------START getElementsRecoursive---------------")
    const parentType = protobuffctl.componentRegistry.hashlookupTable.get(name)
    if (Array.isArray(element)) {
        v && console.log("------------START RECOURSIVE ARRAY MAP---------------")
        v && console.log("name " + name + " type " + parentType)
        element.map((item, index) => {
            if (typeof item === "object" && item !== null) {
                v && console.log(item.key)
                v && console.log(item.value)
                const type = protobuffctl.componentRegistry.hashlookupTable.get(item.key)
                v && console.log(type)
                if (childless.includes(type)) {
                    v && console.log(item)
                    item = Object.values(item)[0];
                    const child = protobuffctl.componentRegistry[type].get(item.key)
                    v && console.log(child)
                    item = getElementsRecoursive(child, type, depth - 1)
                    element[index] = item
                    v && console.log(item)
                    v && console.log(element)
                    return item
                }
            } else {
                v && console.log("-------- hash in array ---------")
                const type = protobuffctl.componentRegistry.hashlookupTable.get(item)
                v && console.log(`type ${type} item ${item}`)
                const child = protobuffctl.componentRegistry[type].get(item)
                v && console.log(`item  ${child} `)
                if (childless.includes(type)) {
                    item = child
                    v && console.log(Object.values(item)[0])
                    element[index] = item
                    v && console.log(item)
                    v && console.log(element)
                    return item
                }
                else {
                    item = getElementsRecoursive(child, item, depth - 1)
                    element[index] = item
                    v && console.log(item)
                    v && console.log(element)
                    return item
                }
            }
        })
        v && console.log("______________ recoursive array map finished________________")
        v && console.log(element)
        if (["endPoints", "protoFiles", "protobuffFiles", "protoUsers"]
            .includes(parentType)) {
            return { element }
        } else {
            return { [name]: element }
        }
    }
    else if (typeof element === "object" && element !== null) {
        v && console.log("----------- OBJECT -----------")
        v && console.log(element)
        v && console.log(name)
        Object.entries(element).forEach(([key, value]) => {
            v && console.log(key)
            v && console.log(value)
            if (key == "options") {
                const opt = protobuffctl.componentRegistry.options.get(value)
                v && console.log(opt)
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
                v && console.log(type)
                if (childless.includes(type)) {
                    v && console.log(item)
                    item = Object.values(item)[0];
                    //const child=protobuffctl.componentRegistry[type].get(key)
                    element[key] = child
                    v && console.log(child)
                    return item
                }
                else {
                    //item = Object.values(item)[0];
                    item = getElementsRecoursive({ [key]: value }, "tesat", -1)
                    element[key] = item
                    v && console.log(element)
                    v && console.log(child)
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
module.exports = {
    set, getElementsRecoursive, getProtoContent,removeOld
}
/*
_______________________________________________________________
*                           E N D 
_______________________________________________________________
*/

/*
// NOT USED
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
*/


