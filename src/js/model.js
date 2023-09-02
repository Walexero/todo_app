import { cleanFormData, checkValidator, reOrderObjectIndex } from "./helper.js";

export let state = {
  todo: [],
  completed: [],
  currentTodo: null,
  loadedFromDb: false,
};

const pass = () => {};

const persistTodo = function () {
  localStorage.setItem("todos", JSON.stringify(state));
};

export const getCurrentTodo = function (todoID = state.currentTodo) {
  const currentTodo = state.todo.find((curTodo) => curTodo.id === todoID);
  return currentTodo;
};

const getTaskIndexAndCurrentTodo = (taskID) => {
  const currentTodo = getCurrentTodo();

  const taskIndex = currentTodo.tasks.findIndex(
    (task) => task.taskID === Number(taskID)
  );

  return { currentTodo, taskIndex };
};

const getTodoIndexAndTodo = (todoID) => {
  const currentTodo = getCurrentTodo(todoID);
  const todoIndex = state.todo.findIndex((todo) => todo.id === currentTodo.id);
  return { currentTodo, todoIndex };
};

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

export const completeTask = function (taskID) {
  const { currentTodo, taskIndex } = getTaskIndexAndCurrentTodo(taskID);

  //uncheck complete
  if (currentTodo.tasks[taskIndex].completed) {
    currentTodo.tasks[taskIndex].completed = false;
    currentTodo.tasks[taskIndex].task = currentTodo.tasks[taskIndex].task
      .replace("<s>", "")
      .replace("</s>", "");

    //update lastAdded time for the todo
    currentTodo.lastAdded = Number(Date.now());
  } else {
    //complete task by strikethrough
    currentTodo.tasks[
      taskIndex
    ].task = `<s> ${currentTodo.tasks[taskIndex].task} </s>`;
    currentTodo.tasks[taskIndex].completed = true;
    //update lastAdded time for the todo
    currentTodo.lastAdded = Number(Date.now());
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
  if (storage) {
    state = JSON.parse(storage);
    state.loadedFromDb = true;
  }
};
init();
