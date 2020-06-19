// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

// const findUserDetail = require('../services/user.services');
const { ActivityHandler, MessageFactory } = require('botbuilder');
class EmpBot extends ActivityHandler {
    constructor(conversationState, userState, dialog) {
        super();
        this.conversationState = conversationState;
        this.userState = userState;
        this.dialog = dialog;
        this.dialogState = this.conversationState.createProperty('DialogState');

        this.onMessage(async (context, next) => {
            console.log('Running dialog with Message Activity.');
            // console.log('context', context.activity.value);

            // Run the Dialog with the new message Activity.
            await this.dialog.run(context, this.dialogState);
            await next();
        });

        this.onMembersAdded(async (turnContext, next) => {
            const membersAdded = turnContext.activity.membersAdded;
            const welcomeText = ["Hi i'm Groot", "hi i'm shopping assistant"];
            for (let cnt = 0; cnt < membersAdded.length; ++cnt) {
                if (membersAdded[cnt].id !== turnContext.activity.recipient.id) {
                    await turnContext.sendActivity(MessageFactory.text(welcomeText[[Math.floor(Math.random() * welcomeText.length)]]));
                    await this.dialog.run(turnContext, this.dialogState);
                }
            }
            // By calling next() you ensure that the next BotHandler is run
            await next();
        });
    }

    async run(context) {
        await super.run(context);

        // Save any state changes. The load happened during the execution of the Dialog.
        await this.conversationState.saveChanges(context, false);
        await this.userState.saveChanges(context, false);
    }
}

module.exports.EmpBot = EmpBot;
