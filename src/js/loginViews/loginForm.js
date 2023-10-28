import { ComponentMethods } from "../componentMethods.js"

export class LoginForm {
    constructor() {

    }

    component() {
        this._component = ComponentMethods.HTMLToEl(this._generateMarkup())
        return this._component
    }

    getComponent() {
        return this._component
    }

    _generateMarkup() {
        return `
            <form action="" id="login-form" class="form-class">
                <div class="email-box form-box">
                    <input type="text" name="email" placeholder="email">
                </div>
                <div class="password-box form-box">
                    <input type="password" name="password" placeholder="password">
                </div>
                <button class="btn-login btn-submit">Submit</button>
            </form>

        `
    }

    addEventListener() {
        this.form.addEventListener()
    }

    remove() {
        this._component.remove()
        delete this
    }
}