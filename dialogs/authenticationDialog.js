const { InputHints, MessageFactory, CardFactory, ActionTypes } = require('botbuilder');
const { ConfirmPrompt, AttachmentPrompt, TextPrompt, WaterfallDialog, ChoicePrompt, ChoiceFactory, ComponentDialog, } = require('botbuilder-dialogs');
const { login } = require('../services/user.services');

const TEXT_PROMPT = 'textPrompt';
const CHOICE_PROMPT = 'choicePrompt';
const ATTACHMENT_PROMPT = 'attachmentPrompt';
const AUTHENTICATION_WATERFALL_DIALOG_ID = 'authenticationDialogId';

class AuthenticationDialog extends ComponentDialog {
    constructor(id, userstate) {
        super(id, userstate);
        this.userProfileAccessor = userstate.createProperty('userProfile');
        this.userCrentialAccessor = userstate.createProperty('UserCrendtial');

        this.addDialog(new TextPrompt(TEXT_PROMPT))
            .addDialog(new ChoicePrompt(CHOICE_PROMPT))
            .addDialog(new AttachmentPrompt(ATTACHMENT_PROMPT))
            .addDialog(new WaterfallDialog(AUTHENTICATION_WATERFALL_DIALOG_ID, [
                this.introstep.bind(this),
                this.validateUser.bind(this),
                this.getUserName.bind(this),
                this.getPassword.bind(this),
                this.checkCrendential.bind(this)
            ]));
        this.initialDialogId = AUTHENTICATION_WATERFALL_DIALOG_ID;
    }

    async introstep(stepContext) {
        const user = stepContext.options;
        // const message = MessageFactory.attachment(CardFactory.adaptiveCard(singinCard()));
        //    return await stepContext.prompt(ATTACHMENT_PROMPT,{prompt:message})
        return stepContext.next();
    }

    async validateUser(stepContext) {
        return await stepContext.prompt(TEXT_PROMPT, { prompt: "Please Enter UserName" });
    }

    async getUserName(stepContext) {
        stepContext.values['username'] = stepContext.result;
        return await stepContext.prompt(TEXT_PROMPT, { prompt: "Please Enter password" });
    }

    async getPassword(stepContext) {
        stepContext.values['password'] = stepContext.result;

        return await stepContext.next();
    }

    async checkCrendential(stepContext) {
        const password = stepContext.values.password;
        const username = stepContext.values.username;
        // if (username === 'siva' && password === 'q') {
        //     stepContext.values['isAuthenticated'] = true;
        //     await stepContext.context.sendActivity('signed in successfully....')
        //     return await stepContext.endDialog(stepContext.values);
        // } else {
        //     stepContext.values['isAuthenticated'] = false;
        //     await stepContext.context.sendActivity(MessageFactory.text('Invalid crendtial.. Please try again....'));
        //     return await stepContext.beginDialog(AUTHENTICATION_WATERFALL_DIALOG_ID);
        // }


        const response = await login({ username, password }).then((result) => { return result.data });
        if (response && response.length !== 0) {
            stepContext.values['newUser'] = response[0];
            stepContext.values['isAuthenticated'] = true;
            await stepContext.context.sendActivity('signed in successfully....')
            return await stepContext.endDialog(stepContext.values);
        } else {
            stepContext.values['isAuthenticated'] = false;
            await stepContext.context.sendActivity(MessageFactory.text('Invalid crendtial.. Please try again....'));
            return await stepContext.beginDialog(AUTHENTICATION_WATERFALL_DIALOG_ID);
        }






    }

    createSignInCard() {
        return CardFactory.signinCard(
            'BotFramework Sign in Card',
            'https://login.microsoftonline.com',
            'Sign in'
        );
    }

    async getUserProfile(stepContext) {
        return await this.userProfileAccessor.get(stepContext.context, {});
    }
}

module.exports.AuthenticationDialog = AuthenticationDialog;