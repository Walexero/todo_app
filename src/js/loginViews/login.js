import { SwitchOption } from "./switchOptions.js"
import { Form } from "./form.js"
import { Overlay } from "./overlay.js"
import { delegateMatch } from "../helper.js"
import { ComponentMethods } from "../componentMethods.js"
import { Toggles } from "../components/toggles.js"

class Login {

    _listenerNodes = []

    _eventListeners = ["click", "keyup"]

    addHandlers() {

    }

    updateListenerNodeState(node, handler) {
        const nodeExists = this._listenerNodes.find(listenerNode => listenerNode.node === node)
        if (nodeExists) return;

        const nodeObj = {}
        nodeObj.node = node
        nodeObj.ev = this._eventListeners
        nodeObj.handler = handler
        this._listenerNodes.push(nodeObj)
    }

    addEventListeners() {
        const cls = this;
        const loginBtns = document.querySelectorAll(".btn_link")

        //each node should return self
        loginBtns.forEach(btn => {
            this._eventListeners.forEach(ev => btn.addEventListener(ev, this._handleEvents.bind(cls)))
            this.updateListenerNodeState(btn, this._handleEvents)
        })
    }

    _handleEvents(ev) {
        //login ev
        if (delegateMatch(ev, "btn-login")) this.handleAuth("login")
        //create ev
        if (delegateMatch(ev, "btn-create")) this.handleAuth("create")
    }

    handleAuth(authType) {
        const switcher = new SwitchOption(authType)
        const form = Form.form(authType)
        // switcher.addToggler(Toggles())

        const component = this.component(this._generateMarkup(), switcher, form)

        const overlay = new Overlay(component)
        overlay.render()
    }

    // handleLogin

    component(loginEl, switchComponent, formComponent) {
        const componentCont = loginEl

        componentCont.insertAdjacentElement("afterbegin", switchComponent.component())
        componentCont.insertAdjacentElement("beforeend", formComponent.component())

        return componentCont
    }

    _generateMarkup() {
        const markup = `
            <div class="login-container">
            </div>
        `
        const markupEl = ComponentMethods.HTMLToEl(markup)
        return markupEl
    }

    remove() {
        this._listenerNodes.forEach(listenerNode => {
            listenerNode.ev.forEach(e =>
                listenerNode.removeEventListener(e, listenerNode.handler)
            )
        })

        delete this;
    }
}

export default new Login();