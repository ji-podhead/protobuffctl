module.exports = {
    Protobuffctl: {
        description: 'The main class that manages the Daemon and the WatcherManager.',
        methods: {
            startDaemon: 'Starts the Daemon.',
            stopDaemon: 'Stops the Daemon.',
            isDaemonRunning: 'Checks if the Daemon is running.'
        }
    },
    Daemon: {
        description: 'Represents a daemon process.',
        methods: {
            start: 'Starts the daemon process.',
            stop: 'Stops the daemon process.',
            isRunning: 'Checks if the daemon process is running.'
        }
    },
    WatcherManager: {
        description: 'Manages file watchers for Proto files and Protobuff files.',
        methods: {
            initialize: 'Initializes the watchers based on a configuration file.',
            addWatcher: 'Adds a watcher for a given file or component.',
            stopAllWatchers: 'Stops all active watchers.',
            startAllWatchers: 'Starts all watchers.'
        }
    },
    content: {
        description: 'Represents the content of a part of a Proto or Protobuff file.',
        methods: {
            constructor: {
                description: 'Creates a new content instance.',
                params: {
                    type: 'The type of content (e.g., \'message\', \'enum\').',
                    contentString: 'The actual content string.'
                }
            }
        }
    },
    ProtoFile: {
        description: 'Represents a Proto file.',
        methods: {
            constructor: {
                description: 'Creates a new ProtoFile instance.',
                params: {
                    file: 'The path to the .proto file.',
                    services: 'The services defined in the file.',
                    types: 'The messages defined in the file.',
                    enums: 'The enums defined in the file.',
                    protobuffFiles: 'The endpoints defined in the file.'
                }
            }
        }
    },
    Client: {
        description: 'Represents a client that interacts with the Protobuff file.',
        methods: {
            constructor: {
                description: 'Creates a new Client instance.',
                params: {
                    parent: 'The parent of the client.',
                    users: 'The users associated with the client.'
                }
            }
        }
    },
    Request: {
        description: 'Represents a request made by a client to the Protobuff file.',
        methods: {
            constructor: {
                description: 'Creates a new Request instance.',
                params: {
                    parent: 'The parent of the request.',
                    users: 'The users associated with the request.'
                }
            }
        }
    },
    Callback: {
        description: 'Represents a callback function that is triggered by a Protobuff file.',
        methods: {
            constructor: {
                description: 'Creates a new Callback instance.',
                params: {
                    parent: 'The parent of the callback.',
                    users: 'The users associated with the callback.'
                }
            }
        }
    },
    Stream: {
        description: 'Represents a stream of data from a Protobuff file.',
        methods: {
            constructor: {
                description: 'Creates a new Stream instance.',
                params: {
                    parent: 'The parent of the stream.',
                    users: 'The users associated with the stream.'
                }
            }
        }
    },
    ProtobuffFile: {
        description: 'Represents a Protobuff file.',
        methods: {
            constructor: {
                description: 'Creates a new ProtobuffFile instance.',
                params: {
                    path: 'The path to the .proto file.',
                    lang: 'The language of the file.',
                    streams: 'The streams defined in the file.',
                    callbacks: 'The callbacks defined in the file.',
                    requests: 'The requests defined in the file.',
                    clients: 'The clients defined in the file.',
                    protobuffUsers: 'The users associated with the Protobuff file.'
                }
            }
        }
    },
    ProtobuffUser: {
        description: 'Represents a file that uses and imports Protobufs.',
        methods: {
            constructor: {
                description: 'Creates a new ProtobuffUser instance.',
                params: {
                    name: 'The name of the file.',
                    path: 'The path to the file.',
                    protobuffImports: 'The imported Protobufs.',
                    components: 'The components defined within the file.'
                }
            }
        }
    },
    ProtobuffUserComponentPreset: {
        description: 'Represents a preset for a Protobuff user component.',
        methods: {
            constructor: {
                description: 'Creates a new ProtobuffUserComponentPreset instance.',
                params: {
                    type: 'The type of the component.',
                    lang: 'The language of the component.',
                    preset: 'The preset for the component.'
                }
            }
        }
    },
    ProtobuffUserComponent: {
        description: 'Represents a component within a Protobuff user file.',
        methods: {
            constructor: {
                description: 'Creates a new ProtobuffUserComponent instance.',
                params: {
                    type: 'The type of the component.',
                    parent: 'The parent of the component.',
                    line: 'The line number of the component.',
                    content: 'The content of the component.'
                }
            }
        }
    },
    Endpoint: {
        description: 'Represents an endpoint.',
        methods: {
            constructor: {
                description: 'Creates a new Endpoint instance.',
                params: {
                    protoFiles: 'The Proto files associated with the endpoint.',
                    protobuffFiles: 'The Protobuff files associated with the endpoint.',
                    name: 'The name of the endpoint.',
                    index: 'The index of the endpoint.',
                    path: 'The path to the endpoint.'
                }
            }
        }
    },
    MainEndpoint: {
        description: 'Represents a main endpoint, which is a specialized type of endpoint.',
        methods: {
            constructor: {
                description: 'Creates a new MainEndpoint instance.',
                params: {
                    protoFiles: 'The Proto files associated with the endpoint.',
                    protobuffFiles: 'The Protobuff files associated with the endpoint.',
                    name: 'The name of the endpoint.',
                    index: 'The index of the endpoint.',
                    path: 'The path to the endpoint.',
                    buildTarget: 'Additional property for the build target.'
                }
            }
        }
    },
    "ComponentRegistry": {
        "description": "An interface for Protobufs that is cross-platform and processes Protobuf files. Manages various components and information related to Protobufs and Protobuffs.",
        "methods": {
            "constructor": {
                "description": "Initializes the instance of the ComponentRegistry class and creates various maps for managing components and information.",
                "params": {
                    "fields": "A map that contains the fields of the Protobuf files.",
                    "services": "A map that contains the services of the Protobuf files.",
                    "methods": "A map that contains the methods of the Protobuf files.",
                    "types": "A map that contains the types of the Protobuf files.",
                    "content": "A map that contains the content of the Protobuf files.",
                    "message": "A map that contains the messages of the Protobuf files.",
                    "Enum": "A map that contains the enums of the Protobuf files.",
                    "EnumValues": "A map that contains the values of the enums of the Protobuf files.",
                    "ProtoFilePaths": "A map that contains the paths to the Proto files.",
                    "Client": "A map that contains the clients of the Protobuf files.",
                    "Request": "A map that contains the requests of the Protobuf files.",
                    "Callback": "A map that contains the callbacks of the Protobuf files.",
                    "Stream": "A map that contains the streams of the Protobuf files.",
                    "ProtobuffFilePaths": "A map that contains the paths to the Protobuff files.",
                    "ProtobuffFile": "A map that contains the Protobuff files.",
                    "ProtobuffUserPaths": "A map that contains the paths to the Protobuff users.",
                    "ProtobuffUser": "A map that contains the Protobuff users.",
                    "ProtobuffUserComponentPreset": "A map that contains the prefixes for Protobuff user components.",
                    "ProtobuffUserComponent": "A map that contains the Protobuff user components.",
                    "EndpointPaths": "A map that contains the paths to the endpoints.",
                    "Endpoint": "A map that contains the endpoints.",
                    "MainEndpoint": "A map that contains the main endpoints."
                }
            }
        }
    },
    "Filewatcher": {
        "description": "Watches changes to a specific Proto file and reacts to these changes.",
        "methods": {
            "constructor": {
                "description": "Initializes the instance of the Filewatcher class with a Proto file and creates a watcher for the specific file.",
                "params": {
                    "protoFile": "The Proto file object to be watched."
                }
            },
            "onFileChange": {
                "description": "Called when a change to the watched file is detected.",
                "params": {
                    "path": "The path to the file that has been changed."
                }
            },
            "startWatcher": {
                "description": "Starts the file watcher and adds event handlers to react to file changes."
            }
        }
    },
    "WatcherManager": {
        "description": "Manages file watchers for Proto files and Protobuff files. It is responsible for initializing and controlling the watchers based on a configuration file.",
        "methods": {
            "constructor": {
                "description": "Initializes the instance of the WatcherManager class and sets up the watchers map."
            },
            "getInstance": {
                "description": "Returns the singleton instance of the WatcherManager class."
            },
            "initialize": {
                "description": "Initializes the watchers based on a configuration file.",
                "params": {
                    "configPath": "The path to the configuration file that contains the watcher settings."
                }
            },
            "addWatcher": {
                "description": "Adds a watcher for a given file or component.",
                "params": {
                    "protofile": "The Proto file or component to be watched."
                }
            },
            "stopAllWatchers": {
                "description": "Stops all active watchers."
            },
            "startAllWatchers": {
                "description": "Starts all watchers."
            }
        }
    }
}