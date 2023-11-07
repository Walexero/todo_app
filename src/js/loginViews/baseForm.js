import { ComponentMethods } from "../components/componentMethods.js";
import { Alert } from "../components/alerts.js";
import { PASSWORD_NOT_MATCH_ERROR, DEFAULT_ALERT_TIMEOUT, INVALID_EMAIL_ERROR, INVALID_NAME_FORMAT } from "../config.js";
import { selector } from "../helper.js";

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

    addToken(token) {
        this._token = token
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

    destructureFormData(form) {
        const payload = {}
        for (const [key, value] of form) {
            payload[key] = value
        }
        return payload;
    }

    formValidator(data) {
        for (const [_, value] of data) {
            if (value.length === 0) throw new Error(`Invalid Form, All Fields are Required`)
        }

        const password1 = data.get("password", null)
        const password2 = data.get("password2", null)


        if (password1 && password2)
            this._validatePasswordField(password1, password2, "password", "password2")

        const new_password1 = data.get("new_password1", null)
        const new_password2 = data.get("new_password2", null)

        if (new_password1 && new_password2) this._validatePasswordField(new_password1, new_password2, "new_password1", "new_password2")

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

    _renderFormErrors(errors, success = false) {
        debugger;
        let renderError;
        if (success) {
            this._clearForm()
            return;
        };
        const errorKeys = Object.getOwnPropertyNames(errors)

        errorKeys.forEach(formFieldKey => {
            const formField = selector(`[name=${formFieldKey.trim()}]`, this._component)
            if (formField) {
                renderError = true
                formField.classList.add("form-field-error")
            }
        })
        if (renderError)
            this.activeFormErrors = true;
    }

    _clearForm() {
        const formInputs = this._component.querySelectorAll("input")
        formInputs.forEach(input => input.value = "")
    }

    _clearErrorSignal() {
        const inputs = this._component.querySelectorAll("input")
        inputs.forEach(input => input.classList.contains("form-field-error") && input.classList.remove("form-field-error"))
    }

    _validatePasswordField(field1, field2, field1FieldName, field2FieldName) {
        if (field1.trim() !== field2.trim()) {

            const formPayloadError = {}
            if (field1) (formPayloadError[field1FieldName] = "Password Does not Match")
            if (field2) (formPayloadError[field2FieldName] = "Password Does not Match")
            this._renderFormErrors(formPayloadError)

            throw new Error(PASSWORD_NOT_MATCH_ERROR)
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
        this._eventListeners.forEach(ev => this._component.removeEventListener(ev, cls._handleSubmit))

        if (removeComponent) {
            this._component.remove()
            delete this
        }
    }
}