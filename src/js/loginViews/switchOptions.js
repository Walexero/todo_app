import { ComponentMethods } from "../componentMethods"
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

        const authType = this._replaceAuthTypeValue(ev.target.textContent.toLowerCase().trim().replaceAll("\n", ""))
        const currentAuthType = this._replaceAuthTypeValue(this.AUTH_TYPES[authType.toUpperCase()])
        const subAuthType = this._replaceAuthTypeValue(this.AUTH_TYPES_SUB[authType.toUpperCase()])

        this.authType = authType ===  currentAuthType ? currentAuthType : subAuthType 

        this.toggle()
    }

    _replaceAuthTypeValue(authType){
        
        if(authType.trim() === "sign up") return "create"
        return authType
    }

    addToggler(toggler) {
        this.toggler = toggler
    }

    toggle() {
        this.toggler.updateDependency()
    }

    _setMarkupProperties(){
        this.currentAuthType = this.AUTH_TYPES[this.authType.toUpperCase()]
        this.currentAuthTypeStatus =  this.authType.includes(this.AUTH_TYPES[this.authType.toUpperCase()]) ? "active" : "inactive"
        this.currentAuthTypePlaceholder = this.AUTH_TYPE_PLACEHOLDER[this.authType.toUpperCase()]

        this.subAuthType = this.AUTH_TYPES_SUB[this.authType.toUpperCase()]
        this.subAuthTypeStatus = this.authType.toUpperCase().includes(this.AUTH_TYPES_SUB[this.authType.toUpperCase()]) ? "active" : "inactive"
        this.subAuthTypePlaceholder = this.AUTH_TYPE_PLACEHOLDER[this.AUTH_TYPES_SUB[this.authType.toUpperCase()].toUpperCase()]
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
        delete this;
    }
}