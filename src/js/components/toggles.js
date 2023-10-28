import { ClassEvent } from "./classEvent";
// extends ClassEvent
//TODO: imp classEvent architecture if it fits into structure if refactoring

export class Toggles {
    constructor(initiator, dependent, dependentClass) {
        this.initiator = initiator
        this.dependent = dependent
        this.dependentClass = dependentClass
    }

    updateDependency() {
        const newDependent = this.dependentClass.form(this.initiator.authType)
        this.dependent.getComponent().replaceWith(newDependent.component())
        this.dependent.remove()

        //reset dependent
        this.dependent = newDependent
    }

    // toggleEvent(ev, detail) {
    //     this.dispatchEvent(new CustomEvent(ev, {
    //         detail: { detail }
    //     }))
    // }
}