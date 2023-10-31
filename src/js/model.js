import { cleanFormData, checkValidator, reOrderObjectIndex, formatAPIResponseBody } from "./helper.js";

export let state = {
  todo: [],
  completed: [],
  currentTodo: null,
  loadedFromDb: false,
};

export let token = {}

const pass = () => { };

const persistTodo = function () {
  localStorage.setItem("todos", JSON.stringify(state));
};

export const persistToken = function () {
  localStorage.setItem("token", JSON.stringify(token))
}

export const getCurrentTodo = function (todoID = state.currentTodo) {
  const currentTodo = state.todo.find((curTodo) => curTodo.todoId === todoID);
  return currentTodo;
};

export const updateTodoTitle = function (updateObj) {
  const currentTodo = getCurrentTodo(+updateObj.id)
  currentTodo.title = updateObj.title
  persistTodo()
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

export const APIAddTodoOrTask = function (typeObj, type) {
  let currentTodo;

  if (type)
    typeObj = formatAPIResponseBody(typeObj, type)

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
  debugger
  let currentTask;
  if (type) currentTask = formatAPIResponseBody(typeObj, type)

  const { currentTodo, taskIndex } = getTaskIndexAndCurrentTodo(taskId);

  //uncheck complete
  if (currentTodo.tasks[taskIndex].completed) {
    currentTodo.tasks[taskIndex].completed = completedStatus;

    //update lastAdded time for the todo
    currentTodo.lastAdded = currentTask.lastAdded ?? currentTodo.lastAdded;
  }

  //persist data
  persistTodo();
  return currentTodo;
};

export const editTask = function (taskID, taskData) {
  let completedTask;
  const { currentTodo, taskIndex } = getTaskIndexAndCurrentTodo(taskID);

  //format gotten data to readable form
  taskData = cleanFormData(taskData);

  // run task and value change only if the task is not completed
  completedTask = currentTodo.tasks[taskIndex].completed;
  if (!completedTask) {
    //determine whether to listen for title change?
    currentTodo.tasks[taskIndex].title = taskData.title;
    currentTodo.tasks[taskIndex].task = taskData.task;
  }

  //update lastAdded time for the todo
  currentTodo.lastAdded = Number(Date.now());

  //persist data
  persistTodo();

  return { currentTodo, completedTask };
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

  if (preventReordering) return currentTodo;

  if (!preventReordering) {
    const clonedTask = reOrderObjectIndex(currentTodo.tasks, valueArr, "tasks");

    currentTodo.tasks = clonedTask;
    //persist data
    persistTodo();
    return currentTodo;
  }
};

export const updateTodoIndex = function (todoListArr) {
  //prevent unnecessary check
  if (state.todo.length < 2) return state.todo;

  //check if every index is still in its same position
  const preventReordering = checkValidator(state.todo, todoListArr, "todos");

  if (preventReordering) return state.todo;

  if (!preventReordering) {
    const clonedTodo = reOrderObjectIndex(state.todo, todoListArr, "todos");
    state.todo = clonedTodo;

    //persist data
    persistTodo();
    return state.todo;
  }
};

export const deleteTodo = function (todoID) {
  const { currentTodo: _, todoIndex } = getTodoIndexAndTodo(todoID);

  const checkIfTodoIsCurrentTodo = state.todo[todoIndex].id === todoID;

  if (checkIfTodoIsCurrentTodo) state.currentTodo = null;

  //remove the todo
  state.todo.splice(todoIndex, 1);
  //persist data
  persistTodo();
  return checkIfTodoIsCurrentTodo;
};

export const completeTodo = function (todoID) {
  const { currentTodo, todoIndex } = getTodoIndexAndTodo(todoID);

  //mark as completed
  currentTodo.completed = true;

  //persist data
  persistTodo();
};

//get persisted data on page load
const init = function () {
  const storage = localStorage.getItem("todos");
  const storedToken = localStorage.getItem("token")
  if (storage) {
    state = JSON.parse(storage);
    state.loadedFromDb = true;
  }

  if (storedToken) token = JSON.parse(storedToken)
};
init();
