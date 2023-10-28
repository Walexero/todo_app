import { ComponentMethods } from "../componentMethods"
import { delegateMatch } from "../helper"

export class SwitchOption {
    AUTH_TYPES = {
        LOGIN: "login",
        CREATE: "create"
    }

    _eventListeners = ["click"]

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
        const cls = this;
        this._component = ComponentMethods.HTMLToEl(this._generateMarkup())
        this._eventListeners.forEach(ev => this._component.addEventListener(ev, cls._handleEvents.bind(cls)))

        return this._component
    }

    _handleEvents(ev) {
        if (delegateMatch(ev, "option-box")) this._handleSwitchToggle(ev)
    }

    _handleSwitchToggle(ev) {
        const options = this._component.querySelectorAll(".option-box")
        options.forEach(option => {
            option.classList.toggle("active")
            option.classList.toggle("inactive")
        })

        const authType = ev.target.textContent.toLowerCase().trim().replaceAll("\n", "")
        this.authType = authType === "login" ? "login" : "create"
        this.toggle()
    }

    addToggler(toggler) {
        this.toggler = toggler
    }

    toggle() {
        this.toggler.updateDependency()
    }

    _generateMarkup() {
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
        const cls = this;
        this._eventListeners.forEach(ev => this._component.removeEventListener(ev, cls._handleEvents))
        delete this;
    }
}