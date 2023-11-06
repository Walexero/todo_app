export class Toggles {
    constructor(initiator, dependent, dependentClass,token) {
        this.initiator = initiator
        this.dependent = dependent
        this.dependentClass = dependentClass
        this.token = token
    }

    updateDependency() {
        const newDependent = this.dependentClass.form(this.initiator.authType)
        this.dependent.getComponent().replaceWith(newDependent.component())
        newDependent.addToken(this.token)
        newDependent.controlHandler = this.dependent.controlHandler
        this.dependent.remove()

        //reset dependent
        this.dependent = newDependent
    }

    remove(){
        delete this
    }
}