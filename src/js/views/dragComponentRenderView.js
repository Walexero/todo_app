// import { Sortable } from "sortablejs";
import DragComponentView from "./dragComponentView.js";

class DragComponentRenderView extends DragComponentView {
  _parentElement = document.querySelector(
    ".td-render-component-container-content"
  );
  _btnDrag = ".drag-icon";
  _caller;
  _observe = false;
  _observerHandler;

  constructor() {
    super();
  }

  setObserver(value) {
    this._observe = value;
  }

  setObserverHandler(func) {
    this._observerHandler = func;
  }

  _addNudgeEvent() {
    this._swapComponent();
  }

  _activateDragEvent(dragHandler,notifyCallerOfObserverState=undefined) {
    console.log(notifyCallerOfObserverState)
    this._parentEl = this._parentElement;
    // this._caller = notifyCallerOfObserverState
    this.setObserverHandler(dragHandler);
    this._addNudgeEvent();
  }
}

export default new DragComponentRenderView();
