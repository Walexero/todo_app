import { checkValidator, reOrderObjectIndex, formatAPIResponseBody } from "./helper.js";
import { API } from "./api.js";

export let dbDataLoaded;

export let state = {
  todo: [],
  completed: [],
  currentTodo: null,
  loadedFromDb: false,
};

export let diffState = {
  //diffing related properties
  taskToDelete: [],
  todoToDelete: [],
  taskToUpdate: [],//should be to update,sould work with complete and title update
  todoToUpdate: [], //should be to update,sould work with complete and title update
  taskToCreate: [],
  todoToCreate: [],
  taskToUpdate: [],
  diffActive: false,
}

let stateCopyForDiff;

export let token = {}

const pass = () => { };

const persistTodo = function () {
  localStorage.setItem("todos", JSON.stringify(state));
};

export const persistDiff = function () {
  localStorage.setItem("diff", JSON.stringify(diffState))
  console.log(diffState)
}

export const persistToken = function () {
  localStorage.setItem("token", JSON.stringify(token))
}

export const getCurrentTodo = function (todoID = state.currentTodo) {
  const currentTodo = state.todo.find((curTodo) => curTodo.todoId === todoID);
  return currentTodo;
};

export const updateTodoTitle = function (todoId, title) {
  const currentTodo = getCurrentTodo(todoId)
  currentTodo.title = title
  persistTodo()
  return state.todo
}

const getTaskIndexAndCurrentTodo = (taskID) => {
  const currentTodo = getCurrentTodo();

  const taskIndex = currentTodo.tasks.findIndex(
    (task) => task.taskId === Number(taskID)
  );

  return { currentTodo, taskIndex };
};

const getTodoIndexAndTodo = (todoID) => {
  const currentTodo = getCurrentTodo(todoID);
  const todoIndex = state.todo.findIndex((todo) => todo.todoId === currentTodo.todoId);
  return { currentTodo, todoIndex };
};

export const APIAddTodoOrTask = function (typeObj, type, fallback = false) {
  debugger;
  let currentTodo;

  if (type)
    typeObj = formatAPIResponseBody(typeObj, type, fallback)

  if (state.currentTodo) {
    currentTodo = getCurrentTodo(typeObj.todoId);

    const task = { task: typeObj.task, taskId: typeObj.taskId, completed: typeObj.completed }
    const taskBeforeUpdate = currentTodo.tasks.find(task => task.taskId === typeObj.taskId)

    //only push to tasks if there's a task added
    if (type) { //

      if (!taskBeforeUpdate && typeObj.task.length > -1)
        currentTodo.tasks.push(task);
    }

    if (taskBeforeUpdate) {
      //replace the task with value from either api or UI
      taskBeforeUpdate.task = typeObj.task
      taskBeforeUpdate.completed = typeObj.completed
    }

    //update lastAdded time for the todo
    currentTodo.lastAdded = typeObj.todoLastAdded ?? currentTodo.lastAdded;
  } else {
    state.todo.push(typeObj)
    state.currentTodo = typeObj.todoId
    currentTodo = getCurrentTodo(state.currentTodo);
  }
  //persist data
  persistTodo();
  console.log(state.todo)
  return currentTodo;
}

export const addTodoOrTask = function (currentTodoId, todo, formData = false) {
  let currentTodo;

  if (state.currentTodo) {
    currentTodo = getCurrentTodo(currentTodoId);
    //executee for adding task to existing todo object

    //change task title if change from form submission
    if (formData)
      currentTodo.title !== formData["form-title-td"]
        ? (currentTodo.title = formData["form-title-td"])
        : pass();

    //only push to tasks if there's a task added
    if (todo.task) currentTodo.tasks.push(todo);

    //update lastAdded time for the todo
    currentTodo.lastAdded = Number(Date.now());

  } else {
    //execute for adding new todo object
    state.todo.push(todo);
    state.currentTodo = currentTodoId;
    currentTodo = getCurrentTodo(state.currentTodo);
  }
  //persist data
  persistTodo();
  return currentTodo;
};

export const deleteTask = function (taskID) {
  //deletes a task and returns the updated array

  const { currentTodo, taskIndex } = getTaskIndexAndCurrentTodo(taskID);

  //delete task
  currentTodo.tasks.splice(taskIndex, 1);

  //persist data
  persistTodo();
  return currentTodo;
};

export const completeTask = function (taskId, completedStatus, typeObj, type) {
  let currentTask;
  if (type) currentTask = formatAPIResponseBody(typeObj, type)

  const { currentTodo, taskIndex } = getTaskIndexAndCurrentTodo(taskId);

  //uncheck complete
  if (currentTodo.tasks[taskIndex]) {
    currentTodo.tasks[taskIndex].completed = completedStatus;

    //update lastAdded time for the todo
    currentTodo.lastAdded = currentTask?.lastAdded ?? currentTodo.lastAdded;
  }

  //persist data
  persistTodo();
  return currentTodo;
};

export const updateTaskIndex = function (valueArr, curTodo) {
  const currentTodo = curTodo ? curTodo : getCurrentTodo();

  //do not run if only a single task
  if (currentTodo.tasks.length < 2) return currentTodo;

  //check if every index is still in its same position
  const preventReordering = checkValidator(
    currentTodo.tasks,
    valueArr,
    "tasks"
  );

  if (preventReordering) return { updatedTodo: currentTodo, reOrdered: false };

  if (!preventReordering) {
    const clonedTask = reOrderObjectIndex(currentTodo.tasks, valueArr, "tasks");

    currentTodo.tasks = clonedTask;
    //persist data
    persistTodo();
    return { updatedTodo: currentTodo, reOrdered: true };
  }
};

export const updateTodoIndex = function (todoListArr) {
  //prevent unnecessary check
  if (state.todo.length < 2) return state.todo;

  //check if every index is still in its same position
  const preventReordering = checkValidator(state.todo, todoListArr, "todos");

  if (preventReordering) return { updatedTodo: state.todo, reOrdered: false };

  if (!preventReordering) {
    const clonedTodo = reOrderObjectIndex(state.todo, todoListArr, "todos");
    state.todo = clonedTodo;

    //persist data
    persistTodo();
    return { updatedTodo: state.todo, reOrdered: true };
  }
};

export const deleteTodo = function (todoID) {
  const { currentTodo: _, todoIndex } = getTodoIndexAndTodo(todoID);

  const checkIfTodoIsCurrentTodo = state.todo[todoIndex].todoId === todoID;

  if (checkIfTodoIsCurrentTodo) state.currentTodo = null;

  //remove the todo
  state.todo.splice(todoIndex, 1);
  //persist data
  persistTodo();
  return checkIfTodoIsCurrentTodo;
};

export const completeTodo = function (todoID, uncompleteStatus) {
  const { currentTodo, todoIndex } = getTodoIndexAndTodo(todoID);

  //mark as completed
  currentTodo.completed = uncompleteStatus ?? true;

  //persist data
  persistTodo();

  return currentTodo
};

const formatLoadedAPIData = function (APIResp) {
  const todoList = [];

  if (APIResp.length > 0)
    APIResp.forEach(resp => todoList.push(formatAPIResponseBody(resp, "todo")))
  const orderedTodoList = todoList.length > 0 ? todoList.sort((a, d) => a?.ordering - d?.ordering) : null
  if (!orderedTodoList) return todoList

  return orderedTodoList
}


const loadDataFromAPI = function (token, callBack) {
  const queryObj = {
    endpoint: API.APIEnum.TODO.LIST,
    token: token,
    sec: null,
    actionType: "loadTodos",
    // queryData: { completed: completeStatus },
    spinner: true,
    alert: true,
    type: "GET",
    callBack: init.bind(null, null, callBack, true)
  }
  API.queryAPI(queryObj)
}

export const loadToken = function () {
  const storedToken = localStorage.getItem("token")
  if (storedToken) token = JSON.parse(storedToken)
}

//get persisted data on page load
export function init(sync, callBack, api = false, APIResp = undefined) {
  debugger;
  if (!api) {
    const savedState = localStorage.getItem("todos")
    const diffSavedState = localStorage.getItem("diff")
    if (savedState) {
      const localState = JSON.parse(savedState);
      const diffLocalState = JSON.parse(diffSavedState)
      console.log(localState)

      if (diffLocalState && diffLocalState.diffActive) {

        sync.addModelData(localState, diffLocalState, token.value)
        sync.startModelInit(init)
      }

      if (!diffLocalState || !diffLocalState.diffActive)
        //load api after no more data to sync
        //TODO: add diff state load before apidata load
        //TODO: any todo that was created by the fallback should have a property to indicate it
        //load the data from the API
        //TODO: if sync fails user should still be able to access data
        loadDataFromAPI(token.value, callBack)
    }

    if (!savedState)
      loadDataFromAPI(token.value, callBack)

  }

  if (api) {
    const APIData = formatLoadedAPIData(APIResp)
    const storage = localStorage.getItem("todos");

    if (storage)
      state = JSON.parse(storage);


    state.todo = APIData
    state.loadedFromDb = true;

    if (!storage)
      persistTodo()

    dbDataLoaded = true;

    //load the UI
    callBack()
  }
};