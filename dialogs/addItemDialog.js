const { InputHints, MessageFactory, CardFactory, ActionTypes } = require('botbuilder');
const { ConfirmPrompt, TextPrompt, WaterfallDialog, ChoicePrompt, ChoiceFactory, ComponentDialog } = require('botbuilder-dialogs');
const CHOICE_PROMPT = 'choicePrompt';
const TEXT_PROMPT = 'TEXT_PROMPT';
const ADD_ITEM_WATERFALL_DIALOG_ID = 'addItemDialog';
const { v4: uuidv4 } = require('uuid');
const { addToCart } = require('../services/user.services');

class addItemDialog extends ComponentDialog {
    constructor(id, userstate) {
        super(id, userstate);
        this.userProfileAccessor = userstate.createProperty('userProfile');
        this.addDialog(new ChoicePrompt(CHOICE_PROMPT))
            .addDialog(new TextPrompt(TEXT_PROMPT))
            .addDialog(new WaterfallDialog(ADD_ITEM_WATERFALL_DIALOG_ID, [
                this.checkItems.bind(this),
                this.finalStep.bind(this)
            ]));
        this.initialDialogId = ADD_ITEM_WATERFALL_DIALOG_ID;
    }

    async checkItems(stepContext) {
        const newItems = stepContext.options.itemName || [];
        const tempItems = []
        if (newItems && newItems.length !== 0) {
            newItems.forEach((element, index) => {
                tempItems.push({
                    id: uuidv4(),
                    name: element,
                    quantity: Math.floor(1 + Math.random() * (10 + 1 - 1)),
                    cost: Math.floor(10 + Math.random() * (200 + 1 - 10))
                })
            });
            await this.addItem(stepContext, tempItems, newItems);
            return await stepContext.endDialog();

        }
        else {
            const messageText = `Enter Item to add to cart.`;
            const msg = MessageFactory.text(messageText, InputHints.AcceptingInput);
            return await stepContext.prompt(TEXT_PROMPT, { prompt: msg });
        }




    }
    async finalStep(stepContext) {
        const userProfile = await this.getUserProfile(stepContext);
        if (stepContext.result !== undefined) {
            const item = {
                id: uuidv4(),
                name: stepContext.result,
                quantity: 'NA',
                cost: 'NA'
            }
            await this.addItem(stepContext, [item], [stepContext.result]);
            return await stepContext.endDialog();
        }
        else {
            return await stepContext.endDialog(stepContext);
        }
    }
    async getUserProfile(stepContext) {
        return await this.userProfileAccessor.get(stepContext.context, {});
    }

    async addItem(stepContext, formatedItems, newItems) {
        const userProfile = await this.getUserProfile(stepContext);
        Array.prototype.push.apply(userProfile.user.cartItem, formatedItems);
        const response = await addToCart({ id: userProfile.user.id, data: userProfile.user }).then((response) => { return response });
        if (response.status === 200) {
            var messageText = `  ${newItems.length > 0 ? 'items' : 'item'}  ${newItems.join()} added to your cart.`;
            await stepContext.context.sendActivity(messageText);

        } else {
            var messageText = ` Failed to Add  ${newItems.length > 0 ? 'items' : 'item'}  ${newItems.join(',')}to your cart.`;
            await stepContext.context.sendActivity(messageText);
        }
        return true;
    }

}

module.exports.addItemDialog = addItemDialog;
