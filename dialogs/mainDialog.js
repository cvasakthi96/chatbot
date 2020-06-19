// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { InputHints, CardFactory, MessageFactory } = require('botbuilder');
const { LuisRecognizer } = require('botbuilder-ai');
const {
	ComponentDialog,
	ChoiceFactory,
	AttachmentPrompt,
	ChoicePrompt,
	ConfirmPrompt,
	DialogSet,
	DialogTurnStatus,
	TextPrompt,
	WaterfallDialog
} = require('botbuilder-dialogs');
// const { EmployeeDialog } = require('./employeeDialog');
const { AuthenticationDialog } = require('./authenticationDialog');
const { showCartDialog } = require('./showCartDialog');
const { addItemDialog } = require('./addItemDialog');
const { removeItemDialog } = require('./removeItemDialog');

const MAIN_WATERFALL_DIALOG = 'mainWaterfallDialog';
// // const EMPLOYEE_DIALOG = 'EMPLOYEE_DIALOG';
const SHOW_CART_DIALOG = 'SHOW_CART_DIALOG';
const ADD_ITEM_DIALOG = 'ADD_ITEM_DIALOG';
const REMOVE_ITEM_DIALOG = 'REMOVE_ITEM_DIALOG';
const AUTH_DIALOG = 'AUTH_DIALOG';
const CHOICE_PROMPT = 'choicePrompt';
const TEXT_PROMPT = 'TEXT_PROMPT';
const { UserProfile } = require('../resource/userProfile');
const ATTACHMENT_PROMPT = 'attachmentPrompt';
const { singinCard } = require('../cards/singinCard');
class MainDialog extends ComponentDialog {
	constructor(conversationState, userState, luisRecognizer) {
		super('MainDialog');
		if (!luisRecognizer) throw new Error("[MainDialog]: Missing parameter 'luisRecognizer' is required");
		this.luisRecognizer = luisRecognizer;
		this.dc = undefined;
		this.userProfileAccessor = userState.createProperty('userProfile');
		// Define the main dialog and its related components.
		this.addDialog(new TextPrompt('TEXT_PROMPT'))
			.addDialog(new ConfirmPrompt('confirm_promt'))
			.addDialog(new ChoicePrompt(CHOICE_PROMPT))
			// .addDialog(new EmployeeDialog(EMPLOYEE_DIALOG, userState))
			.addDialog(new showCartDialog(SHOW_CART_DIALOG, userState))
			.addDialog(new addItemDialog(ADD_ITEM_DIALOG, userState))
			.addDialog(new removeItemDialog(REMOVE_ITEM_DIALOG, userState))
			.addDialog(new AuthenticationDialog(AUTH_DIALOG, userState))
			.addDialog(new AttachmentPrompt(ATTACHMENT_PROMPT))
			.addDialog(
				new WaterfallDialog(MAIN_WATERFALL_DIALOG, [
					this.introStep.bind(this),
					this.loginStep.bind(this),
					this.actStep.bind(this),
					this.finalStep.bind(this),
					this.endStep.bind(this)
				])
			);

		this.initialDialogId = MAIN_WATERFALL_DIALOG;
	}

	/**
     * The run method handles the incoming activity (in the form of a TurnContext) and passes it through the dialog system.
     * If no dialog is active, it will start the default dialog.
     * @param {*} turnContext
     * @param {*} accessor
     */
	async run(turnContext, accessor) {
		const dialogSet = new DialogSet(accessor);
		dialogSet.add(this);

		const dialogContext = await dialogSet.createContext(turnContext);
		// console.log('loginStepcontext', dialogContext.context.activity.value);
		this.dc = dialogContext;
		const results = await dialogContext.continueDialog();
		if (results.status === DialogTurnStatus.empty) {
			await dialogContext.beginDialog(this.id);
		}
	}

	/**
     * First step in the waterfall dialog. Prompts the user for a command
     */
	async introStep(stepContext) {
		if (!this.luisRecognizer.isConfigured) {
			const messageText =
				'NOTE: LUIS is not configured. To enable all capabilities, add `LuisAppId`, `LuisAPIKey` and `LuisAPIHostName` to the .env file.';
			await stepContext.context.sendActivity(messageText, null, InputHints.IgnoringInput);
			return await stepContext.next();
		}
		const userProfile = await this.getUserProfile(stepContext);
		if (userProfile.isAuthenticated === true) {
			return await stepContext.next();
		} else {
			if (this.dc.context.activity.value) {
				if (userProfile.isAuthenticated === true) {
					return await stepContext.next();
				} else {
					return await stepContext.next(stepContext.context.activity['value']);
				}
			} else {
				return await stepContext.context.sendActivity({
					attachments: [ CardFactory.adaptiveCard(singinCard()) ]
				});
			}
		}
	}

	async loginStep(stepContext) {
		const userProfile = await this.getUserProfile(stepContext);

		if (userProfile.isAuthenticated === true) {
			return await stepContext.next();
		} else {
			if (stepContext.result.signInClicked === true) {
				return await stepContext.beginDialog(AUTH_DIALOG, userProfile);
			} else {
				return await stepContext.endDialog();
			}
		}
	}

	async actStep(stepContext) {
		const userProfile = await this.getUserProfile(stepContext);
		var isAuthenticated;
		if (stepContext.result) {
			const result = stepContext.result;
			userProfile.isAuthenticated = result.isAuthenticated;
			isAuthenticated = result.isAuthenticated;
			userProfile.user = result.newUser;
			isAuthenticated = userProfile.isAuthenticated;
		} else {
			isAuthenticated = userProfile.isAuthenticated;
		}
		if (isAuthenticated) {
			if (stepContext.options.help) {
				return await stepContext.prompt(CHOICE_PROMPT, {
					prompt: `Hi there...I\'m here to help you ${userProfile.user.username}. Please select any option.`,
					choices: ChoiceFactory.toChoices([ 'Show cart', 'Track Shipment', 'Add', 'Remove' ])
				});
			} else {
				const messageText = "Hi there...I'm here to help you ! Ask me to see cart , add item ..etc";
				return await stepContext.prompt(TEXT_PROMPT, {
					prompt: stepContext.options.restartMsg ? stepContext.options.restartMsg : messageText
				});
			}
		} else {
			userProfile.isAuthenticated = result.isAuthenticated;
			return await stepContext.endDialog();
		}
	}

	async finalStep(stepContext) {
		const userProfile = await this.getUserProfile(stepContext);
		var entities = {};
		const luisResult = await this.luisRecognizer.executeLuisQuery(stepContext.context);
		const choices = LuisRecognizer.topIntent(luisResult);
		switch (choices) {
			case 'Show_cart':
				entities = this.luisRecognizer.getFromEntities(luisResult);
				return await stepContext.beginDialog(SHOW_CART_DIALOG);

			case 'Track_Shipment':
				await stepContext.context.sendActivity('Track Shipment empty');
				return await stepContext.next();

			case 'Add':
				entities = this.luisRecognizer.getFromEntities(luisResult);
				return await stepContext.beginDialog(ADD_ITEM_DIALOG, entities);

			case 'Remove':
				entities = this.luisRecognizer.getFromEntities(luisResult);
				return await stepContext.beginDialog(REMOVE_ITEM_DIALOG, entities);

			case 'greet': {
				const welcomeMessageText = 'welcome... ';
				await stepContext.context.sendActivity(welcomeMessageText);
				return await stepContext.next();
			}
			case 'Help': {
				return await stepContext.replaceDialog(this.initialDialogId, { help: true });
			}
			case 'None': {
				const endText = 'bye... ';
				await stepContext.context.sendActivity(endText);
				await this.userProfileAccessor.set(stepContext.context, {});
				return await stepContext.next();
			}
			default:
				await stepContext.context.sendActivity(
					" Sorry, I didn't get that. Please try asking in a different way "
				);
				return await stepContext.replaceDialog(this.initialDialogId, { help: true });
		}
	}

	async endStep(stepContext) {
		return await stepContext.replaceDialog(this.initialDialogId, { restartMsg: 'What else can I do for you?' });
	}

	async getUserProfile(stepContext) {
		return await this.userProfileAccessor.get(stepContext.context, {});
	}
}

module.exports.MainDialog = MainDialog;
