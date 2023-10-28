import { CreateForm } from "./createForm.js"
import { LoginForm } from "./loginForm.js"
import { ComponentMethods } from "../componentMethods.js"

export class Form {
    static form(formType) {
        switch (formType) {
            case "login":
                return new LoginForm()
                break;
            case "create":
                return new CreateForm()
                break;
        }
    }
}