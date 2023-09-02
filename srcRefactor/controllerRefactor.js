import * as model from "./modelRefactor.js";
import dragComponentListView from "./views/dragComponentListView.js";
import taskAddRenderView from "./views/taskAddRenderView.js";
import todoListComponentView from "./views/todoListComponentView.js";
import { MOBILE_MAX_SCREEN_SIZE } from "./config.js";

//Every data and statee change most be handleed by controller
let deleteHandler,
  completeHandler,
  editHandler,
  dragSyncHandler,
  todoDeleteHandler,
  todoCompleteHandler,
  todoListDragSyncHandler,
  saveBeforeRenderHandler;

//NOTE: replace storageData with LoadedFromDb

//distinguish mobile render from other screensize
const mobileDeviceTrigger = window.matchMedia(MOBILE_MAX_SCREEN_SIZE);

const controlNavSwitchMobile = function () {
  // console.log("controlling navigation switch");
  // taskAddRenderView.mobileRender();
  // todoListComponentView.mobileRender(model.state.todo);
  //On nav switch reload app back to initial state
  // if(model.state.todo.length === 0) window.location.reload()
};

const controlAddTodoEventHandlers = function () {
  todoListComponentView.addDelegateTodoActions(
    todoDeleteHandler,
    todoCompleteHandler,
    todoListDragSyncHandler,
    saveBeforeRenderHandler,
    controlNavSwitchMobile
  );
};

const controlAddTaskEventHandlers = function () {
  taskAddRenderView.addDelegateTaskActions(
    deleteHandler,
    completeHandler,
    editHandler,
    dragSyncHandler
  );

  //notify class that task handlers are added
  taskAddRenderView.setTaskActionState(true);
};

const controlAddAndSetTodoEventListeners = function () {
  todoListComponentView.addTodoListEventListeners();
  todoListComponentView.setAddListenerEventState(true);
};

const controlSwitchTodoHandler = function () {
  //switches handler from controlTodoDataLoad to controlAddTodo after the data has been loaded
  console.log("added eevents listcomponent");
  todoListComponentView.setAddTodoHandler(controlAddTodo);
  todoListComponentView.initAddTodoButtonListener();
};

const controlAddTodo = function () {
  console.log("inited ran func");

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
    controlAddTodoMobile();
  }
};

const controlTodoDataLoad = function () {
  //runs on page load
  const todoExists = model.state.todo.length > 0;
  if (todoExists) {
    todoListComponentView.render(model.state.todo);
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
  currentTodo = model.addTodoOrTask(currentTask, todo);
};

const controlUpdateTodoAndTaskView = function (currentTodo) {
  //update UI
  taskAddRenderView.render(currentTodo);
  //update todo component with state object
  todoListComponentView.render(model.state.todo);
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

const controlDeleteTask = () => {};
const controlCompleteTask = () => {};
const controlEditTask = () => {};
const controlSyncDragStateWithModel = () => {};

const controlTodoDelete = () => {};
const controlTodoComplete = () => {};
const controlSyncTodoListDragStateWithModel = () => {};
const controlRenderTodoAndSaveCurrentTodo = () => {};

const init = function () {
  //tasks handlers
  [deleteHandler, completeHandler, editHandler, dragSyncHandler] = [
    controlDeleteTask,
    controlCompleteTask,
    controlEditTask,
    controlSyncDragStateWithModel,
  ];

  //todo handlers
  [
    todoDeleteHandler,
    todoCompleteHandler,
    todoListDragSyncHandler,
    saveBeforeRenderHandler,
  ] = [
    controlTodoDelete,
    controlTodoComplete,
    controlSyncTodoListDragStateWithModel,
    controlRenderTodoAndSaveCurrentTodo,
  ];

  todoListComponentView.addHandlerTodoAdd(controlTodoDataLoad);

  // todoListComponentView.addHandlerTodoAdd(controlAddTodo);
  taskAddRenderView.addHandlerTaskAdd(controlAddTask);
};
init();
