
import { ComponentMethods } from "../componentMethods";

export class Overlay {
    constructor(contentComponent) {
        this.contentComponent = contentComponent
        this.positionEl = document.querySelector(".content");
        this._component = this.component()
    }

    component() {
        this._component = ComponentMethods.HTMLToEl(this._generateMarkup())
        console.log(this._component)
        const overlayContent = this._component.querySelector(".overlay-content")
        overlayContent.insertAdjacentElement("beforeend", this.contentComponent)
        return this._component
    }

    render() {
        this.positionEl.insertAdjacentElement("afterend", this._component)
    }

    _generateMarkup() {
        return `
            <div class="overlay">
                <div class="contrast">

                </div>
                <div class="overlay-content">
                    
                </div>
            </div>
        `
    }

    remove() {

    }

}