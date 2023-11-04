import { BaseForm } from "./baseForm";

export class UpdateInfoForm extends BaseForm {

    constructor() {
        super()
    }

    _handleEvents(ev) {
        if (ev.type === "submit") this._handleSubmit(ev)
    }

    _handleSubmit(ev) {
        alert("Implement to update info")
        // const payload = this.createPayload(ev)
        // if (!payload) return;
        // //entrypoint to api
        // const queryObj = {
        //     endpoint: API.APIEnum.USER.TOKEN,
        //     sec: null,
        //     actionType: "login",
        //     queryData: payload,
        //     callBack: this.loginWithToken.bind(this),
        //     spinner: true,
        //     alert: true,
        //     type: null
        // }
        // API.queryAPI(queryObj)
    }

    getComponent() {
        return this._component
    }

    _generateMarkup() {
        return `
            <form action="" id="update-info-form" class="form-class">
                <div class="update-email-box update-form-box">
                    <input type="email" name="email" placeholder="email" class="bd-radius" required>
                </div>
                <div class="update-password-box update-form-box">
                    <input type="password" name="password" placeholder="password" class="bd-radius" required>
                </div>
                <div class="update-password-box update-form-box">
                    <input type="password" name="password1" placeholder="confirm password" class="bd-radius" required>
                </div>
                <button class="btn-submit">Submit</button>
            </form>

        `
    }

    remove() {
        this._component.remove()
        delete this
    }
}