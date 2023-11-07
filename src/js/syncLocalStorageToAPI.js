import { Loader } from "./components/loader.js";
import { ComponentMethods } from "./components/componentMethods.js";
import { delegateMatchTarget } from "./helper.js";

class SyncLocalStorageToAPI {
    _container = document.querySelector(".container .row")
    _modelState;
    _diffState;
    _syncNotifyActive = false;

    _eventListeners = ["click"]

    notifyUIToSyncChanges() {
        if (this._syncNotifyActive) return;
        this._container.insertAdjacentElement("afterbegin", this._component)
    }

    component() {
        this._component = ComponentMethods.HTMLToEl(this._generateMarkup())
    }

    addModelData(modelState, diffState) {
        this._modelState = modelState
        this._diffState = diffState
    }

    _handleEvents(ev) {
        if (delegateMatchTarget(ev, "btn-sync-now")) _handleStartSync(ev)
        if (delegateMatchTarget(ev, "btn-sync-later")) this._removeNotifier()
    }

    _handleStartSync(ev) {
        const diffData = "";
    }

    _generateMarkup() {
        return `
            <div class="sync-alert">
                <div class="sync-msg">
                  It is adviced data now to prevent data Loss
                </div>
                <div class="sync-btns">
                  <button class="btn-sync btn-sync-now bd-radius">Sync Now</button>
                  <button class="btn-sync btn-sync-later bd-radius">Sync Later</button>
                </div>
            </div>
        `
    }

    _removeNotifier() {
        const cls = this
        this._eventListeners.forEach(ev => this._component.removeEventListener(ev, cls._handleEvents))
        this._component.remove()
        this._syncNotifyActive = false;
    }

    remove() {
        this._removeNotifier()
        this._component = null
        delete this;
    }

}
export const importSyncLocalStorageToAPI = (() => new SyncLocalStorageToAPI());
