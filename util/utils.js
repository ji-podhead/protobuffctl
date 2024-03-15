const chokidar = require('chokidar');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const protobuf = require('protobufjs');

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
    prototypes,
    languageFileExtensions
}