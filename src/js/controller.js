import * as model from "./model.js";
import dragComponentListView from "./views/dragComponentListView.js";
import taskAddRenderView from "./views/taskAddRenderView.js";
import todoListComponentView from "./views/todoListComponentView.js";
import { MOBILE_MAX_SCREEN_SIZE } from "./config.js";

let storageData;

//Every data and statee change most be handleed by controller
let deleteHandler,
  completeHandler,
  editHandler,
  dragSyncHandler,
  todoDeleteHandler,
  todoCompleteHandler,
  todoListDragSyncHandler,
  saveBeforeRenderHandler;

//distinguish mobile render from other screensize
const mobileDeviceTrigger = window.matchMedia(MOBILE_MAX_SCREEN_SIZE);

const controlAddTodoMobile = function (renderTasks = undefined) {

  //if todo objects, set mobile nav active state to false so it can add it
  if (model.state.todo.length > 0)
    todoListComponentView.setMobileNavActiveState(false);
  

  //render todo
  todoListComponentView.mobileRender();

  if (renderTasks) {
    //run if there is an existing todo to be rendered in the taskAddrenderview
    taskAddRenderView.mobileRender(renderTasks);
    taskAddRenderView.toggleContainer();
  }
  
  //if a new todo is to be added run
  if(!renderTasks){
    //renders the task add form after a delete is detected
    taskAddRenderView.mobileRender();
  }
};

const controlNavSwitchMobile = function () {
  console.log("controlling navigation switch");
  taskAddRenderView.mobileRender();
  todoListComponentView.mobileRender(model.state.todo);

  //On nav switch reload app back to initial state
  if(model.state.todo.length === 0) window.location.reload()
};

const controlAddTodo = function () {
  console.log("inited ran func")
  //Implement Todo actions delegation to be offloadeed to todoActionsView
  if (!todoListComponentView.getAddListenerEventState()) {
    todoListComponentView.addDelegateTodoActions(
      todoDeleteHandler,
      todoCompleteHandler,
      todoListDragSyncHandler,
      saveBeforeRenderHandler,
      controlNavSwitchMobile
    );
  }

  //implement the handler listens for todoList components if only thee addtodo button hasn't been clicked yet
  if(!todoListComponentView.getinitRenderFormActiveState()){
    console.log("added eevents listcomponent")
    todoListComponentView.setAddTodoHandler(controlAddTodo)
    todoListComponentView.initAddTodoButtonListener()
  }

  //remove currentTodo from model
  model.state.currentTodo = null;


  if (mobileDeviceTrigger.matches) {
    // todoListComponentView.setClearAndHideContainer(true);
    controlAddTodoMobile();
  }
};

const controlTodo = function(){
  //make check to see if data loaded from storage
  if(model.state.todo.length > 0){
    //set storage data to true to reset handler in controlAddTodo
    storageData = true;
    //if data run below
    //else add _handleformevents
    todoListComponentView.render(model.state.todo)
    controlAddTodo();
    //add event listeners
    todoListComponentView.addTodoListEventListeners()
    //set event listeners state to true
    todoListComponentView.setAddListenerEventState(true)
  }
  else{
    //call controlAddTodo and handle form events
    controlAddTodo();
  }


}

const controlAddTaskMobile = function (todoOrTask) {
  taskAddRenderView.mobileRender(todoOrTask);
};

const controlAddTask = function (task) {
  //Implement Task actions delegation to be offloadeed to taskActionsView
  if (!taskAddRenderView.getTaskActionState()) {
    //if the controllers havent been offloaded offload it
    taskAddRenderView.addDelegateTaskActions(
      deleteHandler,
      completeHandler,
      editHandler,
      dragSyncHandler
    );

    //set state to offloaded
    taskAddRenderView.setTaskActionState(true);
  }

  let currentTodo, getSortedTodo;

  //update model state based on task or todo
  if (model.state.currentTodo) {
    const currentTask = model.getCurrentTodo();

    const todo = taskAddRenderView.getTaskBody(currentTask, task);

    currentTodo = model.addTodoOrTask(currentTask.id, todo, task);
  } else {
    const { currentTask, todo } =
      todoListComponentView.getTodoAndTaskBody(task); //taskAddRenderView.getTodoAndTaskBody(task);
    currentTodo = model.addTodoOrTask(currentTask, todo);
  }

  if (!mobileDeviceTrigger.matches) {
    //update UI
    taskAddRenderView.render(currentTodo);
    //update todo component with state object
    todoListComponentView.render(model.state.todo);
  } else {
    controlAddTaskMobile(currentTodo);
  }

  if (!todoListComponentView.getAddListenerEventState()) {
    //listen for events after components rendered
    todoListComponentView.setAddListenerEventState(true);
    todoListComponentView.addTodoListEventListeners();
  }
};

const controlDeleteTask = function (taskID) {
  //delete task
  const updatedTask = model.deleteTask(taskID);
  //render tasks
  taskAddRenderView.render(updatedTask);

  //update the todolist view on task delete
  todoListComponentView.render(model.state.todo)
};

const controlCompleteTask = function (taskID) {
  console.log("triggereed tas completion");
  //mark task as complete
  const updatedTask = model.completeTask(taskID);
  //render tasks
  taskAddRenderView.render(updatedTask);

  //update the todolist view on task delete
  todoListComponentView.render(model.state.todo)
};

const controlEditTask = function (taskID, taskData) {
  console.log("about to edit");
  //update the taskvalue in the model
  const { currentTodo: updatedTask, completedTask } = model.editTask(
    taskID,
    taskData
  );
  if (completedTask)
    alert(
      "You can't edit a completed task, you have to make it an active task to edit"
    );
  //render tasks
  taskAddRenderView.render(updatedTask);
};

const controlSyncDragStateWithModel = function (currentTask = undefined) {
  console.log("controlling sync drag");
  //get content drag position
  const valueArr = taskAddRenderView.getUIState();
  //update and return updated model object

  //TODO: verify getting valueArr
  const updatedTaskIndex = model.updateTaskIndex(valueArr, currentTask);

  // //render tasks
  taskAddRenderView.render(updatedTaskIndex);
};

const controlSyncTodoListDragStateWithModel = function (
  currentTodo = undefined
) {
  console.log("initiating todolist drag state");
  const todoListArr = todoListComponentView.getUIState();
  const updatedTodoIndex = model.updateTodoIndex(todoListArr);
  //render todos
  todoListComponentView.render(updatedTodoIndex);
};

const controlTodoDelete = function (todoID) {
  //delete and return the remaining todo
  const [deletedCurrentTodo,todo] = model.deleteTodo(Number(todoID));

  //check if there's still todos left
  if (todo.length > 0){
    if(deletedCurrentTodo) taskAddRenderView.render()
    todoListComponentView.render(todo); //render todo
  } 
  
  else {
    model.state.currentTodo = null;
    //runs if not mobile
    if (!mobileDeviceTrigger.matches) {
      taskAddRenderView.render(); //clears the task render container
      todoListComponentView.render(); //should hide the todolist container
    }

    if (mobileDeviceTrigger.matches) {
      //clear the todoList container
      todoListComponentView.setClearAndHideContainer(true);

      //toogle nav button
      // todoListComponentView.togg

      //clear and add form to create new todo
      controlAddTodoMobile();
    }
  }
};

const controlTodoComplete = function (todoID) {
  //complete a todo and return the remaining todo
  const todo = model.completeTodo(Number(todoID));
  //render todo
  todoListComponentView.render(todo);
};

const controlRenderTodo = function(newCurrentTodo){
  if(!todoListComponentView.getinitRenderFormActiveState() && storageData){
    //if add todo hasn't been clicked run loci
    todoListComponentView.toggleRenderDisplay(true)
    storageData = false
  }
  taskAddRenderView.render(newCurrentTodo);
}


const controlRenderTodoAndSaveCurrentTodoForMobile = function (todo) {
  //render for other mobile scrensizes
  //get the todo ob

  controlAddTodoMobile(todo);
  // how view should be executed for mobile screens
  //hide todolistview
  //display tasksrenderview
  //add button to navigate back to todolistview
};

const controlRenderTodoAndSaveCurrentTodo = function (todoID) {
  console.log("thee gottn todoid", todoID);


  if (!mobileDeviceTrigger.matches) {
    //run this block if only theres a currentTodo to work on
    if(model.state.currentTodo){
      //get UI state for currentTodo and save UI statee
      const currentTodo = model.getCurrentTodo();
      if (!currentTodo.tasks.length < 1) {
        const currentUIState = taskAddRenderView.getUIState();
        const _ = model.updateTaskIndex(currentUIState);
      }
    }
  }

  //get new todoID to currentTodo
  const setCurrentTodo = (model.state.currentTodo = Number(todoID));
  const newCurrentTodo = model.getCurrentTodo(Number(todoID));

  //render for mobile
  if (mobileDeviceTrigger.matches)
    controlRenderTodoAndSaveCurrentTodoForMobile(newCurrentTodo);
  //render for other screens
  //clear currentTodo content
  else controlRenderTodo(newCurrentTodo);
};

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


  todoListComponentView.addHandlerTodoAdd(controlTodo);

  // todoListComponentView.addHandlerTodoAdd(controlAddTodo);
  taskAddRenderView.addHandlerTaskAdd(controlAddTask);
};
init();
