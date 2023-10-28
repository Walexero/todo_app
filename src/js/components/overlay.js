
import { ComponentMethods } from "../componentMethods";
import { delegateConditional } from "../helper";

export class Overlay {
    _eventListeners = ["click", "keyup"]

    constructor(contentComponent, disableEvents = false) {
        this.contentComponent = contentComponent
        this.positionEl = document.querySelector(".content");
        this._component = this.component()
        this.disableEvents = disableEvents
    }

    component() {
        this._component = ComponentMethods.HTMLToEl(this._generateMarkup())
        this.contrast = this._component.querySelector(".contrast")
        const overlayContent = this._component.querySelector(".overlay-content")
        overlayContent.insertAdjacentElement("beforeend", this.contentComponent.getComponent())
        return this._component
    }

    render() {
        const cls = this;
        this.positionEl.insertAdjacentElement("afterend", this._component)

        if (!this.disableEvents) {
            this.contrast.addEventListener(cls._eventListeners[0], cls._handleEvents.bind(cls))
            window.addEventListener(cls._eventListeners[1], cls._handleEvents.bind(cls))
        }

    }

    _handleEvents(ev) {
        if (delegateConditional(ev, "contrast", "body")) this.remove()
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
        const cls = this;

        if (!this.disableEvents) {
            this._eventListeners.forEach(ev => {
                this.contrast.removeEventListener(ev, cls._handleEvents)
                window.removeEventListener(ev, cls._handleEvents)
            })
            //remove content component
            this.contentComponent.remove(true)
        }
        this._component.remove()


        delete this;
    }

}