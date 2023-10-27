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

export const delegateMatch = (ev, className) => {
  if (ev.target.classList.contains(className) || ev.target.closest(`.${className}`))
    return true
}
