
 | [About](https://ji-podhead.github.io/protobuffctl/) | [API](https://ji-podhead.github.io/protobuffctl/API) | [CLI Guide](https://ji-podhead.github.io/protobuffctl/guides) | [Architecture](https://ji-podhead.github.io/protobuffctl/architecture) | [Git-Repo](https://github.com/ji-podhead/protobuffctl) |
 

#  about  <img width ="100" align="right" object-fit="contain" src="https://github.com/ji-podhead/protobuffctl/blob/main/docs/protobuffctl.png?raw=true"/> 

[![npm version](https://img.shields.io/badge/🚧_under_construction_🚧-black)](https://www.npmjs.com/package/protobuffctl)
[![npm version](https://img.shields.io/badge/protoc_v26.0-binary-blue)](https://www.npmjs.com/package/protobuffctl)
[![npm version](https://badge.fury.io/js/protobuffctl.svg)](https://badge.fury.io/js/protobuffctl)

## Automate Your Protobuf Workflow
Protobuffctl is a comprehensive JavaScript API designed to streamline Protobuf development, offering features for creation, management, and automatic Protobuf generation, along with API server integration and a built-in dashboard for monitoring, testing and debugging.

## Key Features
- [Protobuffctl](https://github.com/ji-podhead/protobuffctl) offers an [API](https://ji-podhead.github.io/protobuffctl/) that enables you to automate all Protobuf functions.
- Manage `message types`, `fields`, `services`, `methods`, and `enums` by using **CLI commands** or the **API server**.
- **Automatically generates** the corresponding **Protobuf files** when making changes to the protofiles.
- Stores all components in the **local Componentregistry**.
- Sync with **other registries** like Gitey or PostgreSQL.
- **Rollback** by using a local safe-file or by using an external database, similar to **version control**.
- **Preview** the Protofile code before actually building it and export any component to **JSON**.
- Comes with a **Dashboard** for demo, debugging, and **testing**.
- **Monitoring** for individual `message types` and `services` using the dashboard and [D3.js](https://d3js.org/).
- The middleware ensures **ACID** compliance and **prevents race conditions**

---
##                      Getting Started
**Install:**
 
```JavaScript
npm i protobuffctl
```
**Docs:**  [see docs](https://ji-podhead.github.io/protobuffctl/) <br>
**CLI Guide:** [see docs/cli-guide](https://github.com/ji-podhead/protobuffctl/blob/main/docs/CLI-guide.md) 
 
---
###                      Update
- serialize **Protobuff Registry** for local storage ✅
- Exports to JSON ✅
- **automated Proto-gen**: using my [protoc-helper repo](https://github.com/ji-podhead/protoc-helper) ✅
- creadted a  **CLI** using commander ✅
- changed codeBase and **removed redundant recoursion**  using hashlookuptables and relations ✅
- Fast Saving and Loading using **Service Worker as  Middleware** that keeps the process alive ✅
- added the **Api Server** ✅
- added a bun react **Dashboard** ✅
  
##                      Comming up
- Set up **File Watcher** to monitor your proto files for any changes. 🚧 
- create **VC CODE EXTENSION** to manage the api in vs code  🚧  
- sync with **external DB** 🚧 
- finish  **Dashboard**  and use a web compiler for demo 🚧
- implement UUID hashing logic 
- add **tests** to Dashboard and a gRPC debug-Server 🚧 

## Contribution?

 👋 If you're thinking about giving Protobuffctl a little love, you're in the right place. Here's how you can get involved:

### Fork
- **Fork the Repo**: Just head over to GitHub and click the "Fork" button.
- **Clone Your Fork**: Once you've forked the repo, clone it to your computer.
- **Create a New Branch**: Make a new branch for your cool new feature or bug fix. Something descriptive would be awesome!
- **Make Your Changes**: Get coding! 🚀
- **Commit Your Changes**: When you're happy with your changes, commit them with a message that tells us what you did
- **Push Your Changes**: Push your changes back to your fork on GitHub.
- **Open a Pull Request**: If you're ready to share your work with the world, go back to the original Protobuffctl repo and open a pull request from your fork.

### Here are a few other options:

- **reach out via Discord**: DM me via Discord #podhead181818.
- **Start a Discussion**: If you've got something to say, but maybe not something you're ready to code yet, you can start a discussion under the "Discussions" tab with the "Contribution" label.
- **Open an Issue**: If you've found a bug or have a feature request, you can open an issue on GitHub.

Thanks for thinking about contributing! 🙏 Whether you're coding, chatting, or just sharing ideas, every contribution helps make Protobuffctl better.


