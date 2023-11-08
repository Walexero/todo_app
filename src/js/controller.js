import * as model from "./model.js";
import { importTodoListComponentView } from "./views/todoListComponentView.js";
import { importTaskAddRenderView } from "./views/taskAddRenderView.js";
import { importSyncLocalStorageToAPI } from "./syncLocalStorageToAPI.js";
import { MOBILE_MAX_SCREEN_SIZE } from "./config.js";
import Login from "./loginViews/login.js";
import { Loader } from "./components/loader.js";
import { TodoTemplate } from "./templates/todoTemplate.js";
import { LoginTemplate } from "./templates/loginTemplate.js";
import { DEFAULT_LOGIN_PAGE_TIMEOUT } from "./config.js";
import { API } from "./api.js";
import { formatAPIPayloadForUpdateReorder } from "./helper.js";
import { UpdateUserInfoComponent } from "./views/updateUserInfoComponent.js";


//make the modules a variable before init
let todoListComponentView;
let taskAddRenderView;
let syncLocalStorageToAPI;

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
  model.token.value = token
  model.persistToken()

  //remove auth components
  loginComponentCallBack()

  //switch template
  init();
  loader.remove()
}

const controlUpdateUserInfo = function (updateInfoComponentCallback, token) { }

const controlUpdateTodoAndTaskView = function (currentTodo = undefined) {
  //update UI
  if (currentTodo) taskAddRenderView.render(currentTodo);
  if (!currentTodo) taskAddRenderView.clearTaskContainer(); //clears the task view container

  //update todo component with state object
  todoListComponentView.render(model.state.todo);
};

const controlAPITaskDeleteFallback = function (taskId, todoId, apiSuccess) {

  if (!apiSuccess) {
    todoId = +todoId
    model.diffState.taskToDelete.push({ taskId, todoId })
    model.persistDiff()
    model.diffState.diffActive = true;
    syncLocalStorageToAPI.notifyUIToSyncChanges()
  }
}

const controlDeleteTask = function (taskId, todoId) {
  //delete task and return the todo
  const updatedTodo = model.deleteTask(taskId);

  const queryObj = {
    // endpoint: API.APIEnum.TASK.DELETE(taskId),
    endpoint: API.APIEnum.TASK.DELETED(taskId),

    token: model.token.value,
    sec: null,
    actionType: "deleteTask",
    queryData: { id: taskId },
    spinner: false,
    alert: false,
    type: "DELETE",
    callBack: controlAPITaskDeleteFallback.bind(null, taskId, todoId)
  }
  API.queryAPI(queryObj)


  //update todo and task view
  controlUpdateTodoAndTaskView(updatedTodo);
};

const controlAPITaskUpdateFallback = function (todoId, taskId, updateValue, apiSuccess, requestState) {
  //the requestState would only be set if the request was succeessful from the API component because the callBack params is set on the api request object for the complete request
  debugger;

  if (type === "update")
    if (requestState) model.APIAddTodoOrTask(apiSuccess)
  if (apiSuccess) {
    model.completeTask(null, taskId, completeStatus)
  }

  const completeAPIRequestFail = type === "complete" && !apiSuccess
  const updateAPIRequestFail = type === "update" && !requestState

  if (completeAPIRequestFail || updateAPIRequestFail) {
    const taskToUpdate = model.diffState.taskToUpdate

    const taskExist = taskToUpdate.findIndex(task => task.taskId === taskId)

    if (taskExist >= 0) {
      if (type === "complete")
        taskToUpdate[taskExist].completed = updateValue
      model.persistDiff()
    }

    if (taskExist < 0) {
      if (type === "complete")
        taskToUpdate.push({ taskId, completed: completeStatus, todoId })
      if (type === "update")
        taskToUpdate.push({ taskId, todoId })
      model.persistDiff()
    }
    model.diffState.diffActive = true;
    syncLocalStorageToAPI.notifyUIToSyncChanges()
  }
}

const controlCompleteTask = function (todoId, taskId, completeStatus) {
  debugger;
  const queryObj = {
    // API.APIEnum.TASK.PATCH(taskId)
    endpoint: API.APIEnum.TASK.PATCHED(taskId),
    token: model.token.value,
    sec: null,
    actionType: "updateTask",
    queryData: { completed: completeStatus },
    spinner: false,
    alert: false,
    type: "PATCH",
    callBack: controlAPITaskUpdateFallback.bind(null, todoId, taskId, completeStatus, "complete")//model.completeTask.bind(null, taskId, completeStatus)
  }
  API.queryAPI(queryObj)

  //mark task as complete
  const updatedTodo = model.completeTask(taskId, completeStatus);
  //update todo and task view
  controlUpdateTodoAndTaskView(updatedTodo);
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
    controlSyncTaskUIState
  );

  //notify class that task handlers are added
  taskAddRenderView.setTaskActionState(true);
};

const controlUpdateAPITodoOrdering = function (updatedTodo) {
  const payload = formatAPIPayloadForUpdateReorder(updatedTodo, "todos")

  const queryObj = {
    endpoint: API.APIEnum.TODO.BATCH_UPDATE,
    token: model.token.value,
    sec: null,
    actionType: "updateTodo",
    queryData: payload,
    spinner: false,
    alert: false,
    type: "PATCH",
  }
  API.queryAPI(queryObj)
}

const controlSyncTodoUIState = function (currentTodo = undefined) {
  const todoUIState = todoListComponentView.getUIState();
  const { updatedTodo, reOrdered } = model.updateTodoIndex(todoUIState);

  if (reOrdered) controlUpdateAPITodoOrdering(updatedTodo)

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

const controlAPITodoDeleteFallback = function (todoId, apiSuccess) {
  debugger;
  if (!apiSuccess) {
    const todoToDelete = model.diffState.todoToDelete;

    const todoExists = todoToDelete.findIndex(todo => todo === todoId)

    if (todoExists < 0) todoToDelete.push(todoId)
    model.persistDiff()

    model.diffState.diffActive = true;
    syncLocalStorageToAPI.notifyUIToSyncChanges()
  }
}

const controlTodoDelete = function (todoID) {
  const queryObj = {
    // API.APIEnum.TODO.DELETE(todoID),
    endpoint: API.APIEnum.TODO.DELETED(todoID),
    token: model.token.value,
    sec: null,
    actionType: "deleteTodo",
    queryData: { id: todoID },
    spinner: false,
    alert: false,
    callBack: controlAPITodoDeleteFallback.bind(null, todoID),
    type: "DELETE",
  }
  API.queryAPI(queryObj)

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

const controlUpdateTodoTitleCallback = function (updateObj) {
  const updatedTodo = model.updateTodoTitle(updateObj)
  //render todos
  todoListComponentView.render(updatedTodo);

}

const controlAPITodoUpdateFallback = function (todoId, updateValue, type, apiSuccess) {
  debugger;
  if (!apiSuccess) {
    const todoToComplete = model.diffState.todoToComplete
    const todoExists = todoToComplete.findIndex(todo => todo.todoId === todoId)
    if (todoExists >= 0) {
      if (type === "complete")
        todoToComplete[todoExists].completed = updateValue
      if (type === "title")
        todoToComplete[todoExists].title = updateValue
      model.persistDiff()
    }

    if (todoExists < 0) {
      if (type === "complete")
        todoToComplete.push({ todoId, completed: updateValue })
      if (type === "title")
        todoToComplete.push({ todoId, title: updateValue })
      model.persistDiff()
    }

    model.diffState.diffActive = true;
    syncLocalStorageToAPI.notifyUIToSyncChanges()
  }

  if (apiSuccess) {
    if (type === "title") controlUpdateTodoTitleCallback(apiSuccess)
  }

}

const controlTodoComplete = function (todoID, uncompleteStatus = undefined) {

  //complete a todo
  const todo = model.completeTodo(Number(todoID), uncompleteStatus);

  const queryObj = {
    // API.APIEnum.TODO.PATCH(todoID),
    endpoint: API.APIEnum.TODO.PATCH(todoID),
    token: model.token.value,
    sec: null,
    actionType: "updateTodo",
    queryData: { completed: todo.completed },
    spinner: false,
    alert: false,
    callBack: controlAPITodoUpdateFallback.bind(null, todoID, todo.completed, "complete"),
    type: "PATCH",
  }
  API.queryAPI(queryObj)

  //render todo
  todoListComponentView.render(model.state.todo);
};

const controlRenderTodo = function (newCurrentTodo, mobileView = false) {
  debugger
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
  debugger;

  if (!mobileDeviceTrigger.matches) {
    if (model.state.currentTodo) {
      //get UI state for currentTodo and save UI statee
      const currentTodoData = model.getCurrentTodo();
      currentTodoData.tasks.length > 0 && controlUpdateTaskUIState();
    }
  }

  //reset currentTodo and get its data
  model.state.currentTodo = Number(todoID);
  taskAddRenderView.setCurrentTodoState(Number(todoID))
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
  taskAddRenderView.setCurrentTodoState(todo.id)

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
    callBack: controlAPITodoUpdateFallback.bind(todoId, title, "title")//controlUpdateTodoTitleCallback
  }
  API.queryAPI(queryObj)
}

const controlUpdateTaskOfExistingTodo = function (task) {
  debugger;
  //adds a task to the an existing todo and returns the todo
  const currentTodo = model.getCurrentTodo(task.todoId);

  //check if todo Title has changed and update
  if (currentTodo.title !== task.todoTitle) controlUpdateTodoTitle(task.todoId, task.todoTitle)

  //check if task value has changed
  const currentTodoTask = currentTodo.tasks.find(taskInstance => taskInstance.taskId === task.taskId)
  const currentTodoTaskHasChanged = currentTodoTask.task.trim() !== task.task.trim()


  if (currentTodoTaskHasChanged) {
    //update api value
    const queryObj = {
      endpoint: API.APIEnum.TASK.PATCH(task.taskId),
      token: model.token.value,
      sec: null,
      actionType: "updateTask",
      queryData: { task: task.task, completed: task.completed },
      callBack: controlAPITaskUpdateFallback.bind(null, +task.todoId, +task.taskId, "update"),//model.APIAddTodoOrTask,
      spinner: false,
      alert: false,
      type: "PATCH",
      callBackParam: "task"
    }
    API.queryAPI(queryObj)
  }

  //update the model before api response
  return model.APIAddTodoOrTask(task)
};

const controlAPICreateNewTodoFallback = function (currentTodoContainer, apiSuccess) {
  debugger;
  if (apiSuccess) {
    const todo = apiSuccess
    controlAddTodoIdToRenderContainer(currentTodoContainer, todo)
  }

  if (!apiSuccess) {
    const currentTime = Date.now()
    const todoBody = {
      todoId: Number(currentTime),
      title: "",
      completed: false,
      tasks: [],
      lastAdded: new Date(currentTime).toISOString()
    }

    //set UI attr
    currentTodoContainer.setAttribute("data-id", todoBody.todoId)
    model.APIAddTodoOrTask(todoBody, "todo", true)
    taskAddRenderView.setCurrentTodoState(todoBody.todoId)

    const todoToCreate = model.diffState.todoToCreate

    const todoExist = todoToCreate.findIndex(todo => todo.todoId === todoBody.todoId)

    // if (todoExist >= 0) return;

    if (todoExist < 0) {
      todoToCreate.push({ todoId: todoBody.todoId, todoId: todoBody.todoId })
      model.persistDiff()

    }
    model.diffState.diffActive = true;
    syncLocalStorageToAPI.notifyUIToSyncChanges()
  }
}

const controlCreateNewTodo = function (task, api = false, currentTodoContainer = undefined) {
  if (api) {

    const queryObj = {
      // API.APIEnum.TODO.CREATE
      endpoint: API.APIEnum.TODO.CREATED,
      token: model.token.value,
      sec: null,
      actionType: "createTodo",
      queryData: { "title": "" },
      callBack: controlAPICreateNewTodoFallback.bind(null, currentTodoContainer),//controlAddTodoIdToRenderContainer.bind(null, currentTodoContainer),
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

const controlAddTaskIdToTaskInput = function (todoId, taskInput, task) {
  debugger;
  //add created task to the task Input
  taskInput.setAttribute("data-taskId", task.id)//
  model.APIAddTodoOrTask(task, "task")
}

const controlAPICreateNewTaskFallback = function (todoId, taskInput, apiSuccess) {
  if (apiSuccess) {
    const task = apiSuccess
    controlAddTaskIdToTaskInput(todoId, taskInput, task)
  }

  if (!apiSuccess) {
    const currentTime = Date.now()
    const taskBody = {
      taskId: Number(currentTime),
      task: "",
      completed: false,
      todoId,
      todoLastAdded: new Date(currentTime).toISOString()
    }
    taskInput.setAttribute("data-taskId", taskBody.taskId)//
    model.APIAddTodoOrTask(taskBody, "task", true)

    const taskToCreate = model.diffState.taskToCreate

    const taskExist = taskToCreate.findIndex(task => task.taskId === taskBody.taskId)

    // if (taskExist >= 0) return;

    if (taskExist < 0) {
      taskToCreate.push({ taskId: taskBody.taskId, todoId })
      model.persistDiff()
    }
    model.diffState.diffActive = true;
    syncLocalStorageToAPI.notifyUIToSyncChanges()
  }

}

const controlCreateNewTask = function (todoId, api = false, currentTaskInput = undefined) {
  debugger;
  if (api) {
    // const currentTodo = model.getCurrentTodo(todoId);

    const queryObj = {
      // API.APIEnum.TASK.CREATE
      endpoint: API.APIEnum.TASK.CREATED,
      token: model.token.value,
      sec: null,
      actionType: "createTask",
      queryData: { task: "", todo_id: todoId, completed: false },
      callBack: controlAPICreateNewTaskFallback.bind(null, todoId, currentTaskInput),//controlAddTaskIdToTaskInput.bind(null, todoId, currentTaskInput),
      spinner: false,
      alert: false,
      type: "POST",
      callBackParam: "task"
    }
    API.queryAPI(queryObj)
  }
}

const controlUpdateAPITaskOrdering = function (updatedTodo) {
  const payload = formatAPIPayloadForUpdateReorder(updatedTodo, "tasks")

  const queryObj = {
    endpoint: API.APIEnum.TASK.BATCH_UPDATE,
    token: model.token.value,
    sec: null,
    actionType: "updateTask",
    queryData: payload,
    spinner: false,
    alert: false,
    type: "PATCH",
  }
  API.queryAPI(queryObj)
}

const controlUpdateTaskUIState = function (currentTask = undefined) {
  const taskUIState = taskAddRenderView.getUIState();

  const { updatedTodo, reOrdered } = model.updateTaskIndex(taskUIState, currentTask);

  if (reOrdered) controlUpdateAPITaskOrdering(updatedTodo)


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
  if (currentTodoExists) currentTodo = controlUpdateTaskOfExistingTodo(task, currentTodo);

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

const controlWaitForDB = function () {
  if (model.dbDataLoaded) {

    todoListComponentView.addHandlerTodoAdd(controlTodoDataLoad);
    taskAddRenderView.addHandlerTaskAdd(controlAddTask, controlCreateNewTask, controlUpdateTodoTitle);

    //add update userinfo component
    const updateUserInfo = new UpdateUserInfoComponent
    updateUserInfo.addEventListeners(controlUpdateUserInfo, model.token.value)

    //add model that to sync component
    syncLocalStorageToAPI.addModelData(model.state, model.diffState)


  }
}

const init = function () {
  model.loadToken()
  if (!model.token.value) {
    document.body.innerHTML = LoginTemplate.template()
    Login.addEventListeners(controlLogin);
  }


  if (model.token.value) {
    document.body.innerHTML = TodoTemplate.template()

    //initialize the components so it only gets loaded after its template is present
    todoListComponentView = importTodoListComponentView()
    taskAddRenderView = importTaskAddRenderView()

    //initialize the data sync to listen for change differences between the API and the localstorage
    syncLocalStorageToAPI = importSyncLocalStorageToAPI()
    syncLocalStorageToAPI.component()

    model.init(syncLocalStorageToAPI, controlWaitForDB)

  }

};
init();
