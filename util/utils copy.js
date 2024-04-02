const chokidar = require('chokidar');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const protobuf = require('protobufjs');
function deepClone(obj) {
    if (obj === null || typeof obj !== "object") {
        return obj;
    }
    let clone = Array.isArray(obj) ? [] : {};
    for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
            clone[key] = deepClone(obj[key]);
        }
    }
    return clone;
}
const parents = {
    services: ["protoFiles"],
    methods: ["services", "protoFiles"],
    types: ["protoFiles", "methods","services"],
    fields: ["types", "protoFiles"],
    enums: ["protoFiles", "fields", "types"]
}
const childRelations={
    protoFiles:["methods","services","fields","types"],
    services:["methods"],
    methods:["types"],
    types:["fields","enums"]
}
const usagesRelations={
    services: ["protoFiles"],
    methods: ["services", "protoFiles"],
    types: ["protoFiles", "methods","services"],
    fields: ["types", "protoFiles"],
    enums: ["protoFiles", "fields"]
}      
function extractStringsFromArrayString(arrayString) {
    if (arrayString.startsWith('[') && arrayString.endsWith(']')) {
        // Entfernen Sie die eckigen Klammern am Anfang und am Ende
        const cleanedString = arrayString.slice(1, -1);
        // Teilen Sie den String an den Kommas auf
        const substrings = cleanedString.split(',');
        // Entfernen Sie mögliche Anführungszeichen um die Elemente
        const strings = substrings.map(substring => substring.trim().replace(/^"|"$/g, ''));
        return strings;
    } else {
        // Der String repräsentiert kein Array
        return null;
    }
}
function addS(str){
    if (str.charAt(str.length - 1) !== 's') {
        str += 's';
    }
    return str
}
// ---------------------------- STATIC ------------------------------------
const prototypes = ["double", "float", "int32", "int64", "uint32", "uint64", "sint32", "sint64", "fixed32", "fixed64", "sfixed32", "sfixed64", "bool", "string", "bytes"]
const languageFileExtensions = {
    go: {
        fileExtension: '.pb.go',
        command: '--go_out'
    },
    java: {
        fileExtension: '.pb.java',
        command: '--java_out'
    },
    python: {
        fileExtension: '.pb2.py',
        command: '--python_out'
    },
    csharp: {
        fileExtension: '.pb.cs',
        command: '--csharp_out'
    },
    ruby: {
        fileExtension: '.pb.rb',
        command: '--ruby_out'
    },
    objc: {
        fileExtension: '.pb.m',
        command: '--objc_out'
    },
    php: {
        fileExtension: '.pb.php',
        command: '--php_out'
    },
    dart: {
        fileExtension: '.pb.dart',
        command: '--dart_out'
    },
    rust: {
        fileExtension: '.pb.rs',
        command: '--rust_out'
    },
    swift: {
        fileExtension: '.pb.swift',
        command: '--swift_out'
    },
    kotlin: {
        fileExtension: '.pb.kt',
        command: '--kotlin_out'
    },
    scala: {
        fileExtension: '.pb.scala',
        command: '--scala_out'
    },
    js: {
        fileExtension: '.pb.js',
        command: '--js_out'
    },
    ts: {
        fileExtension: '.ts',
        command: '--ts_out'
    }
};
const childless=[
    "options","fields","methods","enums","protobuffComponents","clients","Streams","callbacks","absolute_path","file_name","file_path"
]
/**           
 * @description returns: 0 (a>b) | 1 (b>a) | 2  no related
 */
function isSubdirectory(path_a, path_b) {
    path_a = splitPath(path_a);
    path_b = splitPath(path_b);
    const paths = [
        { path: path_a, original: 'a' },
        { path: path_b, original: 'b' }
    ];
    const sortedPaths = paths.sort((a, b) => a.path.length - b.path.length);
    const [shorterPathObj, longerPathObj] = sortedPaths;
    const [shorterPath, longerPath] = [shorterPathObj.path, longerPathObj.path];
    const slicedLongerPath = longerPath.slice(0, shorterPath.length);
    if (JSON.stringify(slicedLongerPath) === JSON.stringify(shorterPath)) {
        return shorterPathObj.original === 'a' ? 0 : 1; // a>b oder b>a
    } else if (JSON.stringify(shorterPath) === JSON.stringify(slicedLongerPath)) {
        return shorterPathObj.original === 'a' ? 1 : 0; // b>a oder a>b
    } else {
        return 2; // not_related
    }
}
function mergeFields(target, source, fields,keep_old=false) {
    fields.forEach(field => {
        console.log(field)
        if (Array.isArray(target[field]) && Array.isArray(source[field])) {
            // Konkatenation für Array-Typen, aber vermeiden Sie Duplikate
            if(keep_old){
            target[field] = source[field].concat(target[field]).filter((item, index, self) => {
                return self.indexOf(item) === index;
            });
            }
        } else if (typeof target[field] !== 'undefined' && typeof source[field] !== 'undefined') {
            // Überschreiben für nicht-Array-Typen
            target[field] = source[field];
        } else if (Array.isArray(target[field])) {
            // Wenn das Zielfeld ein Array ist, aber das Quellfeld nicht definiert ist, überspringen Sie die Überschreibung
            console.log(`Quellfeld ${field} ist nicht definiert, Zielfeld bleibt unverändert.`);
        } else if (Array.isArray(source[field])) {
            // Wenn das Quellfeld ein Array ist, aber das Zielfeld nicht definiert ist, setzen Sie das Zielfeld auf das Quellfeld
            target[field] = source[field];
        } else {
            console.error(`Feld ${field} ist weder ein Array noch definiert in beiden Ziel- und Quellobjekten.`);
        }
    });
}
function initObject(object,fields){
    fields.forEach(field => {
        if(object[field]==undefined){
            object[field]=[]
        }
    })
} 
function splitPath(fullPath) {
    const isWindows = process.platform === 'win32';
    const separator = isWindows ? '\\' : '/';
    return fullPath.split(separator);
}
function joinPath(pathParts) {
    const isWindows = process.platform === 'win32';
    const separator = isWindows ? '\\' : '/';
    return pathParts.join(separator);
}

function getUniqueName(map, baseName) {
    const keys = Array.from(map.keys());
    const filteredKeys = keys.filter(key => key.startsWith(baseName));
    const keysWithNumbers = filteredKeys.map(key => {
        const match = key.match(/_([0-9A-Fa-f]+)$/);
        return match ? parseInt(match[1], 16) : 0;
    });
    keysWithNumbers.sort((a, b) => a - b);
    let missingNumber = 1;
    for (let i = 0; i < keysWithNumbers.length; i++) {
        if (keysWithNumbers[i] !== missingNumber) {
            break;
        }
        missingNumber++;
    }
    const uniqueName = `${baseName}_${missingNumber.toString(16).toUpperCase()}`;
    if (missingNumber > 255) {
        throw new Error('Maximum number of unique IDs reached for this base name.');
    }

    return uniqueName;
}

function replaceMessageNamesInProtoFile(abs_path, newPrefix) {
    fs.readFile(abs_path, 'utf8', (err, data) => {
        if (err) {
            console.error('Fehler beim Lesen der .proto-Datei:', err);
            return;
        }
        // Regulärer Ausdruck, um den Teil des Strings zu erfassen, der nach 'message' kommt und vor dem nächsten '{' aufhört
        const regex = /message\s+(\w+)\s*\{/g;
        // Ersetzen Sie die alten Namen durch die neuen Namen
        const updatedData = data.replace(regex, (match, p1) => `message ${newPrefix}_${p1} {`);
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
module.exports={
    getUniqueName,
    relations: parents,
    isSubdirectory,
    splitPath,
    joinPath,
    mergeFields,
    initObject,
    deepClone,
    addS,
    prototypes,
    childRelations,
    languageFileExtensions,
     childless,
    extractStringsFromArrayString,
    CustomMap
}