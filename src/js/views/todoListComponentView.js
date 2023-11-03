import { cleanFormData, createObjectFromForm } from "../helper.js";
import todoActionsView from "./todoActionsView.js";

class TodoListComponentView {
  _data;
  _handler;
  _todoContainerSelector = ".component-container--box";
  _parentElementContainer = document.querySelector(".td-component--container");
  _parentElement = document.querySelector("#component-container");
  _renderContainer = document.querySelector(".td-render--container");
  _todoActions = todoActionsView;
  _renderContainerVisibility = false;
  _addTodoBtn;
  _initRenderFormActivated;
  _optionsBtn = document.querySelectorAll(".nudge-btn");
  _clearAndHideContainer = false;
  _eventsActivated = false;
  _mobileNavActive = false;
  _toggledBeforeAddTodoBtn = false;
  _mobileNav;
  _mobileNavEvent = false;

  addHandlerTodoAdd(handler) {
    const cls = this;
    this._handler = handler;
    window.addEventListener("load", handler());
    // window.addEventListener("load", this._handleAddTodoEvent.bind(this));
  }

  addDelegateTodoActions(
    delHandler,
    compHandler,
    dragHandler,
    saveBeforeRenderHandler,
    navHandler
  ) {
    //All nudge related actions executed from todoActionsView
    this._todoActions.addHandlerTodoActions(
      delHandler,
      compHandler,
      dragHandler,
      saveBeforeRenderHandler,
      navHandler
    );
  }

  addTodoListEventListeners() {
    const cls = this;
    const events = ["click", "mousedown"];
    events.forEach((ev) => {
      this._parentElement.addEventListener(ev, function (e) {
        e.stopPropagation();
        //drag event
        if (
          (e.type === "mousedown" &&
            e.target.classList.contains("drag-icon")) ||
          (e.type === "mousedown" &&
            e.target.classList.contains("drag-icon-path"))
        )
          cls._todoActions.actionHandler("drag", e.target);

        //delete event
        if (
          e.type === "click" &&
          e.target.classList.contains("nudge-action--delete")
        ) {

          cls._todoActions.actionHandler("delete", e.target);
        }

        //complete event
        if (
          e.type === "click" &&
          e.target.classList.contains("nudge-action--complete")
        )
          cls._todoActions.actionHandler("complete", e.target);

        //render todo on container click event
        if (
          (e.type === "click" &&
            e.target.classList.contains("component-content")) ||
          (e.type === "click" &&
            e.target.classList.contains("component-heading"))
        ) {
          cls._todoActions.actionHandler("saveAndRender", e.target);
        }
      });
    });
  }

  initAddTodoButtonListener() {
    this._handleAddTodoEvent();
  }

  //used to reset handler back to controlAddTodo if data is loaded from the db
  setAddTodoHandler(handler) {
    this._handler = handler;
  }

  setAddListenerEventState(value) {
    this._eventsActivated = value;
  }

  setMobileNavActiveState(value) {
    this._mobileNavActive = value;
  }

  setClearAndHideContainer(value) {
    this._clearAndHideContainer = value;
  }

  getinitRenderFormActiveState() {
    return this._initRenderFormActivated;
  }

  getMobileNavActiveState() {
    return this._mobileNavActive;
  }

  getClearAndHideContainer() {
    return this._clearAndHideContainer;
  }

  getAddListenerEventState() {
    return this._eventsActivated;
  }

  mobileRender(todos = undefined) {
    const cls = this;
    let mobileNav;

    if (!this._mobileNavActive) {
      //toggle container holding todoListView
      this._parentElementContainer.classList.toggle("hidden");

      //mobile nav to move between views
      if (!this._mobileNav) {
        mobileNav = document.querySelector(".navbar-back--btn");
      }
      //set mobile nav to global class el
      this._mobileNav = mobileNav ?? this._mobileNav;

      //toggle mobile nav
      this._mobileNav.classList.toggle("hidden");

      //set the mobile navigation as active so the current block of code doesn't get run again
      this._mobileNavActive = true;

      //only run if no current events for the nav
      if (!this._mobileNavEvent) {
        //add mobile nav Event Listener
        this._mobileNav.addEventListener("click", function (e) {
          //set event as active
          cls._mobileNavEvent = true;

          //set mobile nav active state to false so it can run blocks of code not related to the event listener
          cls._mobileNavActive = false;

          //offload to control to switch nav
          cls._todoActions.actionHandler("switchNav");
        });
      }
    }

    //render todos on todoList
    if (todos) {
      this.render(todos);
    }

    //if no todo clear todo container to display other container and display mobile nav button
    if (this._clearAndHideContainer) {

      //set the clear and hide state back to false
      this._clearAndHideContainer = false;

      //clear the todo list
      this._parentElement.innerHTML = "";

      //hide the todo list parent container
      this._parentElementContainer.classList.toggle("hidden");

      //rendeer the nav button when the container is cleared
      this._mobileNav.classList.toggle("hidden");
    }
  }

  _handleAddTodoEvent() {
    const cls = this;
    this._addTodoBtn = document.querySelector(".td-render-todo--add-btn");
    this._addTodoBtn.addEventListener(
      "click",
      cls._renderAddTodoForm.bind(cls)
    );
  }

  _renderAddTodoForm() {
    debugger;
    //notify Controller that the form logic has been triggered
    this._initRenderFormActivated = true;

    //clear previous task input if any
    const renderContainerTitleInput =
      document.querySelector(".td-render-title");
    const renderContainerTaskContent = document.querySelector(
      ".td-render-component-container-content"
    );
    const renderContainerCompletedTaskContent = document.querySelector(
      ".completed-td-component-content"
    );

    renderContainerTitleInput.textContent = "";
    renderContainerTaskContent.innerHTML =
      renderContainerCompletedTaskContent.innerHTML = "";

    //only toggle container on page load
    if (!this._renderContainerVisibility) {
      this.toggleRenderDisplay();
      this._renderContainerVisibility = true;
    }

    if (this._toggledBeforeAddTodoBtn) {
      this.toggleRenderDisplay();
      this._toggledBeforeAddTodoBtn = false;
    }
    //run controller controlAddTodo function and pass in the renderContainer
    const renderContentNode = document.querySelector(".td-render--content")
    this._handler(renderContentNode);
  }

  toggleRenderDisplay(toggledBeforeAddTodoBtn = false) {
    this._renderContainer.classList.toggle("hidden");

    //if the container is toggled before the add todo button meant to trigger it, set it to true
    if (toggledBeforeAddTodoBtn) this._toggledBeforeAddTodoBtn = true;
  }

  _formatEditDate(dateTimestamp) {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const weekdays = ["Mon", "Tue", "Wed", "Thur", "Fri", "Sat", "Sun"];
    const convertToDate = new Date(dateTimestamp);

    const [weekday, month, day] = [
      weekdays[convertToDate.getDay()],
      months[convertToDate.getMonth()],
      convertToDate.getDate(),
    ];

    return `Edited ${weekday}, ${month} ${day}.`;
  }

  clearTodoContainer() {
    this._parentElement.innerHTML = "";
  }

  render(todos) {
    this._generateMarkup(todos);
  }

  getUIState() {
    const todoContainers = document.querySelectorAll(
      this._todoContainerSelector
    );
    const contentEls = Array.from(todoContainers);
    const updatedIndex = contentEls.map((el, i) => [el.dataset.id, i]);
    return updatedIndex;
  }

  _generateMarkup(todos) {
    if (todos) {
      const markup = todos
        .map((todo) => this._generateMarkupPreview(todo))
        .join("");

      this._parentElement.innerHTML = "";
      this._parentElement.insertAdjacentHTML("afterbegin", markup);
    }
  }

  _generateMarkupPreview(todo) {
    return `
        <div class="component-container--box" data-id="${todo.todoId}">
            <span class="nudge-btn">
              <svg
              xmlns="http://www.w3.org/2000/svg"
              height="1em"
              viewBox="0 0 128 512"
              class="nudge-icon">
                <path
                  class="nudge-icon-path"
                  d="M64 360a56 56 0 1 0 0 112 56 56 0 1 0 0-112zm0-160a56 56 0 1 0 0 112 56 56 0 1 0 0-112zM120 96A56 56 0 1 0 8 96a56 56 0 1 0 112 0z"
                />
              </svg>
              <div class="nudge-action--bar">
                <div class="nudge-action--container">
                  <ul class="nudge-actions">
                    <!-- <li class="nudge-action--btn">Edit</li> -->
                    <li class="nudge-action--btn nudge-action--delete">Delete</li>
                    <li class="nudge-action--btn nudge-action--complete">${todo.completed ? "Unmark Complete" : "Mark Complete"
      }</li>
                  </ul>
                </div>
              </div>
            </span>
            
            <div class="component-header">
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
              <h3 class="component-heading">${this._formatTodoHeadingBasedOnCompletion(todo)}</h3>
            </div>
            <div class="component-content-container">
              <ul>
                ${todo.tasks
        .slice(0, 3)
        .map((task) => this._generateComponentContentMarkup(task))
        .join("")}

              </ul>
              <p class="component-editted-bar">${this._formatEditDate(
          todo.lastAdded
        )}</p>
            </div>
        </div>
    `;
  }

  _formatTodoHeadingBasedOnCompletion(todo) {
    const todoTitle = todo.title
      .slice(0, 10)
      .padEnd(13, ".")

    return todo.completed ? `<s>${todoTitle}</s>` : todoTitle
  }

  _generateComponentContentMarkup(task) {
    return `
      <div class="component-content">
        <input type="checkbox" class="td-complete" />

        <label for="td-complete">${task?.completed ? `<s>${task.task.slice(0, 15).padEnd(18, ".")}</s>`
        : task?.task ? task.task.slice(0, 15).padEnd(18, ".") : ""} 
      </label>
      </div>
    `;
  }
}

export const importTodoListComponentView = (() => new TodoListComponentView());
