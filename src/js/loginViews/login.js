import { SwitchOption } from "./switchOptions.js"
import { Form } from "./form.js"
import { Overlay } from "../components/overlay.js"
import { delegateMatch } from "../helper.js"
import { ComponentMethods } from "../components/componentMethods.js"
import { Toggles } from "../components/toggles.js"

class Login {

    _listenerNodes = []

    _eventListeners = ["click", "keyup"]

    _children = []


    pass() { }

    updateListenerNodeState(node, handler, temp = false) {
        const nodeExists = this._listenerNodes.find(listenerNode => listenerNode.node === node)
        if (nodeExists) return;

        const nodeObj = {}
        nodeObj.node = node
        nodeObj.ev = this._eventListeners
        nodeObj.handler = handler
        nodeObj.temp = temp
        this._listenerNodes.push(nodeObj)
    }

    addEventListeners(controlHandler) {
        //handler that gets called on login
        this.controlHandler = controlHandler.bind(this, this.remove.bind(this));

        const cls = this;
        const loginBtns = document.querySelectorAll(".btn_link")

        //each node should return self
        loginBtns.forEach(btn => {
            this._eventListeners.forEach(ev => btn.addEventListener(ev, this._handleEvents.bind(cls)))
            this.updateListenerNodeState(btn, this._handleEvents)

        })
    }

    _handleEvents(ev) {
        ev.stopPropagation();
        //login ev
        if (delegateMatch(ev, "btn-login")) this.handleAuth("login")
        if (delegateMatch(ev, "auth-btn-signin")) this._reRenderComponentContent("login")
        //create ev
        if (delegateMatch(ev, "btn-create")) this.handleAuth("create")
        if (delegateMatch(ev, "auth-btn-signup")) this._reRenderComponentContent("create")
        //reset ev
        if (delegateMatch(ev, "btn-reset")) this._handleReset("reset")
    }

    handleAuth(authType) {
        this._generateAuthComponent(authType)

        this._component = this.component(this._generateMarkup(), this.switcher, this.form, this)

        const overlay = new Overlay(this)
        overlay.render()
    }

    _handleReset(resetType) {
        const cls = this;
        this._removeChildren()

        if (this.form) {
            this.form.remove(true)
            this.form = null
            this.switcher = null

        }

        this._resetForm = Form.form(resetType)

        //remove temp components that change during the component lifecycle
        this._removeTempNodes()

        //add authRelatedbtns to component
        this._authBtnComponent = null;
        this._authBtnComponent = this._generateAuthRelatedBtnMarkup()
        this._insertTempNodeToComponent(this._authBtnComponent)

        //add reset callback as control handler
        this._resetForm.addControlHandler(this._handleResetCallBack.bind(this))
        this._children.push(this._resetForm)
        this._component.insertAdjacentElement("afterbegin", cls._resetForm.component())
    }

    _handleResetCallBack() {
        this._removeChildren()
        this._reRenderComponentContent("login")
    }

    _generateAuthComponent(authType) {
        //remove reset form if it exists
        if (this._resetForm) {

            this._resetForm.remove(true)
            this._resetForm = null;
        }
        this._removeChildren()

        this.switcher = new SwitchOption(authType)
        this.form = Form.form(authType)

        //toggle the form based on the swicher
        const toggler = new Toggles(this.switcher, this.form, Form)
        this.switcher.addToggler(toggler)

        //add control handler to form
        this.form.addControlHandler(this.controlHandler)

        this._children.push(this.switcher, this.form, toggler)
    }

    _reRenderComponentContent(authType) {
        this._removeTempNodes()
        this._generateAuthComponent(authType)
        this.component(this._baseComponent, this.switcher, this.form, this)
    }

    getComponent() {
        return this._component
    }

    component(loginEl, switchComponent, formComponent, cls) {
        this._baseComponent = this._baseComponent ?? loginEl

        this._baseComponent.insertAdjacentElement("afterbegin", switchComponent.component())
        this._baseComponent.insertAdjacentElement("beforeend", formComponent.component())

        //add forgot btn
        this._forgotBtnComponent = null
        this._forgotBtnComponent = this._generateForgotBtnMarkup()

        this._insertTempNodeToComponent(this._forgotBtnComponent)


        return this._baseComponent
    }

    _generateMarkup() {
        const markup = `
            <div class="login-container">
            </div>
        `
        const markupEl = ComponentMethods.HTMLToEl(markup)
        return markupEl
    }

    _generateForgotBtnMarkup() {
        const markup = `<a class="btn-reset" href="#">Forgot Password?</a>`
        const markupEl = this._forgotBtnComponent = ComponentMethods.HTMLToEl(markup)
        return markupEl
    }

    _generateAuthRelatedBtnMarkup() {
        const markup =
            `
        <div class="auth-btns">
            <a class="auth-btn-signin auth-btn" href="#">Sign In</a>
            <a class="auth-btn-signup auth-btn" href="#">Sign Up</a>
        </div>
        `
        const markupEl = this._authBtnComponent = ComponentMethods.HTMLToEl(markup)
        return markupEl
    }

    _insertTempNodeToComponent(tempNode) {
        const cls = this;
        this._eventListeners.forEach(ev => tempNode.addEventListener(ev, cls._handleEvents.bind(cls)))
        this._baseComponent.insertAdjacentElement("beforeend", tempNode)
        this.updateListenerNodeState(tempNode, cls._handleEvents, true)
    }

    _removeResetActive() {
        this._component.classList.remove("reset-active")
    }

    _removeTempNodes() {
        const cls = this;
        const tempNodes = []
        this._listenerNodes.forEach((node, i) => node.temp === true ? tempNodes.push([node, i]) : this.pass())
        tempNodes.forEach((node, i) => {
            node[0].ev.forEach(nodeEv => node[0].node.removeEventListener(nodeEv, cls._handleEvents))
            node[0].node.remove(true)
            tempNodes.splice(i, 1)
            this._listenerNodes.splice(node[1], 1)
        })
    }

    _removeChildren() {
        for (let i = this._children.length - 1; i > -1; i--) {
            this._children[i].remove(true)
            this._children.splice(i, 1)
        }
    }

    remove(children = false) {
        if (children) this._removeChildren()

        if (!children) {
            this._listenerNodes.forEach(listenerNode => {
                listenerNode.ev.forEach(e =>
                    listenerNode.node.removeEventListener(e, listenerNode.handler)
                )
            })
            this._removeChildren()
            this._removeTempNodes()

            delete this;
        }
    }
}

export default new Login();