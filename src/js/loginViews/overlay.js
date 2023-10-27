
import { ComponentMethods } from "../componentMethods";

export class Overlay {
    constructor(contentComponent) {
        this.contentComponent = this.contentComponent
        this.positionEl = document.querySelector(".content");
    }

    component() {
        this.component = ComponentMethods(this._generateMarkup())
        const overlayContent = component.querySelector(".overlay-content")
        overlayContent.insertAdjacentElement("beforeend", this.contentComponent)
    }

    render() {
        this.positionEl.insertAdjacentElement("afterend", this.component)
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