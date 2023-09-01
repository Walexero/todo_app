import DragComponentView from "./dragComponentView";

class DragComponentListView extends DragComponentView {
  _parentElement = document.querySelector("#component-container");
  _btnDrag = ".drag-icon";
  _observe = false;
  _observerHandler;

  constructor() {
    super();
  }

  _activateDragEvent() {
    this._parentEl = this._parentElement;
    this._addNudgeEvent();
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

  _activateDragEvent(dragHandler) {
    this._parentEl = this._parentElement;
    this.setObserverHandler(dragHandler);
    this._addNudgeEvent();
  }
}
export default new DragComponentListView();
