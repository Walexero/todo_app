import { ComponentMethods } from "../componentMethods"

export class SwitchOption {
    AUTH_TYPES = {
        LOGIN: "login",
        CREATE: "create"
    }

    customEvent = "switch"

    constructor(authType) {
        this._validateAuthType(authType)
        this.authType = authType
    }

    _validateAuthType(authType) {
        const authTypeExists = this.AUTH_TYPES[authType.toUpperCase()]
        if (!authTypeExists) throw Error("Cannot Identify Auth Type")
    }

    component() {
        this.component = ComponentMethods.HTMLToEl(this._generateMarkup())
        return this.component
    }

    addToggler(toggler) {
        this.toggler = toggler
    }

    toggle() {
        this.toggler.toggleEvent(this.authType)
    }

    _generateMarkup() {
        console.log(this.authType)
        return `
            <div class="login-option">
                <div class="option-box login-box ${this.authType.includes(this.AUTH_TYPES.LOGIN) ? "active" : "inactive"}">
                    <h2 class="login-heading option-heading">
                        Login
                    </h2>
                </div>
                <div class="option-box create-box ${this.authType.includes(this.AUTH_TYPES.CREATE) ? "active" : "inactive"}"">
                    <h2 class="create-heading option-heading">
                        Sign Up
                    </h2>
                </div>
            </div>
        `
    }

    remove() {
        delete this;
    }
}