import { ClassEvent } from "./classEvent";

export class Toggles extends ClassEvent {
    constructor(initiator, dependent, dependentClass) {

    }

    updateDependency(initiator, dependent) {

    }

    toggleEvent(ev, detail) {
        this.dispatchEvent(new CustomEvent(ev, {
            detail: { detail }
        }))
    }
}