const chokidar = require('chokidar');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const { ProtobuffGenerator } = require("@ji-podhead/protoc-helper")
const { classDescriptions } = require("./descriptions/classdescriptions")
//also irgendwie versteh ich mein code hier nicht. ich nehme eine map und package zum klassennahmen die methods rein, aber vorher gucke ich in der registry nach ob die methods schon existieren, adde sie dann aber nicht dazu falls nicht, also wird das niemals wahr sein.
//was mich aber viel  mehr stört ist, das ich später die mthoden in der protouser und protobufffile brauche. naja eigentlich auch nicht so wirklich, dann ist ein callback/request immer erstmal einem service zugewiesen und hat zusätzlich ein unterpunkt method. aber ich wollte in der protouser sektion eigentlich codespezifische namen nehmen wie client, request. was für ein type das ist, ist ja dem anderen server egal... hmm naja nicht wenn der ein genaues objekt erwartet. ich kann das ja so machen 
//dann hat die registry kein methods feld, aber eine art übersetzung dazu
//also wir halten fest: in der protoregistry sind die methods den services untergeordnet und haben kein eigenes feld. das wäre ja schwachsinning, aber wir können  noch eine gesammtliste machen, wo wir das für suchfunktionen übernehmen können, das ist dann aber nicht codespezifisch zu verwenden, (bzw nur beim erstellen neuer types durch kopie) weil das die struktur und die typensicherheit gefährden würde. ich wollte das uhrsprünglich machen damit unterschiedliche services auf den selben method pointen können, aber das geht ja mit protofiles eh nicht oder?
// ---------------------------- STATIC ------------------------------------
const prototypes = ["nested", "double", "float", "int32", "int64", "uint32", "uint64", "sint32", "sint64", "fixed32", "fixed64", "sfixed32", "sfixed64", "bool", "string", "bytes"]
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
// ---------------------------- OOP ------------------------------------
/**         ------------------ content ---------------------    
 * @description ${classDescriptions.content.description}
 */

class content {
    constructor(type, contentString) {
        this.type = type;
        this.contentString = contentString;
    }
}
/**         ------------------ ProtoFile ---------------------    
 * @description ${classDescriptions.ProtoFile.description}
 */
class ProtoFile {
    constructor(file, services,methods, types, enums, protobuffFiles) {
        this.file = file;
        this.services = services;
        this.methods = methods;
        this.types = types;
        this.enums = enums;
        this.protobuffFiles = protobuffFiles
        this.relations= [];
    }
}
/**         ------------------ Client ---------------------    
 * @description ${classDescriptions.Client.description}
 */
class Client {
    constructor(parent, users) {
        this.parent = parent;
        this.users = users;
    }
}
/**         ------------------ Request ---------------------    
 * @description ${classDescriptions.Request.description}
 */

class Request {
    constructor(parent, users) {
        this.parent = parent;
        this.users = users;
    }
}
/**         ------------------ Callback ---------------------    
 * @description ${classDescriptions.Callback.description}
 */
class Callback {
    constructor(parent, users) {
        this.parent = parent;
        this.users = users;
    }
}
/**         ------------------ Stream ---------------------    
 * @description ${classDescriptions.Stream.description}
 */
class Stream {
    constructor(parent, users) {
        this.parent = parent;
        this.users = users;
    }
}
/**         ------------------ ProtobuffFile ---------------------    
 * @description ${classDescriptions.ProtobuffFile.description}
 */
class ProtobuffFile {
    constructor(out, protoFile, lang,services,methods,types,enums) {
        this.out = out;
        this.protoFile = protoFile;
        this.lang = lang
        this.services = services;
        this.methods=methods;
        this.types = types;
        this.enums = enums;
        this.relations= [];
    }
}
/**         ------------------ ProtobuffUser ---------------------    
 * @description ${classDescriptions.ProtobuffUser.description}
 */
// componentID->client->request&callback -> args
class ProtobuffUser {
    constructor(name, path, lang, protobuffFiles, components) {
        this.name = name; // The name of the file
        this.path = path; // The path to the file
        this.lang=lang
        this.protobuffFiles = protobuffFiles; // The imported Protobufs
        this.components = components; // The components defined within the file
    }
}
/**         ------------------ ProtobuffUserComponent ---------------------    
 * @description ${classDescriptions.ProtobuffUserComponent.description}
 */
//componentID->client->request&callback -> args
class ProtobuffUserComponent {
    constructor(protobuffFile, client, request,callback,id) {
       this.protobuffFile=protobuffFile
       this.client=client
       this.request=request
       this.callback=callback
       this.id=id
        }
}

/**         ------------------ ProtobuffUserComponentPreset ---------------------    
 * @description ${classDescriptions.ProtobuffUserComponentPreset.description}
 */
class ProtobuffUserComponent {
    constructor(type, parent, line, content) {
        this.type = type;
        this.parent = parent; // The parent of the component
        this.line = line; // The line number of the component
        this.content = content; // The content of the component
    }
}
/**         ------------------ Endpoint ---------------------    
 * @description ${classDescriptions.Endpoint.description}
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
    }
    startWatcher() {
        return new Promise((resolve, reject) => {
            console.log('Starting file watcher...');
            this.watcher = chokidar.watch(this.filePath, {
                ignored: /(^|[\/\\])\../, // Ignorieren Sie versteckte Dateien
                persistent: true
            });
            this.watcher
                .on('add', path => this.onFileChange(path))
                .on('change', path => this.onFileChange(path))
                .on('unlink', path => console.log(`File ${path} has been removed`));
            resolve({
                stop: () => {
                    console.log('Stopping file watcher...');
                    this.watcher.close();
                }
            });
        });
    }
}
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
/**         ------------------ WatcherManager ---------------------    
 * @description ${classDescriptions.WatcherManager.description}
 */
class WatcherManager {
    constructor() {
        // @ts-ignore
        if (WatcherManager.instance) {
            return WatcherManager.instance;
        }

        this.watchers = new Map();
        WatcherManager.instance = this;
    }
    /**
     * @description Returns the singleton instance of the WatcherManager class.
     */
    static getInstance() {
        if (!WatcherManager.instance) {
            new WatcherManager();
        }
        return WatcherManager.instance;
    }
    /**
     * @description Initializes the watchers based on a configuration file.
     * @param {string} configPath - The path to the configuration file that contains the watcher settings.
     */
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
    /**
     * @description Adds a watcher for a given file or component.
     * @param {Object} protofile - The Proto file or component to be watched.
     */
    async addWatcher(protofile) {
        const filewatcher = new Filewatcher(protofile);
        await filewatcher.startWatcher();
        this.watchers.set(protofile, filewatcher);
        console.log(`Watcher added for ${protofile}`);
    }
    /**
     * @description Stops all active watchers.
     */
    stopAllWatchers() {
        for (const watcher of this.watchers.values()) {
            watcher.close();
        }
        console.log('All watchers stopped.');
    }
}

/**         ------------------ Registry ---------------------    
 * @description ${componentRegistryDocs.description}
 * @param {Object} params - An object containing all the parameters for the ComponentRegistry constructor.
 * @param {Map} params.fields - ${componentRegistryDocs.params.fields}  * @param {Map} params.services - ${componentRegistryDocs.params.services}  * @param {Map} params.methods - ${componentRegistryDocs.params.methods}  * @param {Map} params.types - ${componentRegistryDocs.params.types} * @param {Map} params.content - ${componentRegistryDocs.params.content} * @param {Map} params.message - ${componentRegistryDocs.params.message} * @param {Map} params.Enum - ${componentRegistryDocs.params.Enum} * @param {Map} params.EnumValues - ${componentRegistryDocs.params.EnumValues} * @param {Map} params.ProtoFilePaths - ${componentRegistryDocs.params.ProtoFilePaths} * @param {Map} params.Client - ${componentRegistryDocs.params.Client} * @param {Map} params.Request - ${componentRegistryDocs.params.Request} * @param {Map} params.Callback - ${componentRegistryDocs.params.Callback} * @param {Map} params.Stream - ${componentRegistryDocs.params.Stream} * @param {Map} params.ProtobuffFilePaths - ${componentRegistryDocs.params.ProtobuffFilePaths} * @param {Map} params.ProtobuffFile - ${componentRegistryDocs.params.ProtobuffFile} * @param {Map} params.ProtobuffUserPaths - ${componentRegistryDocs.params.ProtobuffUserPaths} * @param {Map} params.ProtobuffUser - ${componentRegistryDocs.params.ProtobuffUser} * @param {Map} params.ProtobuffUserComponentPreset - ${componentRegistryDocs.params.ProtobuffUserComponentPreset} * @param {Map} params.ProtobuffUserComponent - ${componentRegistryDocs.params.ProtobuffUserComponent} * @param {Map} params.EndpointPaths - ${componentRegistryDocs.params.EndpointPaths} * @param {Map} params.Endpoint - ${componentRegistryDocs.params.Endpoint} * @param {Map} params.MainEndpoint - ${componentRegistryDocs.params.MainEndpoint} */
class ProtoRegistry {
    constructor() {
        this.fields = new Map();
        this.services = new Map();
        this.methods = new Map();
        this.types = new Map();
        this.Enum = new Map();
        this.EnumValues = new Map();
        this.ProtoFiles = new Map();
        this.ProtoFilePaths = new Map();
        this.ProtobuffFiles = new Map();
    }
}
class ProtoBuffRegistry {
    constructor() {
        this.fields = new Map();
        this.services = new Map();
        this.methods = new Map();
        this.ProtobuffFiles = new Map();
        this.ProtobuffFilePaths = new Map();
    }
}
//componentID->client->request&callback -> args
class ProtoUserRegistry {
    constructor() {
        this.Client = new Map();
        this.methods = new Map();
        this.Callback = new Map();
        this.Streams = new Map();
        this.components=new Map()
        this.ProtobuffFiles = new Map();
        this.protoUserFiles = new Map();
    }
}
/**         ------------------ Daemon ---------------------    
* @description ${classDescriptions.Daemon.description}
*/
class Daemon {
    constructor() {
        if (Daemon.instance) {
            return Daemon.instance;
        }
        this.running = false;
        Daemon.instance = this;
        this.componentRegistry = new ComponentRegistry()
    }
    start() {
        this.running = true;
    }
    stop() {
        this.running = false;
    }
    isRunning() {
        return this.running;
    }
}
/**         ------------------ Protobuffctl ---------------------    
 * @description ${classDescriptions.Protobuffctl.description}
 */
class Protobuffctl {
    constructor() {
        if (Protobuffctl.instance) {
            return Protobuffctl.instance;
        }
        this.MainEndpoint = "";
        this.relations=new Map();
        this.daemon = new Daemon();
        this.watcherManager = new WatcherManager(); // WatcherManager wird als Teil von Protobuffctl definiert
     //  this.componentRegistry = new ComponentRegistry()
        this.ProtoRegistry = new ProtoRegistry()
        this.ProtoBuffRegistry = new ProtoBuffRegistry()
        this.ProtoUserRegistry = new ProtoUserRegistry()
        this.RelationsRegistry = new Map()  // _UserFile_typeName  ist der name also zb App.js_messeage_helloWorld
        Protobuffctl.instance = this;
    }
    addRelation(protoType,userType,protoFile,protpBuff,protoUser){
    }
    removeRelation(protoType,userType,protoFile,protpBuff,protoUser){
    }
    editRelation(protoType,userType,protoFile,protpBuff,protoUser){
    }
    /**
     * @description ${classDescriptions.Protobuffctl.methods.startDaemon}
     */
    startDaemon() {
        this.daemon.start();
    }
    /**
     * @description ${classDescriptions.Protobuffctl.methods.stopDaemon}
     */
    stopDaemon() {
        this.daemon.stop();
    }
    /**
     * @description ${classDescriptions.Protobuffctl.methods.isDaemonRunning}
     */
    isDaemonRunning() {
        return this.daemon.isRunning();
    }
}

class BuffUtils{
    constructor() {
       this.componentPreset = new Map();
    }
   }
/// ---------------------------- exports ------------------------------------
module.exports = {
    Protobuffctl,
    content,
    ProtoFile,
    Client,
    Request,
    Callback,
    Stream,
    ProtobuffFile,
    ProtobuffUser,
    ProtobuffUserComponentPreset,
    ProtobuffUserComponent,
    Endpoint,
    MainEndpoint,
    languageFileExtensions
};

//_____________________________________________________________________________________

//                                    E   N   D
//_____________________________________________________________________________________

class ComponentRegistry {
    constructor() {
        this.fields = new Map();
        this.services = new Map();
        this.methods = new Map();
        this.types = new Map();
        this.content = new Map();
        this.message = new Map();
        this.Enum = new Map();
        this.EnumValues = new Map(); // Neues Feld für Enum-Werte
        this.ProtoFilePaths = new Map();
        this.Client = new Map();
        this.Request = new Map();
        this.Callback = new Map();
        this.Stream = new Map();
        this.ProtobuffFilePaths = new Map();
        this.ProtobuffFile = new Map();
        this.ProtobuffUserPaths = new Map();
        this.ProtobuffUser = new Map();
        this.ProtobuffUserComponentPreset = new Map();
        this.ProtobuffUserComponent = new Map();
        this.EndpointPaths = new Map();
        this.Endpoint = new Map();
        this.MainEndpoint = new Map();
    }
    
}