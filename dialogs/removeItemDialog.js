const { InputHints, MessageFactory, CardFactory, ActionTypes } = require('botbuilder');
const { ConfirmPrompt, TextPrompt, WaterfallDialog, ChoicePrompt, ChoiceFactory, ComponentDialog } = require('botbuilder-dialogs');
const CHOICE_PROMPT = 'choicePrompt';
const TEXT_PROMPT = 'TEXT_PROMPT';
const REMOVE_ITEM_DIALOG = 'removeItemDialog';
const { deleteFromCart } = require('../services/user.services');

class removeItemDialog extends ComponentDialog {
    constructor(id, userstate) {
        super(id, userstate);
        this.userProfileAccessor = userstate.createProperty('userProfile');
        this.addDialog(new ChoicePrompt(CHOICE_PROMPT))
            .addDialog(new TextPrompt(TEXT_PROMPT))
            .addDialog(new WaterfallDialog(REMOVE_ITEM_DIALOG, [
                this.checkItemsPresence.bind(this),
                this.finalStep.bind(this)
            ]));
        this.initialDialogId = REMOVE_ITEM_DIALOG;
    }

    async checkItemsPresence(stepContext) {
        const removeItem = stepContext.options.itemName || [];
        const userProfile = await this.getUserProfile(stepContext);
        if (removeItem && removeItem.length !== 0) {
            if (removeItem[0].toLowerCase() !== 'all') {
                const filteredValue = userProfile.user.cartItem.filter(item => item.name !== removeItem[0]);
                await this.removeItem(stepContext, filteredValue, removeItem);
                return await stepContext.endDialog();
            } else {
                userProfile.user.cartItem = [];
                const response = await deleteFromCart({ id: userProfile.user.id, data: userProfile.user }).then((response) => { return response });
                if (response.status === 200) {
                    await stepContext.context.sendActivity(`deleted all items from  cart.`);
                    return await stepContext.endDialog();
                } else {
                    await stepContext.context.sendActivity(`Failed to deleted all items from  cart.`);
                    return await stepContext.endDialog();
                }

            }
        }

        else {
            const messageText = `Enter Item Name to delete?`;
            const msg = MessageFactory.text(messageText, InputHints.AcceptingInput);
            return await stepContext.prompt(TEXT_PROMPT, { prompt: msg });
        }

    }
    async finalStep(stepContext) {
        const userProfile = await this.getUserProfile(stepContext);
        var messageText;
        if (stepContext.result) {
            if (userProfile.user.cartItem.length !== 0) {
                if (stepContext.result.toLowerCase() !== 'all') {
                    const filteredValue = userProfile.user.cartItem.filter(item => item.name !== stepContext.result);
                    userProfile.user.cartItem = filteredValue
                    messageText = ` Item ${stepContext.result} removed  from your cart.`;
                } else {
                    userProfile.user.cartItem = [];
                    const response = await deleteFromCart({ id: userProfile.user.id, data: userProfile.user }).then((response) => { return response });
                    if (response.status === 200) {
                        await stepContext.context.sendActivity(`deleted all items from  cart.`);
                        return await stepContext.endDialog();
                    } else {
                        await stepContext.context.sendActivity(`Failed to deleted all items from  cart.`);
                        return await stepContext.endDialog();
                    }
                }

            } else {
                messageText = `Cart is Empty`;
                await stepContext.context.sendActivity(messageText);
            }
            return await stepContext.endDialog(stepContext);
        }
        else {
            return await stepContext.endDialog(stepContext);
        }

    }
    async getUserProfile(stepContext) {
        return await this.userProfileAccessor.get(stepContext.context, {});
    }
    async removeItem(stepContext, filteredValue, removeItem) {
        const userProfile = await this.getUserProfile(stepContext);
        userProfile.user.cartItem = filteredValue
        const response = await deleteFromCart({ id: userProfile.user.id, data: userProfile.user }).then((response) => { return response });
        if (response.status === 200) {
            var messageText = ` ${removeItem.length > 0 ? 'items' : 'item'} ${removeItem.join(',')} added to your cart.`;
            await stepContext.context.sendActivity(messageText);

        } else {
            var messageText = ` Failed to Add  ${removeItem.length > 0 ? 'items' : 'item'} ${removeItem.join(',')}to your cart.`;
            await stepContext.context.sendActivity(messageText);
        }
        return true;
    }
}

module.exports.removeItemDialog = removeItemDialog;
