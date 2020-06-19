// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

// const { TimexProperty } = require('@microsoft/recognizers-text-data-types-timex-expression');
const { InputHints, MessageFactory, CardFactory } = require('botbuilder');
const { ConfirmPrompt, TextPrompt, WaterfallDialog ,NumberPrompt } = require('botbuilder-dialogs');
const { ComponentDialog } = require('botbuilder-dialogs');

const { findUserDetail } = require('../services/user.services');
const {EmpCard} = require('../cards/employeeViewCard');
const CONFIRM_PROMPT = 'confirmPrompt';
const TEXT_PROMPT = 'textPrompt';
const NUMBER_PROMPT = 'noPrompt';
const WATERFALL_DIALOG = 'waterfallDialog';
class EmployeeDialog extends ComponentDialog {
    constructor(id, userstate) {
        super(id, userstate);
        this.userProfileAccessor = userstate.createProperty('EMPLOYEE_PROFILE');
        this.addDialog(new TextPrompt(TEXT_PROMPT))
        this.addDialog(new NumberPrompt(NUMBER_PROMPT, this.validateEmpId))
            .addDialog(new ConfirmPrompt(CONFIRM_PROMPT))
            .addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
                this.getEmployeeID.bind(this),
                this.getParamDetail.bind(this),
                this.confirmStep.bind(this),
                this.finalStep.bind(this)
            ]));
        this.initialDialogId = WATERFALL_DIALOG;
    }

    async getEmployeeID(stepContext) {
        const employeeDetail = stepContext.options;
        console.log(employeeDetail);

        if (!employeeDetail.empId) {
            const messageText = 'Please Enter Employee ID';
            const msg = MessageFactory.text(messageText, messageText, InputHints.ExpectingInput);
            return await stepContext.prompt(NUMBER_PROMPT, { prompt: msg });
        }
        return await stepContext.next();
    }

    async getParamDetail(stepContext) {
        const employeeDetail = stepContext.options;
        const employeeProfile = await this.userProfileAccessor.get(stepContext.context, {});
        // Capture the response to the previous step's prompt
        employeeProfile.empId = employeeDetail.empId || stepContext.result;
        console.log('employeeProfile', employeeProfile);
        if (stepContext.result) {
            employeeDetail.empId = stepContext.result;
        }
        if (!employeeDetail.param) {
            const messageText = `Enter what require from this ID ${ employeeDetail.empId }?`;
            const msg = MessageFactory.text(messageText, InputHints.AcceptingInput);
            return await stepContext.prompt(TEXT_PROMPT, { prompt: msg });
        }
        return await stepContext.next();
    }

    async confirmStep(stepContext) {
        const employeeDetail = stepContext.options;

        // Capture the results of the previous step
        if (stepContext.result && stepContext.result === 'detail') {
            employeeDetail.param = stepContext.result;
        }
        if (employeeDetail.param === 'detail') {
            const response = await findUserDetail(employeeDetail).then((result) => { return result.data});
            if (response && response.length !== 0) {
                const dataBind = {
                    title: response[0].username,
                    facts: {
                        email: response[0].email,
                        phone: response[0].phone,
                        name: response[0].name,
                        doj: response[0].doj,
                        website: response[0].website || 'NA'
                    }
                }
                return await stepContext.context.sendActivity({
                    attachments: [CardFactory.adaptiveCard(EmpCard(dataBind))]
                });
            } else {
               return await stepContext.context.sendActivity(MessageFactory.text(' Employee Details not found... !'));
            }
        } else {
            await this.userProfileAccessor.set(stepContext.context, {});
            return await stepContext.context.sendActivity(MessageFactory.text('Please try again....'));
        }
    }

    /**
     * Complete the interaction and end the dialog.
     */
    async finalStep(stepContext) {
        const employeeDetail = stepContext.options;
        return await stepContext.endDialog(employeeDetail);
    }


    async validateEmpId(prompt) {
        if (prompt.recognized.succeeded) {
                    return true;
        }
        await prompt.context.sendActivity(MessageFactory.text('Please enter valid ID..'));
        return false;
    }
}

module.exports.EmployeeDialog = EmployeeDialog;
