const chokidar = require('chokidar');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const protobuf = require('protobufjs');
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
/**         ------------------ ProtoFile ---------------------    
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
function mergeFields(target, source, fields) {
    fields.forEach(field => {
        if (Array.isArray(target[field]) && Array.isArray(source[field])) {
            // Konkatenation für Array-Typen
            target[field] = Array.concat(source[field], target[field]);
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
function getUniqueName(map, baseName) {
    const keys = Array.from(map.keys());
    const filteredKeys = keys.filter(key => key.startsWith(baseName));
    const keysWithNumbers = filteredKeys.map(key => {
        const match = key.match(/_(\d+)$/);
        return { key, number: match ? parseInt(match[1], 10) : 0 };
    });
    keysWithNumbers.sort((a, b) => a.number - b.number);
    // Anstatt das Array von Namen zurückzugeben, geben Sie den größten Index zurück
    return keysWithNumbers.length > 0 ? keysWithNumbers[keysWithNumbers.length - 1].number : 0;
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
    isSubdirectory,
    splitPath,
    joinPath,
    mergeFields,
    initObject,
    prototypes,
    languageFileExtensions,
    extractStringsFromArrayString,
    CustomMap
}