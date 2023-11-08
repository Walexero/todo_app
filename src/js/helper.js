
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
  console.log(identifier, nodeObj)
  if (nodeObj) return nodeObj.querySelector(identifier)

  if (!nodeObj) return document.querySelector(identifier)
}

export const delegateMatchTarget = (ev, className) => {
  //on selects based on thee classlist and not with closest
  if (ev.target.classList.contains(className)) return true
}

export const delegateMatch = (ev, className, optional = undefined) => {
  if (ev.target.classList.contains(className) || ev.target.closest(`.${className}`))
    return true

  if (optional && ev.target.nodeName.toLowerCase() === optional) return true;
}

export const delegateMatchId = (ev, id, optional = undefined) => {
  if (ev.target.id === id || ev.target.closest(`#${id}`)) return true
}

export const delegateMatchChild = (ev, className) => {
  if (ev.target.querySelector(`.${className}`)) return true
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

const formatAPITodoTasks = (APITasks, formatType) => {
  if (APITasks.length > 0) {
    const APItaskList = []
    APITasks.forEach(task => APItaskList.push(formatAPIResponseBody(task, formatType)))
    const orderedTaskList = APItaskList.sort((a, d) => a?.ordering - d?.ordering)
    if (!orderedTaskList) return APItaskList
    return orderedTaskList
  }

  // return [formatAPIResponseBody(APITasks[0], formatType)]
  return APITasks
}

const formatAPIRequestTodoTasks = (APIRequestTasks, formatType) => {
  if (APIRequestTasks.length > 0) {
    const APItaskList = []
    APIRequestTasks.forEach(task => APItaskList.push(formatAPIRequestBody(task, formatType)))
    return APItaskList

    //implement task todo request formatting
  }
  return [formatAPIRequestBody(APIRequestTasks[0], formatType)]
}

export const formatAPIResponseBody = (responseBody, type, fallback = false) => {
  let formattedBody;

  if (fallback) return responseBody

  if (type === "todo")
    formattedBody = {
      todoId: responseBody.id,
      title: responseBody.title,
      tasks: formatAPITodoTasks(responseBody.tasks, "todoTask"),
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

  if (type === "todoTask")
    formattedBody = {
      taskId: responseBody.id,
      task: responseBody.task,
      completed: responseBody.completed,
      ordering: responseBody.ordering ?? null
    }
  return formattedBody
}

export const formatAPIRequestBody = (requestBody, type) => {
  // debugger;
  let formattedBody;

  if (!requestBody.length > 0) return requestBody

  if (type === "todo")
    formattedBody = {
      title: requestBody.title,
      tasks: formatAPIRequestTodoTasks(requestBody.tasks, "todoTask"),
      last_added: requestBody.lastAdded,
      completed: requestBody.completed
    }

  if (type === "todoTask")
    formattedBody = {
      task: requestBody.task,
      completed: requestBody.completed,
    }

  if (type === "task")
    formattedBody = {
      task: requestBody.task,
      completed: requestBody.completed,
      todo_id: requestBody.todoId,
    }

  return formattedBody
}

export const formatAPIPayloadForUpdateReorder = function (payload, type) {
  let requestObj;

  if (type === "tasks") {
    const listItems = []

    payload.tasks.forEach((task, i) =>
      listItems.push({ id: task.taskId, ordering: i + 1 })
    )
    requestObj = {
      "ordering_list": listItems
    }
  }

  if (type === "todos") {
    const listItems = []

    payload.forEach((todo, i) =>
      listItems.push({ id: todo.todoId, ordering: i + 1 })
    )
    requestObj = {
      "ordering_list": listItems
    }
  }

  return requestObj
}