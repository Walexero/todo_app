import * as model from "./model.js";
import { importTodoListComponentView } from "./views/todoListComponentView.js";
import { importTaskAddRenderView } from "./views/taskAddRenderView.js";
import { MOBILE_MAX_SCREEN_SIZE, CANNOT_UPDATE_COMPLETED_TASK } from "./config.js";
import Login from "./loginViews/login.js";
import { Loader } from "./components/loader.js";
import { TodoTemplate } from "./templates/todoTemplate.js";
import { LoginTemplate } from "./templates/loginTemplate.js";
import { DEFAULT_LOGIN_PAGE_TIMEOUT } from "./config.js";
import { API } from "./api.js";

//make the modules a variable before init
let todoListComponentView;
let taskAddRenderView;

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

const controlLogin = function (loginComponentCallBack, token) {
  const loader = new Loader(DEFAULT_LOGIN_PAGE_TIMEOUT)
  loader.component()

  //set model token
  model.token.value = token.token
  model.persistToken()

  //remove auth components
  loginComponentCallBack()

  //switch template
  init();
  loader.remove()
}

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

const controlAddTodoIdToRenderContainer = function (renderContainer, todo) {
  //add created todoId to the render container
  renderContainer.setAttribute("data-id", todo.id)
  model.APIAddTodoOrTask(todo, "todo")
}

const controlAddTodo = function (currentTodoContainer = undefined) {
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

  //query API to create new Todo
  if (addTodoBtnClicked)
    controlCreateNewTodo(null, true, currentTodoContainer)

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

const controlUpdateTodoTitle = function (todoId, title) {
  const queryObj = {
    endpoint: API.APIEnum.TODO.PATCH(todoId),
    token: model.token.value,
    sec: null,
    actionType: "updateTodo",
    queryData: { title: title },
    spinner: false,
    alert: false,
    type: "PATCH",
    callBack: model.updateTodoTitle
  }
  API.queryAPI(queryObj)
}

const controlCallBackAddTaskToTodo = function (callerCurrentTodo, taskObj, type) {
  //callerCurrentTodo is the currentTodo variable in the controlAddTask 
  callerCurrentTodo = model.APIAddTodoOrTask(taskObj, type)
}

const controlAddTaskToExistingTodo = function (task, callerCurrentTodo) {
  //adds a task to the an existing todo and returns the todo
  debugger;
  const currentTodo = model.getCurrentTodo(task.todoId);

  //check if todo Title has changed and update
  if (currentTodo.title !== task.todoTitle) controlUpdateTodoTitle(task.todoId, task.todoTitle)

  const queryObj = {
    endpoint: API.APIEnum.TASK.CREATE,
    token: model.token.value,
    sec: null,
    actionType: "createTask",
    queryData: { task: task.task, todo_id: task.todoId, completed: task.completed },
    callBack: controlCallBackAddTaskToTodo.bind(null, callerCurrentTodo),
    spinner: false,
    alert: false,
    type: "POST",
    callBackParam: "task"
  }
  API.queryAPI(queryObj)


  // const createTask = API.
  // const currentTask = model.getCurrentTodo();

  // const todo = taskAddRenderView.getTaskBody(currentTask, task);

  // return model.addTodoOrTask(currentTask.id, todo, task);
};

const controlCreateNewTodo = function (task, api = false, currentTodoContainer = undefined) {
  if (api) {

    const queryObj = {
      endpoint: API.APIEnum.TODO.CREATE,
      token: model.token.value,
      sec: null,
      actionType: "createTodo",
      queryData: { "title": "" },
      callBack: controlAddTodoIdToRenderContainer.bind(null, currentTodoContainer),
      spinner: false,
      alert: false,
      type: "POST"
    }
    API.queryAPI(queryObj)
  }
  if (!api) {
    //create a new todo and return it
    const { currentTask, todo } = todoListComponentView.getTodoAndTaskBody(task);
    return model.addTodoOrTask(currentTask, todo);
  }

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
  debugger;
  let currentTodo;

  //add task handlers if they dont exist yet
  const taskActionsActive = taskAddRenderView.getTaskActionState();
  if (!taskActionsActive) controlAddTaskEventHandlers();

  const currentTodoExists = model.state.currentTodo;

  //add a task
  if (currentTodoExists) controlAddTaskToExistingTodo(task, currentTodo);

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

  if (!model.token.value) {
    document.body.innerHTML = LoginTemplate.template()
    Login.addEventListeners(controlLogin);
  }


  if (model.token.value) {
    document.body.innerHTML = TodoTemplate.template()

    //initialize the components so it only gets loaded after its template is present
    todoListComponentView = importTodoListComponentView()
    taskAddRenderView = importTaskAddRenderView()

    todoListComponentView.addHandlerTodoAdd(controlTodoDataLoad);
    taskAddRenderView.addHandlerTaskAdd(controlAddTask);
  }

};
init();
