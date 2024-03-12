//    JI_UI_
//    |
//    |-- Database_Schema
//    |       |
//    |       |-- ProtoFile
//    |       |   |-- Name
//    |       |   |-- Index
//    |       |   |-- ProtoFilePath
//    |       |   |-- Message
//    |       |   |   |-- Content
//    |       |   |   |-- Lang
//    |       |   |   |-- Parent
//    |       |   |
//    |       |   |-- Enum
//    |       |   |   |-- Content
//    |       |   |   |-- Lang
//    |       |   |   |-- Parent
//    |       |
//    |       |-- Endpoint 
//    |       |   |-- Name
//    |       |   |-- Index
//    |       |   |-- EndpointPath
//    |       |   |-- Protofiles
//    |       |   |-- ProtobuffFiles
//    |       |       |-- ProtoFilePath
//    |       |       |-- ProtobuffFilePath
//    |       |       |-- Clients
//    |       |       |-- Requests
//    |       |       |-- Callbacks
//    |       |       |-- Streams
//    |       |
//    |       |-- ProtobuffUser
//    |       |   |
//    |       |   |-- ProtobuffUserPath
//    |       |   |-- ProtobuffUserComponent
//    |       |        |-- type
//    |       |        |-- parent
//    |       |        |-- line
//    |       |        |-- content
//    |       |
//    |       |-- ProtobuffUserComponentPreset
//    |       |    |
//    |       |    |-- type
//    |       |    |-- lang
//    |       |    |-- preset const 

const chokidar = require('chokidar');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const { ProtobuffGenerator } = require("@ji-podhead/protoc-helper")


/**
 * Represents the content of a part of a Proto or Protobuff file.
 * @param {string} type - The type of content (e.g., 'message', 'enum').
 * @param {string} contentString - The actual content string.
 */
class content {
    constructor(type, contentString) {
        this.type = type;
        this.contentString = contentString;
    }
}
/**
 * Represents a message within a Proto or Protobuff file.
 * @param {string} lang - The language of the message.
 * @param {string} parent - The parent of the message (either a Proto file or a Protobuff file).
 * @param {content} content - The content of the message.
 */
class messeage {
    constructor(lang, parent, content) {
        this.lang = lang;
        this.parent = parent; // either proto-file or protobuff-file
        this.content = content;
    }
}
/**
 * Represents an enumeration within a Proto or Protobuff file.
 * @param {string} lang - The language of the enumeration.
 * @param {string} parent - The parent of the enumeration (either a Proto file or a Protobuff file).
 * @param {content} content - The content of the enumeration.
 */
class Enum {
    constructor(lang, parent, content) {
        this.lang = lang;
        this.parent = parent; // either proto-file or protobuff-file
        this.content = content;
    }
}
/**
 * Represents the path to a Proto file.
 * @param {string} protobuff - The protobuff associated with the file.
 * @param {string} path - The path to the file.
 * @param {Array} endpoints - The endpoints defined in the file.
 */
class ProtoFilePath {
    constructor(protobuff, path, endpoints) {
        this.protobuff = protobuff;
        this.path = path;
        this.endpoints = endpoints;
    }
}
/**
 * Represents a Proto file.
 * @param {string} name - The name of the .proto file.
 * @param {number} index - The index of the file.
 * @param {string} path - The path to the .proto file.
 * @param {string} targetpath - The targetpath to the created protovuff-files
 * @param {Array} services - The services defined in the file.
 * @param {Array} messeages - The messages defined in the file.
 * @param {Array} endPoints - The endpoints defined in the file.
 * @param {Array} protobuffUsers - The endpoints defined in the file.
 * 
 */
class ProtoFile {
    constructor(name, targetPath, index, path, services, messeages, endPoints, protobuffUsers) {
        this.index = index;
        this.name = name;
        this.path = path;
        this.targetPath = targetPath; // The path to the .proto file
        this.services = services;
        this.messeages = messeages;
        this.endPoints = endPoints;
        this.protobuffFiles = protobuffUsers
    }
}
class Client {
    constructor(parent, users) {
        this.parent = parent;
        this.users = users;
    }
}
class Request {
    constructor(parent, users) {
        this.parent = parent;
        this.users = users;
    }
}
class Callback {
    constructor(parent, users) {
        this.parent = parent;
        this.users = users;
    }
}
class Stream {
    constructor(parent, users) {
        this.parent = parent;
        this.users = users;
    }
}

/**
 * Represents the path to a Protobuff file.
 * @param {string} protobuff - The protobuff associated with the file.
 * @param {string} path - The path to the file.
 */
class ProtobuffFilePath {
    constructor(protobuff, path) {
        this.protobuff = protobuff;
        this.path = path;
    }
}

/**
 * Represents a Protobuff file.
 * @param {string} name - The name of the .proto file.
 * @param {string} path - The path to the .proto file.
 .
 * @param {Array} streams - The streams defined in the file.
 * @param {Array} callbacks - The callbacks defined in the file.
 * @param {Array} requests - The requests defined in the file.
 * @param {Array} clients - The clients defined in the file.
 */
class ProtobuffFile {
    constructor(name, path, streams, callbacks, requests, clients, protobuffUsers) {
        this.name = name; // The name of the .proto file
        this.path = path; // The path to the .proto file
        this.streams = streams;
        this.callbacks = callbacks;
        this.requests = requests;
        this.clients = clients;
        this.protobuffUsers = protobuffUsers
    }
}
/**
 * Represents the path to a Protobuff user file.
 * @param {string} protobuff - The protobuff associated with the file.
 * @param {string} path - The path to the file.
 */
class ProtobuffUserPath {
    constructor(protobuff, path) {
        this.protobuff = protobuff;
        this.path = path;
    }
}
/**
 * Represents a file that uses and imports Protobufs, such as a JavaScript file of a web framework.
 * @param {string} name - The name of the file.
 * @param {string} path - The path to the file.
 * @param {Array} protobuffImports - The imported Protobufs.
 * @param {Array} components - The components defined within the file.
 */
class ProtobuffUser {
    constructor(name, path, protobuffImports, components) {
        this.name = name; // The name of the file
        this.path = path; // The path to the file
        this.protobuffImports = protobuffImports; // The imported Protobufs
        this.components = components; // The components defined within the file
    }
}
/**
 * Represents a preset for a Protobuff user component.
 * @param {string} type - The type of the component.
 * @param {string} lang - The language of the component.
 * @param {string} preset - The preset for the component.
 */
class ProtobuffUserComponentPreset {
    constructor(type, lang, preset) {
        this.type = type;
        this.lang = lang;
        this.preset = preset;
    }
}
/**
 * Represents a component within a Protobuff user file.
 * @param {string} type - The type of the component.
 * @param {string} parent - The parent of the component.
 * @param {number} line - The line number of the component.
 * @param {string} content - The content of the component.
 */
class ProtobuffUserComponent {
    constructor(type, parent, line, content) {
        this.type = type;
        this.parent = parent; // The parent of the component
        this.line = line; // The line number of the component
        this.content = content; // The content of the component
    }
}
class EndpointPath {
    constructor(protobuff, path) {
        this.protobuff = protobuff;
        this.path = path;
    }
}
/**
 * Represents an endpoint.
 * @param {Array} protoFiles - The Proto files associated with the endpoint.
 * @param {Array} protobuffFiles - The Protobuff files associated with the endpoint.
 * @param {string} name - The name of the endpoint.
 * @param {number} index - The index of the endpoint.
 * @param {string} path - The path to the endpoint.
 */
class Endpoint {
    constructor(protoFiles, protobuffFiles, name, index, path) {
        this.protoFiles = protoFiles;
        this.protobuffFiles = protobuffFiles;
        this.name = name;
        this.index = index;
        this.path = path;
    }
}
/**
 * Represents a main endpoint, which is a specialized type of endpoint.
 * @param {Array} protoFiles - The Proto files associated with the endpoint.
 * @param {Array} protobuffFiles - The Protobuff files associated with the endpoint.
 * @param {string} name - The name of the endpoint.
 * @param {number} index - The index of the endpoint.
 * @param {string} path - The path to the endpoint.
 * @param {string} buildTarget - Additional property for the build target.
 */
class MainEndpoint extends Endpoint {
    constructor(protoFiles, protobuffFiles, name, index, path, buildTarget) {
        super(protoFiles, protobuffFiles, name, index, path);
        this.buildTarget = buildTarget; // Additional property for the build target
    }
}

/**
 * Protofile watcher that autoatically creates protobuff-files
 * @param {Array} protoFile - The Proto file it should watch.
  */

class Filewatcher {
    constructor(protoFile) {
        this.proto = protoFile
        this.filePath = protoFile.path.path;

    }

    onFileChange(path) {
        console.log(`File ${path} has been changed`);
        console.log(__dirname)
        const dir = String(__dirname) + "/"
        const generator = new ProtobuffGenerator()
        generator.generateProtobuf("go", dir, "helloworld.proto", dir)


        // Hier können Sie Ihre Logik einfügen, um auf die Änderung zu reagieren
        // Zum Beispiel: Generieren Sie neue Protobuf-Dateien basierend auf den Änderungen
    }

    startWatcher() {
        return new Promise((resolve, reject) => {
            console.log('Starting file watcher...');

            // Erstellen Sie einen Watcher für die spezifische Datei
            this.watcher = chokidar.watch(this.filePath, {
                ignored: /(^|[\/\\])\../, // Ignorieren Sie versteckte Dateien
                persistent: true
            });

            // Fügen Sie Event-Handler hinzu
            this.watcher
                .on('add', path => this.onFileChange(path))
                .on('change', path => this.onFileChange(path))
                .on('unlink', path => console.log(`File ${path} has been removed`));

            // Auflösen des Promises, wenn der Watcher gestartet ist
            resolve({
                stop: () => {
                    console.log('Stopping file watcher...');
                    this.watcher.close();
                }
            });
        });
    }
}

class WatcherManager {
    constructor() {
       // @ts-ignore
       if (WatcherManager.instance) {
          return WatcherManager.instance;
       }
 
       this.watchers = new Map();
       WatcherManager.instance = this;
    }
 
    static getInstance() {
       if (!WatcherManager.instance) {
          new WatcherManager();
       }
       return WatcherManager.instance;
    }
 
    async initialize(configPath) {
       try {
          const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
          console.log('Configuration loaded successfully.');
 
          for (const protoFile of config.protoFiles) {
             await this.addWatcher(protoFile);
          }
 
          for (const protobuffFile of config.protobuffFiles) {
             await this.addWatcher(protobuffFile);
          }
 
          for (const component of config.components) {
             await this.addWatcher(component);
          }
 
          console.log('All watchers added.');
       } catch (error) {
          console.error('Error initializing:', error);
       }
    }
    async addWatcher(protofile) {
       const filewatcher = new Filewatcher(protofile);
       await filewatcher.startWatcher();
       this.watchers.set(protofile, filewatcher);
       console.log(`Watcher added for ${protofile}`);
    }
 
    stopAllWatchers() {
       for (const watcher of this.watchers.values()) {
          watcher.close();
       }
       console.log('All watchers stopped.');
    }
 }
module.exports = {
    content,
    messeage,
    Enum,
    ProtoFilePath,
    ProtoFile,
    Client,
    Request,
    Callback,
    Stream,
    ProtobuffFilePath,
    ProtobuffFile,
    ProtobuffUserPath,
    ProtobuffUser,
    ProtobuffUserComponentPreset,
    ProtobuffUserComponent,
    EndpointPath,
    Endpoint,
    WatcherManager,
    MainEndpoint,
    Filewatcher
}