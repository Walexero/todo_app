import { ComponentMethods } from "../componentMethods.js"
import { Form } from "../loginViews/form"

export class UpdateUserInfoComponent {

    _children = []
    _eventListeners = ["click"]
    _updateInfoActive = false;
    _container = ".container"
    _contentContainer = ".td-row"
    _btnComponent;

    getComponent() {
        return this._component
    }

    addEventListeners(requestHandler = undefined) {
        this.requestHandler = requestHandler
        this._insertBtnComponent()
    }

    _insertBtnComponent() {
        const cls = this;
        this._btnComponent = this._generateBtnMarkup()
        this._eventListeners.forEach(ev => this._btnComponent.addEventListener(ev, cls._handleEvents.bind(cls)))
        document.querySelector(".navbar").insertAdjacentElement("beforeend", this._btnComponent)
    }

    _handleEvents(ev) {
        if (ev.target.closest(".btn-update")) this.handleUpdateRequest()
    }

    component(updateInfoEl, formComponent) {
        const componentCont = updateInfoEl
        componentCont.querySelector(".info-update-content").insertAdjacentElement("afterbegin", formComponent.component())
        return componentCont
    }

    handleUpdateRequest() {
        this._updateInfoActive ? this._updateInfoActive = false : this._updateInfoActive = true

        if (!this._updateInfoActive) {
            this.remove(true)
            document.querySelector(this._container).classList.remove("update-info-active")
            return
        }

        document.querySelector(this._container).classList.add("update-info-active")

        const form = Form.form("updateInfo")
        form.addControlHandler(this.requestHandler)
        this._children.push(form)
        this._component = this.component(this._generateMarkup(), form)

        document.querySelector(this._contentContainer).insertAdjacentElement("beforeend", this._component)
    }

    _generateBtnMarkup() {
        const btnMarkup = `<button class="btn-update">Update Info</button>`
        const btnEl = ComponentMethods.HTMLToEl(btnMarkup)
        return btnEl
    }

    _generateMarkup() {
        const markup = `
        <div class="td-update-info">
            <div class="info-update-heading">

                <h2>Update Your Info</h2>
            </div>
            <div class="info-update-content"><div>
        </div>
        `
        const markupEl = ComponentMethods.HTMLToEl(markup)
        return markupEl

    }

    remove(children = false) {
        console.log("childrene", this._children)
        if (children & this._children.length > 0) this._children.forEach(child => child.remove())
        // this._eventListeners.forEach(ev => this._btnComponent.removeEventListeners(ev, this._handleEvents))
        this._component.remove()
        // this.remove()
        // delete this;
    }
}