import { API } from "../api";
import { selector } from "../helper";
import { BaseForm } from "./baseForm";

export class CreateForm extends BaseForm {
    constructor() {
        super()
    }

    _handleEvents(ev) {
        if (this.activeFormErrors) this._clearErrorSignal()
        if (ev.type === "submit") this._handleSubmit(ev)
    }

    _handleSubmit(ev) {
        const payload = this.createPayload(ev)

        if (!payload) return

        //query create endpoint
        const queryObj = {
            endpoint: API.APIEnum.USER.CREATE,
            sec: null,
            actionType: "create",
            queryData: payload,
            callBack: this._renderFormErrors.bind(this),
            spinner: true,
            alert: true,
            type: null,
        }
        // API.queryAPI(, null, "create", payload, this._renderFormErrors.bind(this))
        API.queryAPI(queryObj)

    }


    _generateMarkup() {
        return `
            <form action="" id="create-form" class="form-class">
                <div class="first-name-box form-box">
                    <input type="text" name="first_name" placeholder="first name" required>
                </div>
                <div class="last-name-box form-box">
                    <input type="text" name="last_name" placeholder="last name" required>
                </div>
                <div class="email-box form-box">
                    <input type="email" name="email" placeholder="email" required>
                </div>
                <div class="password-box form-box">
                    <input type="password" name="password" placeholder="password" required>
                </div>
                <div class="password-box form-box">
                    <input type="password" name="password2" placeholder="confirm password" required>
                </div>
                <button class="btn-login btn-submit">Submit</button>
            </form>
        `
    }


    // remove() {
    //     this._component.remove()
    //     delete this
    // }
}