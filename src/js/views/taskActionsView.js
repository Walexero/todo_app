import dragComponentRenderView from "./dragComponentRenderView.js";

// const taskId = e.target.closest(".td-component-content").dataset.taskid
class TaskActionsView {
  _taskParentElement = ".td-component-content";
  _deleteHandler;
  _completeHandler;
  _dragHandler;
  _dragElement = dragComponentRenderView;
  _observerActive = false

  setObserverActiveState(value) {
    this._observerActive = value;
  }

  addHandlerTaskActions(delHandler, compHandler, dragHandler) {
    if (this._deleteHandler && this._completeHandler) return;
    //handlers to call controller for state execution
    this._deleteHandler = delHandler;
    this._completeHandler = compHandler;
    this._dragHandler = dragHandler;
  }

  actionHandler(action, task) {
    //get task id
    const taskID = task.closest(this._taskParentElement).dataset.taskid;

    //offload to controller
    if (action === "delete") {
      this._dragElement.setObserver(false);
      this._deleteHandler(+taskID);
    }
    if (action === "complete") {
      this._dragElement.setObserver(false);
      this._completeHandler(+taskID, task.checked);
    }
    if (action === "drag") {
      //if observer is active other actions cant run
      this._observerActive = true;

      this._dragElement.setObserver(true);
      this._dragElement._activateDragEvent(this._dragHandler);
    }
  }
}

export default new TaskActionsView();
