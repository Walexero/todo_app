import { Overlay } from "./overlay.js";
import { ComponentMethods } from "./componentMethods.js";
import { timeout } from "../helper.js";
import { Alert } from "./alerts.js";
// import { API } from "../api.js";

export class Loader {

    constructor(timeout, actionType, syncMsg = false) {
        this.timeout = timeout
        this.syncMsg = syncMsg
    }

    component() {
        this._component = ComponentMethods.HTMLToEl(this._generateMarkup())

        this.overlay = new Overlay(this, true, {
            top: 40,
            left: 50
        }, true)
        this.overlay.render()
    }

    getComponent() {
        console.log(this._component)
        return this._component;
    }

    _generateMarkup() {
        if (this.syncMsg)
            return `
                <div>
                    <div class="custom-loader"></div>
                    <div class="loader-sync-msg">Syncing Data Please Wait ...</div>
                </div>
            `
        if (!this.syncMsg)
            return `
                <div>
                    <div class="custom-loader"></div>
                </div>
            `
    }

    remove() {
        this.overlay.remove()
        this._component.remove()
        delete this
    }
}