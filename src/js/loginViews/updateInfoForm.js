import { BaseForm } from "./baseForm.js";
import { API } from "../api.js";

export class UpdateInfoForm extends BaseForm {

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
            endpoint: API.APIEnum.USER.UPDATE_INFO,
            token: this._token,
            sec: null,
            actionType: "updateInfo",
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
            <form action="" id="update-info-form" class="form-class">
                
                <div class="update-first-name-box update-form-box">
                    <input type="text" name="first_name" placeholder="first name" class="bd-radius" required>
                </div>
                
                <div class="update-last-name-box update-form-box">
                    <input type="text" name="last_name" placeholder="last name" class="bd-radius" required>
                </div>
                <div class="update-email-box update-form-box">
                    <input type="email" name="email" placeholder="email" class="bd-radius" required>
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