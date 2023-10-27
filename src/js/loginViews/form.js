import { CreateForm } from "./createForm.js"
import { LoginForm } from "./loginForm.js"

export class Form {
    constructor(formType) {
        switch (formType) {
            case "login":
                this.form = LoginForm
            case "create":
                this.form = CreateForm
        }
    }

    component() {
        return this.form.component()
    }

    addEventListener() {
        this.form.addEventListener()
    }
}