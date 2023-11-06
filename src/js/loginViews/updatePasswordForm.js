import { BaseForm } from "./baseForm.js"
import { selector } from "../helper.js"
import { API } from "../api.js"

export class UpdatePasswordForm extends BaseForm {
    _token;

    constructor() {
        super()
    }

    _handleEvents(ev) {
        if (this.activeFormErrors) this._clearErrorSignal()
        if (ev.type === "submit") this._handleSubmit(ev)
    }

    _handleSubmit(ev) {
        const cls = this;
        let payload = this.destructureFormData(this.createPayload(ev).body)
        if (!payload) return;
        //entrypoint to api
        const queryObj = {
            endpoint: API.APIEnum.USER.UPDATE_PWD,
            token: this._token,
            sec: null,
            actionType: "updatePwd",
            queryData: payload,
            callBack: this._renderFormErrors.bind(cls),
            spinner: true,
            alert: true,
            type: "PUT"
        }
        API.queryAPI(queryObj)
    }

    getComponent() {
        return this._component
    }

    _generateMarkup() {
        return `
            <form action="" id="update-pwd-form" class="form-class">
                <div class="update-password-box update-form-box">
                    <input type="password" name="old_password" placeholder="old password" class="bd-radius" required>
                </div>
                <div class="update-password-box update-form-box">
                    <input type="password" name="password" placeholder="password" class="bd-radius" required>
                </div>
                <div class="update-password-box update-form-box">
                    <input type="password" name="password2" placeholder="confirm password" class="bd-radius" required>
                </div>
                <button class="btn-submit">Submit</button>
            </form>

        `
    }

    // remove() {
    //     this._component.remove()
    //     delete this
    // }
}