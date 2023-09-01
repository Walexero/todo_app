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
    window.addEventListener("load",handler())
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
    console.log("addeed event listeners")
    const cls = this;
    const events = ["click", "mousedown"];
    events.forEach((ev) => {
      this._parentElement.addEventListener(ev, function (e) {
        console.log(e.target);
        //drag event
        if (
          (e.type === "mousedown" &&
            e.target.classList.contains("drag-icon")) ||
          e.target.classList.contains("drag-icon-path")
        )
          cls._todoActions.actionHandler("drag", e.target);

        //delete event
        if (
          e.type === "click" &&
          e.target.classList.contains("nudge-action--delete")
        ) {
          console.log("delete...");

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
          e.target.classList.contains("component-heading")
        ) {
          cls._todoActions.actionHandler("saveAndRender", e.target);
        }
      });
    });
  }

  initAddTodoButtonListener(){
    this._handleAddTodoEvent()
  }

  //used to reset handler back to controlAddTodo if data is loaded from the db
  setAddTodoHandler(handler){
    this._handler = handler
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

  getinitRenderFormActiveState(){
    return this._initRenderFormActivated
  }

  getMobileNavActiveState() {
    return this._mobileNavActive;
  }

  // getClearAndHideContainer

  getAddListenerEventState() {
    return this._eventsActivated;
  }

  mobileRender(todos = undefined) {
    const cls = this;
    let mobileNav;
    console.log("ran todolist mobile render");
    console.log("mobile nav active", this._mobileNavActive);
    if (!this._mobileNavActive) {
      console.log("entered in here");
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
          console.log("detected navigation click setting back to default");

          //set mobile nav active state to false so it can run blocks of code not related to the event listener
          cls._mobileNavActive = false;

          //offload to control to switch nav
          cls._todoActions.actionHandler("switchNav");
        });
      }
    }

    //render todos on todoList
    if (todos) {
      //set the parentElement back to visible
      // cls._parentElementContainer.classList.toggle("hidden");
      this.render(todos);
    }

    //if no todo clear todo container to display other container and display mobile nav button
    if (this._clearAndHideContainer) {
      //set the clear and hide state back to false
      this._clearAndHideContainer = false;
      //clear the todo list
      this._parentElement.innerHTML = "";

      //hide the todo list parent container
      console.log("cleared containeer");
      // console.log(this._parentElementContainer);
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

    renderContainerTitleInput.value = "";
    renderContainerTaskContent.innerHTML =
      renderContainerCompletedTaskContent.innerHTML = "";

    //only toggle container on page load
    if (!this._renderContainerVisibility) {
      this.toggleRenderDisplay();
      this._renderContainerVisibility = true;
    }

    //run controller controlAddTodo function
    if(this._toggledBeforeAddTodoBtn){
      console.log("ran logic")
      this.toggleRenderDisplay()
      this._toggledBeforeAddTodoBtn = false;
    }
    this._handler();
  }

  toggleRenderDisplay(toggledBeforeAddTodoBtn = false) {
    console.log("rendeerin");
    this._renderContainer.classList.toggle("hidden");

    //if the container is toggled before the add todo button meant to trigger it, set it to true
    if(toggledBeforeAddTodoBtn) this._toggledBeforeAddTodoBtn = true;
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

  render(todos) {
    if (todos && todos.length < 1) {
      //hide renderContainer
      this.toggleRenderDisplay();
    }
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

  getTodoAndTaskBody(formData) {
    const curDate = Number(Date.now());

    //create new task and todo
    const taskObj = createObjectFromForm(curDate, formData, true);
    const todoAndTaskObj = this._createNewTodo(curDate, formData, taskObj);

    return { currentTask: curDate, todo: todoAndTaskObj };
  }

  _createNewTodo(id, formData, task) {
    //get cleaned form data
    formData = cleanFormData(formData);
    const newTaskObj = {
      id: id,
      title: formData["title"],
      tasks: [],
      lastAdded: id,
      completed: false,
    };

    //if no tasks and only title, create a todo with the title but no tasks
    if (!formData["task"]) return newTaskObj;
    //if there's tasks create the todo with task
    if (formData["task"]) newTaskObj.tasks.push(task);

    return newTaskObj;
  }

  _generateMarkup(todos) {
    if (todos) {
      const markup = todos
        .map((todo) => this._generateMarkupPreview(todo))
        .join("");

      this._parentElement.innerHTML = "";
      this._parentElement.insertAdjacentHTML("afterbegin", markup);
    } else this._parentElement.innerHTML = "";
  }

  _generateMarkupPreview(todo) {
    return `
        <div class="component-container--box" data-id="${todo.id}">
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
                    <li class="nudge-action--btn nudge-action--complete">${
                      todo.completed ? "Unmark Complete" : "Mark Complete"
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
              <h3 class="component-heading">${todo.title
                .slice(0, 10)
                .padEnd(13, ".")}</h3>
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

  _generateComponentContentMarkup(task) {
    return `
      <div class="component-content">
        <input type="checkbox" id="td-complete" />

        <label for="td-complete">${
          task.task.startsWith("<s>")
            ? `<s>${task.task
                .replace("<s>", "")
                .replace("</s>", "")
                .slice(0, 15)
                .padEnd(18, ".")}</s>`
            : task.task.slice(0, 15).padEnd(18, ".")
        }</label>
      </div>
    `;
  }
}

export default new TodoListComponentView();
