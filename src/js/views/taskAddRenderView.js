// import taskActionsView from "./taskActionsView.js";
import { importTaskActionsView } from "./taskActionsView.js";
import { ComponentMethods } from "../components/componentMethods.js";

class TaskAddRenderView {
  _handler;
  _parentElement = document.querySelector(".td-render-component-container");
  _addTaskFormbtn = document.querySelector(".add-td-component-content");
  _renderContainer = document.querySelector(".td-render--container");
  _renderTitleInput = document.querySelector(".td-render-title");
  _renderComponentContainerContent = document.querySelector(
    ".td-render-component-container-content"
  );
  _renderCompletedContainer = document.querySelector(
    ".completed-td-component-content"
  );
  _taskContainerSelector = ".td-component-content";
  _taskActionsActive = false;
  _taskActions = importTaskActionsView();
  _taskEditHandler;
  _handlerUpdateTodoTitle
  _currentTodo;

  addHandlerTaskAdd(handler, handlerCreateNewTask, handlerUpdateTodoTitle) {
    const cls = this;
    this._handler = handler;
    this._handlerUpdateTodoTitle = handlerUpdateTodoTitle
    this._handlerCreateNewTask = handlerCreateNewTask
    this._handleFormEvents();
  }

  addDelegateTaskActions(delHandler, compHandler, dragHandler) {
    //All nudge related actions executed from taskActionView
    this._taskActions.addHandlerTaskActions(
      delHandler,
      compHandler,
      dragHandler
    );
  }

  setTaskActionState(value) {
    this._taskActionsActive = value;
  }

  setCurrentTodoState(value) {
    this._currentTodo = value
    console.log("current todo set", this._currentTodo)
  }

  getTaskActionState() {
    return this._taskActionsActive;
  }

  getUIState() {
    const taskContainers = document.querySelectorAll(
      this._taskContainerSelector
    );

    const contentEls = Array.from(taskContainers);
    const updatedIndex = contentEls.map((el, i) => [el.dataset.taskid, i]);
    return updatedIndex;
  }

  mobileRender(todo = undefined) {
    if (!todo) {
      this._toggleRenderContainer();
      this._updateUI(null);
    }
    if (todo) this.render(todo);
  }

  toggleContainer() {
    this._toggleRenderContainer();
  }

  _toggleRenderContainer() {
    this._renderContainer.classList.toggle("mobile-nav--hidden");
  }

  _handleAddTaskEvent() {
    const cls = this;
    cls._handleFormEvents;
  }

  _handleFormEvents() {
    const cls = this;

    //listen for event delegation events
    const events = ["click", "keydown", "mousedown", "change"];
    events.forEach((ev) => {
      document
        .querySelector(".td-render--content")
        .addEventListener(ev, function (e) {
          //Input render event
          if (
            e.target === cls._addTaskFormbtn ||
            e.target.parentElement === cls._addTaskFormbtn
          ) cls._renderInput()

          //refactor check into a function
          //drag event
          if (
            (e.type === "mousedown" &&
              e.target.classList.contains("draggable-component-btn")) ||
            e.target.classList.contains("drag-icon") ||
            e.target.classList.contains("drag-icon-path")
          )
            cls._taskActions.actionHandler("drag", e.target);
          //delete event
          if (
            e.type === "click" &&
            e.target.classList.contains("delete-component-btn") ||
            e.target.classList.contains("delete-icon") ||
            e.target.classList.contains("delete-icon-path")
          ) {
            const taskToDelete = e.target.closest(".delete-component-btn");
            cls._taskActions.actionHandler("delete", taskToDelete);
          }
          //complete event
          if (e.type === "change" && e.target.classList.contains("td-complete")) {
            cls._taskActions.actionHandler("complete", e.target)
          }

          //Submit Event
          if (e.type === "keydown" && e.key === "Enter") {
            if (e.target.closest(".td-render-title")) cls._handleTitleUpdate(e)
            else cls._handlerAddTask(e);
          }
        });
    });
  }

  _handleTitleUpdate(e) {
    e.preventDefault();
    const todoId = e.target.closest(".td-render--content").dataset.id
    const todoTitle = e.target.textContent.trim()
    this._handlerUpdateTodoTitle(+todoId, todoTitle)
  }

  _updateUI(markup = undefined, completedMarkup = undefined, title, todo = undefined, hideComponent = false) {
    //clear container
    this._renderComponentContainerContent.innerHTML =
      this._renderCompletedContainer.innerHTML =
      this._renderTitleInput.textContent =
      "";

    if (hideComponent)
      this._renderContainer.classList.add("hidden")



    if (markup) {
      //add markup to task container
      this._renderComponentContainerContent.insertAdjacentHTML(
        "afterbegin",
        markup
      );
      //add completed markup to completed container
      this._renderCompletedContainer.insertAdjacentHTML(
        "afterbegin",
        completedMarkup
      );
    }

    //if all tasks are marked as completed, render completed tasks
    if (!markup && completedMarkup) {
      //add completed markup to completed container
      this._renderCompletedContainer.insertAdjacentHTML(
        "afterbegin",
        completedMarkup
      );
    }

    //update title from form
    if (title) {
      this._renderTitleInput.textContent = title;
    }

    //set id attribute for the todo on the content container
    if (todo) {
      const taskComponentContent = document.querySelector(".td-render--content")
      taskComponentContent.setAttribute("data-id", todo.todoId)
    }
  }

  clearTaskContainer(hideContainer = false) {
    if (hideContainer) this._updateUI(null, null, null, null, true)
    else
      this._updateUI(null); //set the title to null, only clears container
  }

  render(todo = undefined) {
    //generate UI markupg
    let markup, completedMarkup;

    //render tasks markup only if tasks exist

    if (todo && todo?.tasks) {
      markup = Array(...new Set(todo?.tasks))
        .map((task) => {
          if (!task?.completed) return this._generateMarkup(task);
        })
        .join("");

      completedMarkup = todo?.tasks
        .map((task) => {
          if (task?.completed) return this._generateMarkup(task);
        })
        .join("");
    }

    //update UI
    if (todo) this._updateUI(markup, completedMarkup, todo.title, todo);
  }

  _renderInput() {
    const inputEl = ComponentMethods.HTMLToEl(this._generateMarkup())
    this._renderComponentContainerContent.insertAdjacentElement(
      "beforeend",
      inputEl
    );//afterbegin

    //calls controlCreateNewTask
    console.log("cur todo", this._currentTodo)
    this._handlerCreateNewTask(this._currentTodo, true, inputEl)
  }

  _renderAddedTask(task) {
    //remove input container
    document.querySelector(".input-container").remove();

    //add task
    const markup = this._generateMarkup(task);
    this._renderComponentContainerContent.insertAdjacentHTML(
      "afterbegin",
      markup
    );
  }

  _handlerAddTask(e) {
    e.preventDefault();
    const todoUIData = {}
    //adds the task related info from the DOM
    this._getTaskInfo(e, todoUIData)

    //return data to controller
    this._handler(todoUIData);

  }

  _getTaskInfo(e, todoUIData) {
    const todoTitle = e.target.closest(".td-render-title") ?? e.target.closest(".td-render-component-container").previousElementSibling.querySelector(".td-render-title")
    const taskInput = e.target.closest(".form-task-td")
    const taskId = taskInput.closest(".td-component-content")
    const taskData = taskInput.textContent.trim();
    const taskCompleted = taskInput?.previousElementSibling?.querySelector(".td-complete")?.checked ?? false
    const todoId = e.target.closest(".td-render--content").dataset.id;

    todoUIData.task = taskData
    todoUIData.todoId = +todoId
    todoUIData.completed = taskCompleted
    todoUIData.taskId = +taskId.dataset.taskid
    todoUIData.todoTitle = todoTitle.textContent.trim()
  }

  _inputMarkup(task = undefined) {
    function taskContent(task) {
      if (task?.task && task.completed) return `<s>${task.task}</s>`
      if (task?.task && !task.completed) return task.task

      return ""
    }

    return `
      <div contenteditable="true" class="form-task-td">
        ${taskContent(task)}
      </div>
    `
  }

  _generateCheckbox(task = undefined) {
    if (task) return `
      <input type="checkbox" class="td-complete" ${task?.completed ? "checked" : ""} />
    `
    return ""
  }

  _generateMarkup(task = undefined) {
    return `
    <div class="td-component-content" data-taskid="${task?.taskId ?? ''}">
      <div class="td-component-actions">
        <div class="draggable-component-btn">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="1em"
            viewBox="0 0 320 512"
            class="drag-icon"
          >
            <path
              class="drag-icon-path"
              d="M40 352l48 0c22.1 0 40 17.9 40 40l0 48c0 22.1-17.9 40-40 40l-48 0c-22.1 0-40-17.9-40-40l0-48c0-22.1 17.9-40 40-40zm192 0l48 0c22.1 0 40 17.9 40 40l0 48c0 22.1-17.9 40-40 40l-48 0c-22.1 0-40-17.9-40-40l0-48c0-22.1 17.9-40 40-40zM40 320c-22.1 0-40-17.9-40-40l0-48c0-22.1 17.9-40 40-40l48 0c22.1 0 40 17.9 40 40l0 48c0 22.1-17.9 40-40 40l-48 0zM232 192l48 0c22.1 0 40 17.9 40 40l0 48c0 22.1-17.9 40-40 40l-48 0c-22.1 0-40-17.9-40-40l0-48c0-22.1 17.9-40 40-40zM40 160c-22.1 0-40-17.9-40-40L0 72C0 49.9 17.9 32 40 32l48 0c22.1 0 40 17.9 40 40l0 48c0 22.1-17.9 40-40 40l-48 0zM232 32l48 0c22.1 0 40 17.9 40 40l0 48c0 22.1-17.9 40-40 40l-48 0c-22.1 0-40-17.9-40-40l0-48c0-22.1 17.9-40 40-40z"
            />
          </svg>
        </div>
        <div class="td-component-actions-container">

          <div class="delete-component-btn">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="1em"
              viewBox="0 0 384 512"
              class="delete-icon"
              preserveAspectRatio="xMinYMin meet"
            >
              <path
                class="delete-icon-path"
                d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"
              />
            </svg>
          </div>
          ${this._generateCheckbox(task)}
        </div>
      </div>
      ${this._inputMarkup(task)}
    </div>
    `;
  }

}

export const importTaskAddRenderView = (() => new TaskAddRenderView());
