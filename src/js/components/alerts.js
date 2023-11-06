import { delegateMatch, timeoutWithoutPromise, selector } from "../helper.js";
import { ComponentMethods } from "../componentMethods.js";

export class Alert {
    _eventListeners = ["click"]
    timeout = 3 //1 sec to timeout

    constructor(msg, timeout, alertType) {
        this.msg = msg
        this.timeout = timeout ?? this.timeout
        this.alertType = alertType
    }

    component() {
        const cls = this;
        this._component = ComponentMethods.HTMLToEl(this._generateMarkup())

        this._eventListeners.forEach(ev => this._component.addEventListener(ev, cls._handleEvents.bind(cls)))


        selector("body").insertAdjacentElement("afterbegin", this._component)

        //remove component after set timeout
        timeoutWithoutPromise(this.timeout, this.remove.bind(cls))
    }

    _handleEvents(ev) {
        if (delegateMatch(ev, "alert")) this.remove()
    }


    _generateMarkup(success = false) {
        return `
            <div class="alert">
                <div class="alert-icon alert-${this.alertType}">
                    ${this._svgMarkup(this.alertType)}
                </div>
                <div class="alert-msg">
                    ${this.msg}
                </div>
            </div>
        `
    }

    _svgMarkup(alertType) {
        if (alertType === "success") {
            return `
                <svg class="alert-${this.alertType}-icon" xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 448 512">
                    <path d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z"/>
                </svg>
            `
        }

        else {
            return `
                <svg class="alert-${this.alertType}-icon" xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512">
                    <path d="M256 32c14.2 0 27.3 7.5 34.5 19.8l216 368c7.3 12.4 7.3 27.7 .2 40.1S486.3 480 472 480H40c-14.3 0-27.6-7.7-34.7-20.1s-7-27.8 .2-40.1l216-368C228.7 39.5 241.8 32 256 32zm0 128c-13.3 0-24 10.7-24 24V296c0 13.3 10.7 24 24 24s24-10.7 24-24V184c0-13.3-10.7-24-24-24zm32 224a32 32 0 1 0 -64 0 32 32 0 1 0 64 0z"/>
                </svg>
            `
        }
    }

    remove() {
        const cls = this;
        this._eventListeners.forEach(ev => this._component.removeEventListener(ev, cls._handleEvents.bind(cls)))
        this._component.remove()
        delete this;
    }
}