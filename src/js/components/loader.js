import { Overlay } from "./overlay.js";
import { ComponentMethods } from "../componentMethods.js";
import { timeout } from "../helper.js";
import { Alert } from "./alerts.js";
// import { API } from "../api.js";

export class Loader {

    constructor(timeout, actionType) {
        this.timeout = timeout
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
        return this._component;
    }

    _generateMarkup() {
        return `
            <div class="custom-loader"></div>
        `
    }

    remove() {
        this.overlay.remove()
        this._component.remove()
        delete this
    }
}