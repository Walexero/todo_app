import { Loader } from "./components/loader.js";
import { ComponentMethods } from "./components/componentMethods.js";

class SyncLocalStorageToAPI {

    _eventListeners = ["click"]

    notifyUIToSyncChanges() {

    }

    component() {
        this._component = ComponentMethods.HTMLToEl(this._generateMarkup())
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

}
export const importSyncLocalStorageToAPI = (() => new SyncLocalStorageToAPI());
