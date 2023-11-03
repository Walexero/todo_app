import { importDragComponentListView } from "./dragComponentListView.js";
class TodoActionsView {
  _todoParentElement = ".component-container--box";
  _deleteHandler;
  _completeHandler;
  _saveBeforeRenderHandler;
  _navHandler;
  _dragElementActive = false;
  _dragElement;

  addHandlerTodoActions(
    delHandler,
    compHandler,
    dragHandler,
    saveBeforeRenderHandler,
    navHandler
  ) {
    if (
      this._deleteHandler &&
      this._completeHandler &&
      this._saveBeforeRenderHandler
    )
      return;
    //handlers to call controller for state execution
    this._deleteHandler = delHandler;
    this._completeHandler = compHandler;
    this._dragHandler = dragHandler;
    this._saveBeforeRenderHandler = saveBeforeRenderHandler;
    this._navHandler = navHandler;
  }

  actionHandler(action, todo = undefined) {
    let todoID;

    if (!this._dragElementActive) {
      this._dragElement = importDragComponentListView();
    }

    //get todo id
    if (todo) {
      todoID = todo.closest(this._todoParentElement).dataset.id;
    }

    //offload to controller
    if (action === "delete") {
      this._dragElement.setObserver(false);
      this._deleteHandler(todoID);
    }
    if (action === "complete") {
      const uncompleteStatus = todo.textContent.trim().toLowerCase().includes("unmark") ? false : null

      this._dragElement.setObserver(false);
      this._completeHandler(todoID, uncompleteStatus);
    }
    if (action === "drag") {
      this._dragElement.setObserver(true);
      this._dragElement._activateDragEvent(this._dragHandler);
    }

    if (action === "saveAndRender") {
      this._dragElement.setObserver(false);
      this._saveBeforeRenderHandler(todoID);
    }

    if (action === "switchNav") {
      this._dragElement.setObserver(false);
      this._navHandler();
    }
  }
}

export default new TodoActionsView();
