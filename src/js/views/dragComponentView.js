import { Sortable } from "sortablejs";
import { MUTATION_OBSERVER_TIMEOUT } from "../config.js";

export default class DragComponentView {
  _parentEl;
  _btnDrag = ".draggable-component-btn";
  _nudge = document.querySelector(this._btnDrag);
  _swapClass = ".drag-highlight";
  _caller;
  _observe;
  _mutationObserver;
  _observerHandler;

  _addNudgeEvent() {
    this._nudge.addEventListener("mousedown", this._swapComponent.bind(this));
  }

  _observerTimer(observer) {
    const cls = this;
    return new Promise(function (resolve) {
      setTimeout(function () {
        console.log("Disconnected observer");
        observer.disconnect();
        //let taskActionsView know that the observer is no longer observing and allow other 
        resolve(cls._observerHandler());
      }, MUTATION_OBSERVER_TIMEOUT * 1000);
    });
  }

  _observeDOMChanges() {
    this._mutationObserver = new MutationObserver(function (mutations) {
      console.log("checking muts");
      mutations.forEach(function (mutation) {
        console.log("")
      });
    });
    this._mutationObserver.observe(this._parentEl, {
      childList: true,
    });

    this._observerTimer(this._mutationObserver);
  }

  _swapComponent() {
    Sortable.create(this._parentEl, {
      swap: true,
      handle: this._btnDrag,
      swapClass: this._swapClass,
      animation: 150,
    });

    if (this._observe) this._observeDOMChanges();
  }
}
