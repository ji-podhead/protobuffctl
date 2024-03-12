const { content, ProtoFile, Client, Request, Callback, Stream, ProtobuffFile,  ProtobuffUser, ProtobuffUserComponentPreset, ProtobuffUserComponent, Endpoint, WatcherManager, MainEndpoint, Filewatcher, componentMap } = require('./classes.js');

class ProtoFileExtractor {
    constructor(componentMap) {
        this.componentMap = componentMap;
    }

    extractProtoFileElements() {
        const jsonObject = {
            types: [],
            services: [],
            enums: [],
            fields: [],
            methods: [],
            EnumValues: []
        };

        this.componentMap.get("types").forEach((fields, typeName) => {
            jsonObject.types.push({
                name: typeName,
                fields: fields
            });
        });

        this.componentMap.get("services").forEach((methods, serviceName) => {
            jsonObject.services.push({
                name: serviceName,
                methods: methods
            });
        });

        this.componentMap.get("enums").forEach((values, enumName) => {
            jsonObject.enums.push({
                name: enumName,
                values: values
            });
        });

        this.componentMap.get("fields").forEach((field, fieldId) => {
            jsonObject.fields.push({
                id: fieldId,
                field: field
            });
        });

        this.componentMap.get("methods").forEach((method, methodId) => {
            jsonObject.methods.push({
                id: methodId,
                method: method
            });
        });

        this.componentMap.get("EnumValues").forEach((value, valueId) => {
            jsonObject.EnumValues.push({
                id: valueId,
                value: value
            });
        });

        return jsonObject;
    }
}

module.exports={ProtoFileExtractor}