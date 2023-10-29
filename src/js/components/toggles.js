export class Toggles {
    constructor(initiator, dependent, dependentClass) {
        this.initiator = initiator
        this.dependent = dependent
        this.dependentClass = dependentClass
    }

    updateDependency() {
        const newDependent = this.dependentClass.form(this.initiator.authType)
        this.dependent.getComponent().replaceWith(newDependent.component())
        newDependent.controlHandler = this.dependent.controlHandler
        this.dependent.remove()

        //reset dependent
        this.dependent = newDependent
    }
}