import { BaseForm } from "./baseForm.js";
import { API } from "../api.js";

export class LoginForm extends BaseForm {
    constructor() {
        super()
    }

    _handleEvents(ev) {
        if (ev.type === "submit") this._handleSubmit(ev)
    }

    _handleSubmit(ev) {
        const payload = this.createPayload(ev)
        if (!payload) return;
        //entrypoint to api
        const queryObj = {
            endpoint: API.APIEnum.USER.TOKEN,
            sec: null,
            actionType: "login",
            queryData: payload,
            callBack: this.loginWithToken.bind(this),
            spinner: true,
            alert: true,
            type: null
        }
        API.queryAPI(queryObj)
    }

    loginWithToken(token, success) { //NOTE: do not remove success param
        if (token)
            //offload to controller
            this.controlHandler(token)

    }

    _generateMarkup() {
        return `
            <form action="" id="login-form" class="form-class">
                <div class="email-box form-box">
                    <input type="email" name="email" placeholder="email" required>
                </div>
                <div class="password-box form-box">
                    <input type="password" name="password" placeholder="password" required>
                </div>
                <button class="btn-login btn-submit">Submit</button>

            </form>

        `
    }
}