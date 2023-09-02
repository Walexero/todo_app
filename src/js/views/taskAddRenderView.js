import taskActionsView from "./taskActionsView.js";
import { cleanFormData, createObjectFromForm } from "../helper.js";
import { MAX_LENGTH_INPUT_TEXT_WITHOUT_SPACE } from "../config.js";

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
  _labelContainerSelector = ".td-label-container";
  _form = document.querySelector("#addTaskForm");
  _taskActionsActive = false;
  _taskActions = taskActionsView;
  _taskEditHandler;
  _editingTask = { editing: false };
  _inputRendered = false;

  addHandlerTaskAdd(handler) {
    const cls = this;
    this._handler = handler;
    this._handleFormEvents();
  }

  addDelegateTaskActions(delHandler, compHandler, editHandler, dragHandler) {
    //edit handler only works from render view
    this._taskEditHandler = editHandler;

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

  getTaskActionState() {
    return this._taskActionsActive;
  }

  getUIState() {
    // console.log(this._labelContainerSelector);
    const labelContainers = document.querySelectorAll(
      this._labelContainerSelector
    );

    const contentEls = Array.from(labelContainers);
    const updatedIndex = contentEls.map((el, i) => [el.dataset.id, i]);
    return updatedIndex;
  }

  mobileRender(todo = undefined) {
    console.log("rendering task cont mobile");
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
    console.log(this._renderContainer);
    this._renderContainer.classList.toggle("mobile-nav--hidden");
    console.log(this._renderContainer);
  }

  _handleAddTaskEvent() {
    const cls = this;
    cls._handleFormEvents;
  }

  _handleFormEvents() {
    const cls = this;
    //listen for form submit and prevent event
    this._form.addEventListener("submit", function (e) {
      e.preventDefault();
      return;
    });

    //listen for event delegation events
    const events = ["click", "keydown", "mousedown"];
    events.forEach((ev) => {
      document
        .querySelector(".td-render--content")
        .addEventListener(ev, function (e) {
          //Input render event
          if (
            e.target === cls._addTaskFormbtn ||
            e.target.parentElement === cls._addTaskFormbtn
          ) {
            if (!cls._inputRendered) cls._renderInput();
          }

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
            e.target.classList.contains("delete-component-btn") ||
            e.target.classList.contains("delete-icon") ||
            e.target.classList.contains("delete-icon-path")
          ) {
            const taskToDelete = e.target.closest(".delete-component-btn");
            cls._taskActions.actionHandler("delete", taskToDelete);
          }

          //complete event
          if (e.target.classList.contains("td-complete"))
            cls._taskActions.actionHandler("complete", e.target);

          //edit event
          if (
            e.target.classList.contains("td-label-container") ||
            e.target.classList.contains("td-label")
          ) {
            //if there's current edit prevent another edit
            if (cls._editingTask.editing) return;
            //if no current edit allow edit
            else cls._handleTaskEdit(e);
          }

          //Submit Event
          if (e.key === "Enter") cls._handlerAddTask();
        });
    });
  }

  _handleTaskEdit(e) {
    //get task container to a add edit classList to
    const taskToEditContainer = e.target.closest(".td-component-content");
    taskToEditContainer.classList.add("input-container");

    //get the container containing the task to edit
    const taskToEdit = e.target.closest(".td-label-container");

    //get the content from the task to edit and clear it
    const taskToEditLabelContainerContent = taskToEdit.textContent.trim();
    taskToEdit.innerHTML = "";

    //render input and its previous content on task to edit container
    const inputFormAndValue = this._inputMarkup(
      taskToEditLabelContainerContent
    );
    taskToEdit.insertAdjacentHTML("afterbegin", inputFormAndValue);

    //keep state of the current task being editted
    this._editingTask.editing = true;
    this._editingTask.id = taskToEdit.dataset.id;
  }

  _updateUI(markup = undefined, completedMarkup = undefined, title) {
    console.log("the title", title);
    //clear container
    this._renderComponentContainerContent.innerHTML =
      this._renderCompletedContainer.innerHTML =
      this._renderTitleInput.value =
        "";
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
      this._renderTitleInput.value = title;
    }
  }

  clearTaskContainer() {
    this._updateUI(null); //set the title to null, only clears container
  }

  render(todo = undefined) {
    console.log("about rendering");
    //generate UI markupg
    let markup, completedMarkup;

    //render tasks markup only if tasks exist
    if (todo && todo.tasks) {
      markup = todo.tasks
        .map((task) => {
          if (!task.completed) return this._generateTaskMarkup(task);
        })
        .join("");

      completedMarkup = todo.tasks
        .map((task) => {
          if (task.completed) return this._generateTaskMarkup(task);
        })
        .join("");
    }

    //update UI
    if (todo) this._updateUI(markup, completedMarkup, todo.title);
  }

  _renderInput() {
    const markup = this._generateInputMarkup();
    this._renderComponentContainerContent.insertAdjacentHTML(
      "afterbegin",
      markup
    );
    this._inputRendered = true;
  }

  _renderAddedTask(task) {
    //remove input container
    document.querySelector(".input-container").remove();

    //add task
    const markup = this._generateTaskMarkup(task);
    this._renderComponentContainerContent.insertAdjacentHTML(
      "afterbegin",
      markup
    );
  }

  _handlerAddTask() {
    const formData = Object.fromEntries([...new FormData(this._form)]);

    //Allow input to add task to be rendered again
    if (this._inputRendered) this._inputRendered = false;

    //Guard clause for empty form submission
    if (!Object.values(formData).at(0) && !Object.values(formData).at(1))
      return;

    //Guard clause against inputs without spaces
    console.log(Object.values(formData).at(1));
    if (
      Object.values(formData).at(1) &&
      !Object.values(formData).at(1).includes(" ") &&
      Object.values(formData).at(1).length > MAX_LENGTH_INPUT_TEXT_WITHOUT_SPACE
    )
      return alert(
        "Task values must include spaces. A maximum of 25 character is allowed without spaces"
      );

    //check if a current task is being editted to determine type of form submission
    if (this._editingTask.editing) {
      this._taskEditHandler(this._editingTask.id, formData);
      this._editingTask = { editing: false };
    } else this._handler(formData);

    //return data to controller
  }

  getTaskBody(currentTask, formData) {
    //create task obj and task id from current task length + 1
    console.log("the formdata", formData);
    const currentTaskLengthOrID = currentTask?.tasks?.length ?? 1;
    const taskObj = createObjectFromForm(
      currentTask.id + (currentTaskLengthOrID + 1),
      formData
    );

    return taskObj;
  }

  _inputMarkup(value = undefined) {
    return `
      <textarea name="form-task-td" class="form-task-td" cols="25" rows="3" wrap="soft">${
        value ?? ""
      }</textarea>
    `;
  }

  _generateInputMarkup() {
    return `
    <div class="td-component-content input-container">
        <div class="td-component-actions">
          <div class="draggable-component-btn">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="1em"
              viewBox="0 0 320 512"
              class="drag-icon"
            >
              <!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. -->
              <path
                d="M40 352l48 0c22.1 0 40 17.9 40 40l0 48c0 22.1-17.9 40-40 40l-48 0c-22.1 0-40-17.9-40-40l0-48c0-22.1 17.9-40 40-40zm192 0l48 0c22.1 0 40 17.9 40 40l0 48c0 22.1-17.9 40-40 40l-48 0c-22.1 0-40-17.9-40-40l0-48c0-22.1 17.9-40 40-40zM40 320c-22.1 0-40-17.9-40-40l0-48c0-22.1 17.9-40 40-40l48 0c22.1 0 40 17.9 40 40l0 48c0 22.1-17.9 40-40 40l-48 0zM232 192l48 0c22.1 0 40 17.9 40 40l0 48c0 22.1-17.9 40-40 40l-48 0c-22.1 0-40-17.9-40-40l0-48c0-22.1 17.9-40 40-40zM40 160c-22.1 0-40-17.9-40-40L0 72C0 49.9 17.9 32 40 32l48 0c22.1 0 40 17.9 40 40l0 48c0 22.1-17.9 40-40 40l-48 0zM232 32l48 0c22.1 0 40 17.9 40 40l0 48c0 22.1-17.9 40-40 40l-48 0c-22.1 0-40-17.9-40-40l0-48c0-22.1 17.9-40 40-40z"
              />
            </svg>
          </div>
          <input type="checkbox" id="td-complete" />
        </div>
        ${this._inputMarkup()}
    </div>
    `;
  }

  _generateTaskMarkup(task) {
    return `
    <div class="td-component-content">
      <div class="td-component-actions">
        <div class="draggable-component-btn">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="1em"
            viewBox="0 0 320 512"
            class="drag-icon"
          >
            <!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. -->
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
              <!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. -->
              <path
                class="delete-icon-path"
                d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"
              />
            </svg>
          </div>
          <input type="checkbox" id="td-complete" class="td-complete"/>
        </div>
      </div>
      <div class="td-label-container" data-id="${task.taskID}">
        <label class="td-label" for="td-complete">${task.task}</label>
      </div>
    </div>
    `;
  }
}

export default new TaskAddRenderView();
