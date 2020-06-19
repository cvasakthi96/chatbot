const { InputHints, MessageFactory, CardFactory, ActionTypes } = require('botbuilder');
const { ConfirmPrompt, TextPrompt, WaterfallDialog, ChoicePrompt, ChoiceFactory, ComponentDialog } = require('botbuilder-dialogs');
const CHOICE_PROMPT = 'choicePrompt';
const SHOWCART_WATERFALL_DIALOG_ID = 'showCartWaterfallDialog';
const { shoppingCart } = require('../cards/cartViewCard');
class showCartDialog extends ComponentDialog {
    constructor(id, userstate) {
        super(id, userstate);
        this.userProfileAccessor = userstate;
        this.addDialog(new ChoicePrompt(CHOICE_PROMPT))
            .addDialog(new WaterfallDialog(SHOWCART_WATERFALL_DIALOG_ID, [
                this.checkCart.bind(this),
                this.cartdialogEnd.bind(this)
            ]));
        this.initialDialogId = SHOWCART_WATERFALL_DIALOG_ID;
        console.log(this.id);

    }

    async checkCart(stepContext) {
        const { userProfile } = await this.getUserProfile(stepContext);
        const cart = userProfile.user.cartItem || []

        if (cart.length !== 0) {
            return await stepContext.context.sendActivity({
                attachments: [CardFactory.adaptiveCard(shoppingCart(cart))]
            });
        } else {
            await stepContext.context.sendActivity(MessageFactory.text('Cart is Empty.'));
            return await stepContext.endDialog(stepContext);
        }

    }
    async cartdialogEnd(stepContext) {
        return await stepContext.endDialog(stepContext);

    }

    async getUserProfile(stepContext) {
        return await this.userProfileAccessor.get(stepContext.context, {});
    }
}

module.exports.showCartDialog = showCartDialog;