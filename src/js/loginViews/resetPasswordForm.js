import { BaseForm } from "./baseForm.js"
import { API } from "../api.js"
import { ComponentMethods } from "../components/componentMethods.js";
import { delegateMatch, delegateMatchId, delegateMatchChild, selector } from "../helper.js";

export class ResetPasswordForm extends BaseForm {
    _token;

    constructor() {
        super()
    }

    _handleEvents(ev) {
        if (this.activeFormErrors) this._clearErrorSignal()
        if (ev.type === "submit") this._handleSubmit(ev)
    }

    _handleSubmit(ev) {
        if (delegateMatchChild(ev, "reset-reset")) this._handleResetSubmit(ev)
        if (delegateMatchChild(ev, "reset-confirm")) this._handleResetConfirmSubmit(ev)
    }

    _handleResetSubmit(ev) {
        const cls = this;
        let payload = this.destructureFormData(this.createPayload(ev).body)
        if (!payload) return;
        //entrypoint to api
        const queryObj = {
            endpoint: API.APIEnum.USER.RESET_PWD,
            sec: null,
            actionType: "resetPwd",
            queryData: payload,
            callBack: this._switchResetFormType.bind(cls),
            spinner: true,
            alert: true,
            type: "POST"
        }
        API.queryAPI(queryObj)
    }

    _switchResetFormType(returnData, success = false) {
        if (success) {
            const resetForm = selector(".reset-reset", this._component)
            resetForm.remove()
            const resetHeading = selector(".reset-heading", this._component)
            resetHeading.insertAdjacentElement("afterend", this.getResetConfirmForm())
        }

        if (!success)
            this._renderFormErrors(returnData)
    }

    _switchBackToLogin(returnData, success = false) {
        if (success) {
            this.controlHandler();
            return
        }
        if (!success) this._renderFormErrors(returnData, success)
    }

    _handleResetConfirmSubmit(ev) {
        const cls = this;
        let payload = this.destructureFormData(this.createPayload(ev).body)
        if (!payload) return;
        //entrypoint to api
        const queryObj = {
            endpoint: API.APIEnum.USER.RESET_PWD_CONFIRM,
            sec: null,
            actionType: "resetConfirmPwd",
            queryData: payload,
            callBack: this._switchBackToLogin.bind(this),
            spinner: true,
            alert: true,
            type: "POST"
        }
        API.queryAPI(queryObj)
    }

    getComponent() {
        return this._component
    }

    _generateMarkup() {
        return `
            <form action="" id="reset-pwd-form" class="form-class">
                <h2 class="reset-heading">Reset Password</h2>
                
                <div class="reset-reset">
                    <div class="reset-email-box form-box">
                        <input type="email" name="email" placeholder="email" class="bd-radius" required>
                    </div>
                </div>

                
                <button class="btn-submit">Submit</button>
            </form>

        `
    }

    getResetConfirmForm() {
        const markup = this._generateResetConfirmMarkup()
        const markupEl = ComponentMethods.HTMLToEl(markup)
        return markupEl
    }

    _generateResetConfirmMarkup() {
        return `
        <div class="reset-confirm">
            <div class="reset-token-box form-box">
                <input type="text" name="token" placeholder="token" class="bd-radius" required>
            </div>
            <div class="reset-uid-box form-box">
                <input type="text" name="uid" placeholder="uid" class="bd-radius" required>
            </div>
            <div class="reset-password-box form-box">
                <input type="password" name="new_password1" placeholder="new password" class="bd-radius" required>
            </div>
            <div class="reset-password-box form-box">
                <input type="password" name="new_password2" placeholder="confirm password" class="bd-radius" required>
            </div>

        </div>
        `
    }

    // remove() {
    //     this._component.remove()
    //     delete this
    // }
}