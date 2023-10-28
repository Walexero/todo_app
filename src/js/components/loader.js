import { queryAPI } from "../helper.js";
import { Overlay } from "./overlay.js";
import { ComponentMethods } from "../componentMethods.js";
import { Alert } from "./alerts.js";

class Loader {

    constructor(timeout) {
        this.timeout = timeout
    }

    component() {
        this._component = ComponentMethods.HTMLToEl(this._generateMarkup())
        this.overlay = Overlay(this._component, true)
        overlay.render()


    }

    //TODO: add alert based on promise resolve


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