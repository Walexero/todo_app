import { ComponentMethods } from "../components/componentMethods"
import { delegateMatch } from "../helper"

export class SwitchOption {
    AUTH_TYPES = {
        LOGIN: "login",
        CREATE: "create",
        UPDATE_INFO: "updateInfo",
        UPDATE_PWD: "updatePwd"
    }

    AUTH_TYPES_SUB = {
        LOGIN: "create",
        UPDATE_INFO: "updatePwd",
        CREATE: "login",
        UPDATE_PWD: "updateInfo"
    }

    AUTH_TYPE_PLACEHOLDER = {
        LOGIN: "Login",
        CREATE: "Sign Up",
        UPDATE_INFO: "Update Info",
        UPDATE_PWD: "Update Password"
    }

    _eventListeners = ["click"]

    customEvent = "switch"

    constructor(authType, separator = false) {
        this._validateAuthType(authType)
        this.authType = authType
        this.separator = separator ? "_" : null
        this.prevAuthType = this.authType
    }

    pass() { }

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

    getComponent() {
        return this._component
    }

    _handleEvents(ev) {
        if (delegateMatch(ev, "option-box")) this._handleSwitchToggle(ev)
    }

    _handleSwitchToggle(ev) {

        const authType = this._replaceAuthTypeValue(ev.target.textContent.toLowerCase().trim().replaceAll("\n", ""))

        if (this.authType === authType) return;

        const options = this._component.querySelectorAll(".option-box")
        options.forEach(option => {
            option.classList.toggle("active")
            option.classList.toggle("inactive")
        })


        const currentAuthType =
            this.AUTH_TYPES[this._formatAuthType(authType).toUpperCase()]
        const subAuthType = this.AUTH_TYPES_SUB[this._formatAuthType(authType).toUpperCase()]

        this.authType = authType === currentAuthType ? currentAuthType : subAuthType

        this.toggle()
    }

    _replaceAuthTypeValue(authType) {

        if (authType.trim() === "sign up") return "create"
        if (authType.trim() === "update info") return "updateInfo"
        if (authType.trim() === "update password") return "updatePwd"
        return authType
    }

    _formatAuthType(authType) {
        if (authType.includes("_")) return authType
        if (this.separator) {
            const split = this._getAuthTypeSplitChar(authType)
            return this._addAuthTypeSeparator(authType, split)
        }
        return authType
    }

    _getAuthTypeSplitChar(authType) {
        let splitIndex;
        authType.split("").forEach((char, i) => char.toUpperCase() === authType[i] ? splitIndex = i : this.pass())
        if (splitIndex) return authType[splitIndex];
        return authType
    }

    _addAuthTypeSeparator(authType, splitChar) {
        const splitter = authType.split(splitChar)
        splitter[1] = splitChar + splitter[1]
        return splitter.join("_")
    }

    addToggler(toggler) {
        this.toggler = toggler
    }

    toggle() {
        this.toggler.updateDependency()
    }

    _setMarkupProperties() {
        this.currentAuthType = this.AUTH_TYPES[this._formatAuthType(this.authType).toUpperCase()]

        this.currentAuthTypeStatus = this._formatAuthType(this.authType).includes(
            this._formatAuthType(
                this.AUTH_TYPES[this._formatAuthType(this.authType).toUpperCase()])
        ) ? "active" : "inactive"

        this.currentAuthTypePlaceholder = this.AUTH_TYPE_PLACEHOLDER[this._formatAuthType(this.authType).toUpperCase()]

        this.subAuthType = this.AUTH_TYPES_SUB[this._formatAuthType(this.authType).toUpperCase()]

        this.subAuthTypeStatus = this._formatAuthType(this.authType).toUpperCase().includes(
            this._formatAuthType(
                this.AUTH_TYPES_SUB[this._formatAuthType(this.authType).toUpperCase()])
        ) ? "active" : "inactive"

        this.subAuthTypePlaceholder = this.AUTH_TYPE_PLACEHOLDER[
            this._formatAuthType(
                this.AUTH_TYPES_SUB[this._formatAuthType(this.authType).toUpperCase()]
            ).toUpperCase()]
    }

    _generateMarkup() {
        //set the properties to be used in the markup
        this._setMarkupProperties()

        return `
            <div class="form-option">
                <div class="option-box ${this.currentAuthType}-box ${this.currentAuthTypeStatus}">
                    <h2 class="${this.currentAuthType}-heading option-heading">
                        ${this.currentAuthTypePlaceholder}
                    </h2>
                </div>
                <div class="option-box ${this.subAuthType}-box ${this.subAuthTypeStatus}">
                    <h2 class="${this.subAuthType}-heading option-heading">
                        ${this.subAuthTypePlaceholder}
                    </h2>
                </div>
            </div>
        `
    }

    remove() {
        const cls = this;
        this._eventListeners.forEach(ev => this._component.removeEventListener(ev, cls._handleEvents))
        this._component.remove()
        delete this;
    }
}