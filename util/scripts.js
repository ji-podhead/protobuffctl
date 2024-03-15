const fs = require('fs');
const path = require('path');

const go_protobuff_script=`
export PATH=$PATH:$(go env GOPATH)/bin
protoc --go_out=. --go_opt=paths=source_relative --go-grpc_out=. --go-grpc_opt=paths=source_relative protos/ui.proto
go mod init protos
go mod tidy
`
const js_protobuff_script = `
#!/bin/bash
PROTOC_GEN_TS_PATH="$(pwd)/frontend/node_modules/ts-protoc-gen/bin/protoc-gen-ts"
OUT_DIR="$(pwd)/frontend/src"
PROTO_PATH="$(pwd)/protos/"
protoc --plugin="protoc-gen-ts=$(pwd)/frontend/node_modules/ts-protoc-gen/bin/protoc-gen-ts" --ts_out="service=grpc-node,mode=grpc-js:$(pwd)/frontend/src" --js_out="import_style=commonjs,binary:$(pwd)/frontend/src" --proto_path="$(pwd)/protos/" ui.proto
protoc --plugin="protoc-gen-ts=$(pwd)/frontend/node_modules/ts-protoc-gen/bin/protoc-gen-ts" --ts_out="service=grpc-web:$(pwd)/frontend/src" --js_out="import_style=commonjs,binary:$(pwd)/frontend/src" --proto_path="$(pwd)/protos/" ui.proto
`;
const startAirScript = `
#!/bin/bash
source ~/.bashrc
# oder
source ~/.bash_profile
air
`;
const startProxyScript = `
#!/bin/bash
source ~/.bashrc
source ~/.bash_profile
GOPATH=~/go ; export GOPATH
cd $GOPATH/src/github.com/improbable-eng/grpc-web
grpc-web --backend_addr=localhost:50051 --run_tls_server=false --use_websockets --allow_all_origins
`;
const launchJsonContent = {
    "version": "0.2.0",
    "configurations": [
        {
            "name": "Launch Go Backend",
            "type": "go",
            "request": "launch",
            "mode": "auto",
            "program": "${workspaceFolder}",
            "preLaunchTask": "startAll",
            "console": "integratedTerminal",
            "internalConsoleOptions": "neverOpen"
        }
    ]
};
const tasksJsonContent = {
    "version": "2.0.0",
    "tasks": [
        {
          "label": "startBunServer",
          "type": "shell",
          "command": "cd frontend && bun run start --no-open",
 
          "problemMatcher": []
        },
        {
          "label": "startGoBackend",
          "type": "shell",
          "command": "sh .vscode/start_air.sh",
        },
        {
         "label": "startProxy",
         "type": "shell",
         "command": "sh .vscode/start_proxy.sh",
       },
        {
         "label": "startAll",
         "dependsOn": ["startBunServer", "startGoBackend", "startProxy"],
         "type": "shell",
         "command": "",
         "problemMatcher": []
       }
     ]
};
const airConfigContent = `
[build]
cmd = "echo 'Building...' && go build -o ./bin/myapp"
bin = "./bin/myapp"
tmp_dir = "tmp"
log = "log"
include_ext = ["js", "go", "py"]
`;

function createScripts(workspacePath) {
const launchJsonPath = path.join(workspacePath, '.vscode', 'launch.json');
const tasksJsonPath = path.join(workspacePath, '.vscode', 'tasks.json');
const airConfigPath = path.join(workspacePath, 'go', 'backend', '.air.conf');

fs.writeFileSync(launchJsonPath, JSON.stringify(launchJsonContent, null, 2));
fs.writeFileSync(tasksJsonPath, JSON.stringify(tasksJsonContent, null, 2));
fs.writeFileSync(airConfigPath, airConfigContent);

writeBashScript(path.join(workspacePath, '.vscode', 'start_air.sh'), startAirScript);
writeBashScript(path.join(workspacePath, '.vscode', 'start_proxy.sh'), startProxyScript);
writeBashScript(path.join(workspacePath, '.vscode', 'generate_go_protobuffs.sh'), go_protobuff_script);
writeBashScript(path.join(workspacePath, '.vscode', 'generate_js_protobuffs.sh'), js_protobuff_script);
}
function writeBashScript(scriptPath, scriptContent) {
fs.writeFileSync(scriptPath, scriptContent);
fs.chmodSync(scriptPath, 0o755); // Setze die Berechtigungen auf ausführbar
}


// Exportieren Sie die Konstanten
module.exports = {
    createScripts,
    go_protobuff_script,
    js_protobuff_script,
    startAirScript,
    startProxyScript,
    launchJsonContent,
    tasksJsonContent,
    airConfigContent
};