import { ComponentMethods } from "../componentMethods.js";
import { Alert } from "../components/alerts.js";
import { PASSWORD_NOT_MATCH_ERROR, DEFAULT_ALERT_TIMEOUT, INVALID_EMAIL_ERROR, INVALID_NAME_FORMAT } from "../config.js";

export class BaseForm {
    _eventListeners = ["submit", "keyup"]
    activeFormErrors = false

    component() {
        const cls = this;
        this._component = ComponentMethods.HTMLToEl(this._generateMarkup())

        this._eventListeners.forEach(ev => this._component.addEventListener(ev, cls._handleEvents.bind(cls)))

        return this._component
    }

    addControlHandler(handler) {
        this.controlHandler = handler
    }

    getComponent() {
        return this._component
    }

    createPayload(ev) {
        ev.preventDefault();
        const form = new FormData(this._component)
        let payload = null;
        try {
            this.formValidator(form)

            payload = {
                method: "POST",
                body: form
            }
            return payload
        } catch (err) {
            new Alert(err, DEFAULT_ALERT_TIMEOUT, "error").component()
        } finally { return payload }
    }

    formValidator(data) {
        for (const [_, value] of data) {
            if (value.length === 0) throw new Error(`Invalid Form, All Fields are Required`)
        }

        const password1 = data.get("password", null)
        const password2 = data.get("password1", null)


        if (password1 && password2) {
            if (password1.trim() !== password2.trim()) {

                const formPayloadError = {}
                if (password1) (formPayloadError.password = "Password Does not Match")
                if (password2) (formPayloadError.password1 = "Password Does not Match")
                this._renderFormErrors(formPayloadError)

                throw new Error(PASSWORD_NOT_MATCH_ERROR)
            }
        }

        const email = data.get("email", null)
        if (email) {
            const validEmail = this._validateEmail(email)
            if (!validEmail) {
                this._renderFormErrors({ email: "Invalid Email" })
                throw new Error(INVALID_EMAIL_ERROR)
            }
        }

        const [firstName, lastName] = [data.get("first_name"), data.get("last_name")]
        if (firstName, lastName) {
            const validFirstName = this._validateName(firstName)
            const validLastName = this._validateName(lastName)
            if (!validFirstName && !validLastName || !validFirstName || !validLastName) {
                const formErrors = {}
                !validFirstName ? (formErrors.first_name = "Invalid First Name") : null
                !validLastName ? (formErrors.last_name = "Invalid Last Name") : null
                this._renderFormErrors(formErrors)
                throw new Error(INVALID_NAME_FORMAT)
            }
        }
    }

    _validateEmail(email) {
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }

    _validateName(name) {
        if (name.trim().split(" ").length > 1) return false
        return true
    }


    remove(removeComponent = false) {
        const cls = this;
        this._eventListeners.forEach(ev => this._component.removeEventListener(ev, cls._handleSubmit.bind(cls)))

        if (removeComponent) {
            this._component.remove()
            delete this
        }
    }
}