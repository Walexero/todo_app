import dragComponentListView from "./dragComponentListView.js";

class TodoActionsView {
  _todoParentElement = ".component-container--box";
  _deleteHandler;
  _completeHandler;
  _saveBeforeRenderHandler;
  _navHandler;
  _dragHandler;
  _dragElement = dragComponentListView;

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
    //get todo id
    if (todo) {
      todoID = todo.closest(this._todoParentElement).dataset.id;
    }

    console.log(todoID);

    //offload to controller
    if (action === "delete") {
      console.log("got delete command");
      this._dragElement.setObserver(false);
      this._deleteHandler(todoID);
    }
    if (action === "complete") {
      this._dragElement.setObserver(false);
      this._completeHandler(todoID);
    }
    if (action === "drag") {
      console.log("dragging");
      this._dragElement.setObserver(true);
      this._dragElement._activateDragEvent(this._dragHandler);
    }

    if (action === "saveAndRender") {
      this._dragElement.setObserver(false);
      this._saveBeforeRenderHandler(todoID);
    }

    if (action === "switchNav") {
      console.log("triggereed nav switch");
      this._dragElement.setObserver(false);
      this._navHandler();
    }
  }
}

export default new TodoActionsView();
