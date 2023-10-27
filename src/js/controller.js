import * as model from "./model.js";
import taskAddRenderView from "./views/taskAddRenderView.js";
import todoListComponentView from "./views/todoListComponentView.js";
import { MOBILE_MAX_SCREEN_SIZE } from "./config.js";
import { CANNOT_UPDATE_COMPLETED_TASK } from "./views/alerts.js";
import Login from "./loginViews/login.js";

//distinguish mobile render from other screensize
const mobileDeviceTrigger = window.matchMedia(MOBILE_MAX_SCREEN_SIZE);

const switchMobileView = function () {
  taskAddRenderView.mobileRender();
  todoListComponentView.mobileRender(model.state.todo);
};

const controlNavSwitchMobile = function () {
  switchMobileView();
  if (model.state.todo.length === 0) window.location.reload();
};

const controlUpdateTodoAndTaskView = function (currentTodo = undefined) {
  //update UI
  if (currentTodo) taskAddRenderView.render(currentTodo);
  if (!currentTodo) taskAddRenderView.clearTaskContainer(); //clears the task view container

  //update todo component with state object
  todoListComponentView.render(model.state.todo);
};

const controlDeleteTask = function (taskID) {
  //delete task and return the todo
  const updatedTodo = model.deleteTask(taskID);
  //update todo and task view
  controlUpdateTodoAndTaskView(updatedTodo);
};

const controlCompleteTask = function (taskID) {
  //mark task as complete
  const updatedTodo = model.completeTask(taskID);
  //update todo and task view
  controlUpdateTodoAndTaskView(updatedTodo);
};

const controlEditTask = function (taskID, taskData) {
  //update the taskvalue in the model
  const { currentTodo: updatedTask, completedTask } = model.editTask(
    taskID,
    taskData
  );
  if (completedTask) alert(CANNOT_UPDATE_COMPLETED_TASK);

  //update todo and task view
  controlUpdateTodoAndTaskView(updatedTask);
};

const controlSyncTaskUIState = function (currentTask = undefined) {

  //get content drag position
  const updatedTodo = controlUpdateTaskUIState(currentTask);
  controlUpdateTodoAndTaskView(updatedTodo);
};

const controlAddTaskEventHandlers = function () {
  taskAddRenderView.addDelegateTaskActions(
    controlDeleteTask,
    controlCompleteTask,
    controlEditTask,
    controlSyncTaskUIState
  );

  //notify class that task handlers are added
  taskAddRenderView.setTaskActionState(true);
};

const controlSyncTodoUIState = function (currentTodo = undefined) {
  const todoUIState = todoListComponentView.getUIState();
  const updatedTodo = model.updateTodoIndex(todoUIState);

  //render todos
  todoListComponentView.render(updatedTodo);
};

const controlAddTodoMobileView = function (renderTasks = undefined) {
  const todoExists = model.state.todo.length > 0;
  if (todoExists) todoListComponentView.setMobileNavActiveState(false);

  if (renderTasks) {
    taskAddRenderView.mobileRender(renderTasks);

    taskAddRenderView.toggleContainer();
  }

  if (!renderTasks) {
    //when the add todo gets clicked run this
    const addTodoBtnClicked =
      todoListComponentView.getinitRenderFormActiveState();

    const todoViewCleared = todoListComponentView.getClearAndHideContainer();

    if (addTodoBtnClicked) {
      //runs this to render the task view
      const mobileNavOnPage = todoListComponentView.getMobileNavActiveState();

      !mobileNavOnPage && todoListComponentView.mobileRender();

      taskAddRenderView.toggleContainer();
    }

    if (todoViewCleared) todoListComponentView.mobileRender(); //runs this if all todo is deleted
  }
};

const controlTodoDelete = function (todoID) {
  //delete and return the remaining todo
  const deletedCurrentTodo = model.deleteTodo(Number(todoID));

  const todoExists = model.state.todo.length > 0;

  //check if there's still todos left
  if (todoExists) deletedCurrentTodo && controlUpdateTodoAndTaskView();

  if (!todoExists) {
    model.state.currentTodo = null;
    //runs if not mobile
    if (!mobileDeviceTrigger.matches) ResetTodoAndTaskView();

    if (mobileDeviceTrigger.matches) {
      //clear the todoList container
      todoListComponentView.setClearAndHideContainer(true);
      //clear and add form to create new todo
      controlAddTodoMobileView();
    }
  }
};

const controlTodoComplete = function (todoID) {
  //complete a todo
  const todo = model.completeTodo(Number(todoID));
  //render todo
  todoListComponentView.render(model.state.todo);
};

const controlRenderTodo = function (newCurrentTodo, mobileView = false) {
  const addTodoBtnClicked =
    todoListComponentView.getinitRenderFormActiveState();

  if (!addTodoBtnClicked && model.state.loadedFromDb) {
    //the first time this is triggereed, it invalidates the logic
    todoListComponentView.toggleRenderDisplay(true);
    model.state.loadedFromDb = false;

    //listen for task related events
    const taskActionsActive = taskAddRenderView.getTaskActionState();
    if (!taskActionsActive) controlAddTaskEventHandlers();
  }

  if (!mobileView) taskAddRenderView.render(newCurrentTodo);

  if (mobileView) {
    //display the render container
    controlAddTodoMobileView(newCurrentTodo);

    //hide the todoview and add the mobilenav
    todoListComponentView.mobileRender();
  }
};

const controlRenderClickedTodo = function (todoID) {
  //renders the clicked todo and saves the current state for the previous rendered todo

  if (!mobileDeviceTrigger.matches) {
    if (model.state.currentTodo) {
      //get UI state for currentTodo and save UI statee
      const currentTodoData = model.getCurrentTodo();
      currentTodoData.tasks.length > 0 && controlUpdateTaskUIState();
    }
  }

  //reset currentTodo and get its data
  model.state.currentTodo = Number(todoID);
  const currentTodo = model.getCurrentTodo();

  //render for mobile
  if (mobileDeviceTrigger.matches) {
    // controlAddTodoMobileView(currentTodo);
    controlRenderTodo(currentTodo, true);
  } else controlRenderTodo(currentTodo);
};

const controlAddTodoEventHandlers = function () {
  todoListComponentView.addDelegateTodoActions(
    controlTodoDelete,
    controlTodoComplete,
    controlSyncTodoUIState,
    controlRenderClickedTodo,
    controlNavSwitchMobile
  );
};

const controlAddAndSetTodoEventListeners = function () {
  todoListComponentView.addTodoListEventListeners();
  todoListComponentView.setAddListenerEventState(true);
};

const controlAddTodo = function () {

  //add eventlisteners for todo if not added
  const eventListenersOnTodoView =
    todoListComponentView.getAddListenerEventState();

  if (!eventListenersOnTodoView) controlAddTodoEventHandlers();

  //switch handlers for todo
  const addTodoBtnClicked =
    todoListComponentView.getinitRenderFormActiveState();
  if (!addTodoBtnClicked) controlSwitchTodoHandler();

  //remove currentTodo from model
  model.state.currentTodo = null;

  if (mobileDeviceTrigger.matches) {
    // todoListComponentView.setClearAndHideContainer(true);
    controlAddTodoMobileView();
  }
};

const controlSwitchTodoHandler = function () {
  //switches handler from controlTodoDataLoad to controlAddTodo after the data has been loaded
  todoListComponentView.setAddTodoHandler(controlAddTodo);
  todoListComponentView.initAddTodoButtonListener();
};

const controlTodoDataLoad = function () {
  //runs on page load
  const todoExists = model.state.todo.length > 0;
  if (todoExists) {
    todoListComponentView.render(model.state.todo);
    controlAddTodoEventHandlers();
    controlAddAndSetTodoEventListeners();
    controlAddTodo();
  }

  if (!todoExists)
    //call controlAddTodo and handle form events
    controlAddTodo();
};

const controlAddTaskToExistingTodo = function (task) {
  //adds a task to the an existing todo and returns the todo
  const currentTask = model.getCurrentTodo();

  const todo = taskAddRenderView.getTaskBody(currentTask, task);

  return model.addTodoOrTask(currentTask.id, todo, task);
};

const controlCreateNewTodo = function (task) {
  //create a new todo and return it
  const { currentTask, todo } = todoListComponentView.getTodoAndTaskBody(task);
  return model.addTodoOrTask(currentTask, todo);
};

const controlUpdateTaskUIState = function (currentTask = undefined) {
  const taskUIState = taskAddRenderView.getUIState();

  const updatedTodo = model.updateTaskIndex(taskUIState, currentTask);
  return updatedTodo;
};

const ResetTodoAndTaskView = function () {
  taskAddRenderView.clearTaskContainer(); //clears the task render container
  todoListComponentView.clearTodoContainer(); //should hide the todolist container
};

const controlAddTaskMobileView = function (todoOrTask) {
  taskAddRenderView.mobileRender(todoOrTask);
};

const controlAddTask = function (task) {
  let currentTodo;

  //add task handlers if they dont exist yet
  const taskActionsActive = taskAddRenderView.getTaskActionState();
  if (!taskActionsActive) controlAddTaskEventHandlers();

  const currentTodoExists = model.state.currentTodo;

  //add a task
  if (currentTodoExists) currentTodo = controlAddTaskToExistingTodo(task);

  //add a todo
  if (!currentTodoExists) currentTodo = controlCreateNewTodo(task);

  //handle render device
  if (!mobileDeviceTrigger.matches) controlUpdateTodoAndTaskView(currentTodo);
  else controlAddTaskMobileView(currentTodo);

  //add event listeners on todo view if they dont exist
  const eventListenersOnTodoView =
    todoListComponentView.getAddListenerEventState();
  if (!eventListenersOnTodoView) controlAddAndSetTodoEventListeners();
};

const init = function () {
  Login.addEventListeners();

  // todoListComponentView.addHandlerTodoAdd(controlTodoDataLoad);

  // taskAddRenderView.addHandlerTaskAdd(controlAddTask);
};
init();
