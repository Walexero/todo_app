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
    return arr.every((task, i) => task.taskID === Number(valueArr[i].at(0)));
  if (arrFrom === "todos")
    return arr.every((task, i) => task.id === Number(valueArr[i].at(0)));
};

export const reOrderObjectIndex = function (arr, valueArr, arrFrom) {
  let cloneCurrentTask = [];
  console.log(valueArr.length);
  console.log(arr.length);

  if (arrFrom === "tasks")
    valueArr.forEach((ind, i) => {
      const toPush = arr.find((task) => task.taskID === Number(ind.at(0)));
      cloneCurrentTask.push(toPush);
    });

  if (arrFrom === "todos")
    valueArr.forEach((ind, i) => {
      const toPush = arr.find((task) => task.id === Number(ind.at(0)));
      cloneCurrentTask.push(toPush);
    });
  console.log("the cloned task", cloneCurrentTask);
  return cloneCurrentTask;
};

export const delegateMatch = (ev, className, optional = undefined) => {
  if (ev.target.classList.contains(className) || ev.target.closest(`.${className}`))
    return true

  if (optional && ev.target.nodeName.toLowerCase() === optional) return true;
}

export const delegateConditional = (ev, className, optional = undefined) => {
  const condition = ev.key === "Escape" || ev.type === "click"
  if (condition) return delegateMatch(ev, className, optional)
}

export const timeout = (sec, actionType) => {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(`Could not ${actionType} at this moment, Please try again later!`)
    }, sec * 1000)
  })
}

export const timeoutWithoutPromise = (sec, fn) => {
  return new Promise((resolve, _) => {
    setTimeout(() => {
      resolve(fn)
    })
  })
}

export const queryAPI = async (endpoint, sec, actionType) => {
  try {

    const res = await Promise.race([fetch(`${BASE_API_URL}/${endpoint}`), timeout(sec, actionType)])
    const data = await res.json()

    if (!res.ok) throw Error(`${res.message}(${res.status})`)
    return data
  } catch (err) {
    throw err;
  }
}