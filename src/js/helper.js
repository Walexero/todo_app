import { BASE_API_URL } from "./config.js";

export const cleanFormData = function (formData) {
  return {
    title: formData["form-title-td"],
    task: formData["form-task-td"],
  };
};

export const createObjectFromForm = function (id, formData, add = false) {
  formData = cleanFormData(formData);
  const taskObj = {
    taskID: add ? id++ : id,
    task: formData["task"],
  };
  return taskObj;
};

export const checkValidator = function (arr, valueArr, arrFrom) {
  if (arrFrom === "tasks")
    return arr.every((task, i) => task.taskId === Number(valueArr[i].at(0)));
  if (arrFrom === "todos")
    return arr.every((todo, i) => todo.todoId === Number(valueArr[i].at(0)));
};

export const reOrderObjectIndex = function (arr, valueArr, arrFrom) {
  let cloneCurrentTask = [];
  console.log(valueArr.length);
  console.log(arr.length);

  if (arrFrom === "tasks")
    valueArr.forEach((ind, i) => {
      const toPush = arr.find((task) => task.taskId === Number(ind.at(0)));
      cloneCurrentTask.push(toPush);
    });

  if (arrFrom === "todos")
    valueArr.forEach((ind, i) => {
      const toPush = arr.find((todo) => todo.todoId === Number(ind.at(0)));
      cloneCurrentTask.push(toPush);
    });
  console.log("the cloned task", cloneCurrentTask);
  return cloneCurrentTask;
};

export const selector = (identifier, nodeObj = undefined) => {
  if (nodeObj) return nodeObj.querySelector(identifier)

  if (!nodeObj) return document.querySelector(identifier)
}

export const delegateMatch = (ev, className, optional = undefined) => {
  if (ev.target.classList.contains(className) || ev.target.closest(`.${className}`))
    return true

  if (optional && ev.target.nodeName.toLowerCase() === optional) return true;
}

export const delegateConditional = (ev, className, optional = undefined) => {
  const condition = ev.key === "Escape" || ev.type === "click"
  if (condition) return delegateMatch(ev, className, optional)
}

export const timeout = (sec, actionType, fn = undefined) => {
  return new Promise((_, reject) => {
    setTimeout(() => {
      const error = new Error(`Could not ${actionType} at this moment, Please try again later!`)
      reject(fn ? fn() && error : error)
    }, sec * 1000)
  })
}

export const timeoutWithoutPromise = (sec, fn) => {
  return new Promise((resolve, _) => {
    setTimeout(() => {
      resolve(fn())
    }, sec * 1000)
  })
}

export const formatDateTime = (dateTime) => {
  return new Date(dateTime)
}

export const formatAPIResponseBody = (responseBody, type) => {
  let formattedBody;

  if (type === "todo")
    formattedBody = {
      todoId: responseBody.id,
      title: responseBody.title,
      tasks: responseBody.tasks,
      lastAdded: formatDateTime(responseBody.last_added),
      completed: responseBody.completed
    }

  if (type === "task")
    formattedBody = {
      taskId: responseBody.id,
      task: responseBody.task,
      completed: responseBody.completed,
      todoId: responseBody.todo_id,
      todoLastAdded: responseBody.todo_last_added
    }

  return formattedBody
}
// function asyncWrapper(fn) {

// }