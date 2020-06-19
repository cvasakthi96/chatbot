// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { LuisRecognizer } = require('botbuilder-ai');

class EmployeeRecognizer {
    constructor(config) {
        const luisIsConfigured = config && config.applicationId && config.endpointKey && config.endpoint;
        if (luisIsConfigured) {
            // Set the recognizer options depending on which endpoint version you want to use e.g v2 or v3.
            // More details can be found in https://docs.microsoft.com/en-gb/azure/cognitive-services/luis/luis-migration-api-v3
            const recognizerOptions = {
                apiVersion: 'v3'
            };

            this.recognizer = new LuisRecognizer(config, recognizerOptions);
        }
    }

    get isConfigured() {
        return (this.recognizer !== undefined);
    }

    /**
     * Returns an object with preformatted LUIS results for the bot's dialogs to consume.
     * @param {TurnContext} context
     */
    async executeLuisQuery(context) {
        return await this.recognizer.recognize(context);
    }

    getFromEntities(result) {
        console.log(result);
        let empId, param, details;
        if (result.entities.$instance) {
            empId = result.entities.$instance.empId ? result.entities.$instance.empId[0].text : undefined;
            param = result.entities.$instance.detail ? result.entities.$instance.detail[0].text : undefined;
            details = result.entities.$instance.details ? result.entities.$instance.details.map(({ text }) => text) : undefined;
        }
        return { empId, param, details };
    }
    // Add another method
}

module.exports.EmployeeRecognizer = EmployeeRecognizer;
