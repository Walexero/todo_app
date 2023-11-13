import { ComponentMethods } from "../components/componentMethods.js"
import { Form } from "../loginViews/form.js"
import { SwitchOption } from "../loginViews/switchOptions.js"
import { Toggles } from "../components/toggles.js"

export class UpdateUserInfoComponent {

    _children = []
    _eventListeners = ["click"]
    _updateInfoActive = false;
    _container = ".container"
    _contentContainer = ".td-row"
    _btnComponent;
    _token;

    getComponent() {
        return this._component
    }

    addEventListeners(token) {
        // this.requestHandler = requestHandler
        this._token = token
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

    component(updateInfoEl, switchComponent, formComponent) {
        const componentCont = updateInfoEl
        const componentSelector = componentCont.querySelector(".info-update-content")
        componentSelector.insertAdjacentElement("afterbegin", switchComponent.component())
        componentSelector.insertAdjacentElement("beforeend", formComponent.component())

        return componentCont
    }

    handleUpdateRequest() {
        this._updateInfoActive ? this._updateInfoActive = false : this._updateInfoActive = true

        const updateBtnInfo = document.querySelector(this._container)

        if (!this._updateInfoActive) {
            updateBtnInfo.classList.remove("update-info-active")
            this.remove(true)
            return
        }

        updateBtnInfo.classList.add("update-info-active")

        this._renderUpdateType(this._btnComponent.textContent)

    }

    _renderUpdateType(btnContent) {
        const updateType = this._formatBtnContentForSwitcher(btnContent)
        const switcher = new SwitchOption(updateType.switchType, true)
        const form = Form.form(updateType.updateType)

        //add form token
        form.addToken(this._token)

        //toggle the form based on the swicher
        switcher.addToggler(new Toggles(switcher, form, Form, this._token))

        //add control handler to form
        form.addControlHandler(this.requestHandler)

        this._children.push(switcher, form)

        this._component = this.component(this._generateMarkup(), switcher, form)

        document.querySelector(this._contentContainer).insertAdjacentElement("beforeend", this._component)

    }

    _formatBtnContentForSwitcher(btnContent) {
        let updateType = btnContent.split(" ")
        const switchType = updateType[0].toLowerCase() + "_" + updateType[1]
        updateType = updateType[0].toLowerCase() + updateType[1].slice(0, 1).toUpperCase() + updateType[1].slice(1)
        return { updateType, switchType }
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
        const cls = this;
        if (children & this._children.length > 0) this._children.forEach(child => child.remove())
        this._eventListeners.forEach(ev => this._btnComponent.removeEventListener(ev, cls._handleEvents))
        this._component.remove()
    }
}