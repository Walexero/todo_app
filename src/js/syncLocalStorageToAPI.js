import { Loader } from "./components/loader.js";
import { ComponentMethods } from "./components/componentMethods.js";
import { delegateMatchTarget, formatAPIRequestBody } from "./helper.js";
import { API } from "./api.js";

class SyncLocalStorageToAPI {
    _container = document.querySelector(".container .row")
    _modelState;
    _diffState;
    _token;
    _syncNotifyActive = false;
    _init;

    _eventListeners = ["click"]

    startModelInit(init) {
        this._init = init
        this._handleStartSync()
    }

    notifyUIToSyncChanges() {
        if (this._syncNotifyActive) return;
        this._container.insertAdjacentElement("afterbegin", this._component)
    }

    component() {
        const cls = this;
        this._component = ComponentMethods.HTMLToEl(this._generateMarkup())
        this._eventListeners.forEach(ev => this._component.addEventListener(ev, cls._handleEvents.bind(cls)))
    }

    addModelData(modelState, diffState, token) {
        this._modelState = modelState
        this._diffState = diffState
        this._token = token
    }

    _handleEvents(ev) {
        if (delegateMatchTarget(ev, "btn-sync-now")) _handleStartSync(ev)
        if (delegateMatchTarget(ev, "btn-sync-later")) this._removeNotifier()
    }

    _initializeSyncProperties() {
        this.pendingTodos = this._diffState.todoToCreate
        this.pendingTasks = this._diffState.taskToCreate
        this.pendingTodosToDelete = this._diffState.todoToDelete;
        this.pendingTasksToDelete = this._diffState.taskToDelete;
        this.pendingTodoToUpdate = this._diffState.todoToUpdate;
        this.pendingTaskToUpdate = this._diffState.taskToUpthis.
            this.createPendingTodos = []
        this.createPendingTasks = []
        this.createPendingTaskLinkedToAPITodothis.
            this.createTodoPayload = []
        this.createTaskPayload = []
        this.createTodoToUpdatePayload = []
        this.createTaskToUpdatePayload = []

    }

    _handleStartSync() {
        debugger;
        this._initializeSyncProperties()

        this._filterProperties()

        this._createPropertiesPayload()

        this._makePropertiesRequest()

        //TODO: sort data ordering if missing edge cases
        //TODO: if sync request succeeds delete data from diffstate
        //TODO: if sync request fails, allow user access to local data
    }

    _filterProperties() {
        //todo passes deleted check
        this._filterDeletedObjectsFromObjects(this.pendingTodos, this.pendingTodosToDelete, this.createPendingTodos, "todo")

        //task passes deleted check
        this._filterDeletedObjectsFromObjects(this.pendingTasks, this.pendingTasksToDelete, this.createPendingTasks, "task")

    }

    _createPropertiesPayload() {
        //create todo payload
        this._createTodoPayload(this.pendingTodos, this.createPendingTodos, this.createTodoPayload)

        //create todo to update payload
        this._createTodoUpdatePayload(this.pendingTodoToUpdate, this.createPendingTodos, this.pendingTodosToDelete, this.createTodoToUpdatePayload)

        //sort tasks which are not linked to todos to create
        this._filterPendingTaskLinkedToAPITodo(this.pendingTasks, this.createPendingTodos, this.createPendingTaskLinkedToAPITodo)

        //task not linked to todos to create payload body
        this._createTaskLinkedToAPITodoBody(this.createPendingTaskLinkedToAPITodo, this.createTaskPayload)

        //sort tasks which are to be updated not in createPendingTaskLinkedToAPITodo Array
        this._createTaskToUpdateBody(this.pendingTaskToUpdate, this.createPendingTaskLinkedToAPITodo, this.createTaskToUpdatePayload)

    }

    _makePropertiesRequest() {
        //create batch todoToCreate
        this._makeTodoCreateRequest(this.createTodoPayload, this.pendingTodos)

        //create batch todoToDelete
        this._makeTodoDeleteRequest(this.pendingTodosToDelete)

        //create batch todoUpdate
        this._makeTodoUpdateRequest(this.createTodoToUpdatePayload, this.pendingTodoToUpdate)

        //create batch taskToCreate
        this._makeTaskToCreateRequest(this.createPendingTasks, this.pendingTasks)

        //create batch taskToDelete
        this._makeTaskToDeleteRequest(this.pendingTasksToDelete)

        //create batch taskToUpdate
        this._makeTaskToUpdateRequest(this.pendingTaskToUpdate, this.createTaskToUpdatePayload, this.pendingTaskToUpdate)

    }

    _makeTodoCreateRequest(createTodoPayload, pendingTodos) {
        //create batch todoToCreate
        if (createTodoPayload.length > 0) {
            const createTodoPayloadMoreThanOne = createTodoPayload.length > 1

            if (createTodoPayloadMoreThanOne)
                this._makeBatchRequest(API.APIEnum.TODO.CREATE_BATCH, createTodoPayload, pendingTodos, "createTodoBatch", this._createTodoBatchCallBack.bind(this), "POST")

            if (!createTodoPayloadMoreThanOne)
                this._makeBatchRequest(API.APIEnum.TODO.CREATE, createTodoPayload[0], pendingTodos, "createTodo", this._createTodoBatchCallBack.bind(this), "POST")

        }

    }

    _makeTodoDeleteRequest(pendingTodosToDelete) {
        //create batch todoToDelete
        if (pendingTodosToDelete.length > 0) {
            const todosToDeleteMoreThanOne = pendingTodosToDelete.length > 1

            //if todo doesn't exist in API it should return a NOT FOUND so no need to keep track of type of todo
            if (todosToDeleteMoreThanOne)
                this._makeBatchRequest(API.APIEnum.TODO.DELETE_BATCH, pendingTodosToDelete, pendingTodosToDelete, "deleteTodoBatch", this._deleteTodoBatchCallBack.bind(this), "DELETE")

            if (!todosToDeleteMoreThanOne)
                this._makeBatchRequest(API.APIEnum.TODO.DELETE, pendingTodosToDelete[0], pendingTodosToDelete, "deleteTodo", this._deleteTodoBatchCallBack.bind(this), "DELETE")


        }

    }

    _makeTodoUpdateRequest(createTodoToUpdatePayload, pendingTodoToUpdate) {
        //create batch todoUpdate
        if (createTodoToUpdatePayload.length > 0) {
            const todosToUpdateMoreThanOne = createTodoToUpdatePayload.length > 1

            if (todosToUpdateMoreThanOne)
                this._makeBatchRequest(API.APIEnum.TODO.BATCH_UPDATE_ALL, createTodoToUpdatePayload, pendingTodoToUpdate, "updateBatchTodo", this._updateTodoBatchCallBack.bind(this), "PATCH")

            if (!todosToUpdateMoreThanOne)
                this._makeBatchRequest(API.APIEnum.TODO.PATCH, createTodoToUpdatePayload[0], pendingTodoToUpdate, "updateTodo", this._updateTodoBatchCallBack.bind(this))
        }

    }

    _makeTaskToCreateRequest(createPendingTasks, pendingTasks) {
        //create batch taskToCreate
        if (createPendingTasks.length > 0) {
            const tasksToCreateMoreThanOne = createPendingTasks.length > 1

            if (tasksToCreateMoreThanOne)
                this._makeBatchRequest(API.APIEnum.TASK.CREATE_BATCH, createPendingTasks, pendingTasks, "createBatchTask", this._createTaskBatchCallBack.bind(this), "POST")

            if (!tasksToCreateMoreThanOne)
                this._makeBatchRequest(API.APIEnum.TASK.CREATE, createPendingTasks[0], pendingTasks, "createTask", this._createTaskBatchCallBack.bind(this), "POST")
        }


    }

    _makeTaskToDeleteRequest(pendingTasksToDelete) {
        //create batch taskToDelete
        if (pendingTasksToDelete.length > 0) {
            const tasksToDeleteMoreThanOne = pendingTasksToDelete.length > 1

            if (tasksToDeleteMoreThanOne)
                this._makeBatchRequest(API.APIEnum.TASK.DELETE_BATCH, pendingTasksToDelete, pendingTasksToDelete, "deleteBatchTask", this._deleteTaskBatchCallBack.bind(this), "DELETE")

            if (!tasksToDeleteMoreThanOne)
                this._makeBatchRequest(API.APIEnum.TASK.DELETE, pendingTasksToDelete[0], pendingTasksToDelete, "deleteTask", this._deleteTaskBatchCallBack.bind(this), "DELETE")
        }

    }

    _makeTaskToUpdateRequest(pendingTaskToUpdate, createTaskToUpdatePayload, pendingTaskToUpdate) {
        //create batch taskToUpdate
        if (pendingTaskToUpdate.length > 0) {
            const taskToUpdateMoreThanOne = pendingTaskToUpdate.length > 1

            if (taskToUpdateMoreThanOne)
                this._makeBatchRequest(API.APIEnum.TASK.BATCH_UPDATE_ALL, createTaskToUpdatePayload, pendingTaskToUpdate, "updateBatchTask", this._updateTaskBatchCallBack.bind(this), "PATCH")

            if (!taskToUpdateMoreThanOne)
                this._makeBatchRequest(API.APIEnum.TASK.UPDATE, createTaskToUpdatePayload, pendingTaskToUpdate, "updateTask", this._updateTaskBatchCallBack.bind(this), "PATCH")
        }

    }


    _createTodoBatchCallBack() {

    }

    _deleteTodoBatchCallBack() { }

    _updateTodoBatchCallBack() { }

    _createTaskBatchCallBack() { }

    _deleteTaskBatchCallBack() { }

    _updateTaskBatchCallBack() { }


    _filterDeletedObjectsFromObjects(object, deletedObjects, returnList, objectType) {
        if (object.length > 0)
            object.forEach(obj => {
                const pendingObjectToBeDeletedExists = deletedObjects.find(deletedObjId => deletedObjId === this._returnObjType(objectType, obj))
                if (pendingObjectToBeDeletedExists >= 0) returnList.push(obj)
            })
    }

    _createTodoPayload(todoToCreateDiffArray, todoToCreateFilteredArray, todoToCreatePayloadArray) {
        //create todo payload
        if (todoToCreateDiffArray.length > 0 && todoToCreateFilteredArray.length > 0)
            todoToCreateFilteredArray.forEach(todo => {
                //get todo from modelState
                const modelTodos = this._modelState.todo
                const todoModelIndex = this._modelState.todo.findIndex(modelTodo => modelTodo.todoId === todo.todoId)

                const todoBody = modelTodos[todoModelIndex].slice()

                //remove ids from todo and tasks
                delete todoBody.todoId
                todoBody.tasks.forEach(task => delete task.taskId)

                //add formatted data to todos to create
                const formattedTodoBody = formatAPIRequestBody(todoBody, "todo")
                todoToCreatePayloadArray.push(formattedTodoBody)
            })
    }

    _createTodoUpdatePayload(todoToUpdateDiffArray, todoToCreateFilteredArray, todoToDeleteArray, todoToUpdatePayloadArray) {
        //create todo to update payload
        if (todoToUpdateDiffArray.length > 0)
            todoToUpdateDiffArray.forEach(todo => {
                const todoToUpdateExistsInTodoToCreate = todoToCreateFilteredArray.find(pendingTodo => pendingTodo.todoId === todo.todoId)
                const todoToUpdateExistsInTodoToDelete = todoToDeleteArray.find(pendingTodoId => pendingTodoId === todo.todoId)

                const todoNotInOtherPendingTodos = todoToUpdateExistsInTodoToCreate < 0 && todoToUpdateExistsInTodoToDelete < 0

                if (todoNotInOtherPendingTodos) todoToUpdatePayloadArray.push(formatAPIRequestBody(todo, "todo"))
            })


    }

    _filterPendingTaskLinkedToAPITodo(tasksToCreateDiffArray, todoToCreateFilteredArray, pendingTaskLinkedToAPITodoArray) {
        //sort tasks which are not linked to todos to create
        if (tasksToCreateDiffArray.length > 0)
            tasksToCreateDiffArray.forEach(task => {
                const pendingTaskTodoExistsInPendingTodos = todoToCreateFilteredArray.find(todo => todo.todoId === task.todoId)
                if (pendingTaskTodoExistsInPendingTodos < 0) pendingTaskLinkedToAPITodoArray.push(task)
            })

    }

    _createTaskLinkedToAPITodoBody(taskToCreateDiffArray, pendingTaskLinkedToAPITodoArray, taskToCreatePayloadArray) {
        //task not linked to todos to create payload body
        if (taskToCreateDiffArray.length > 0)
            pendingTaskLinkedToAPITodoArray.forEach(task => {
                const taskBody = this._filterToGetTaskBody(task.taskId, task.todoId)
                //remove id from task
                delete taskBody.taskId
                //add formatted data to tasks to create
                taskToCreatePayloadArray.push(formatAPIRequestBody(taskBody, "task"))
            })

    }

    _createTaskToUpdateBody(taskToUpdateDiffArray, pendingTaskLinkedToAPITodo, taskToUpdatePayloadArray) {
        //sort tasks which are to be updated not in createPendingTaskLinkedToAPITodo Array
        if (taskToUpdateDiffArray.length > 0)
            taskToUpdateDiffArray.forEach(task => {
                const taskToUpdateExistsInTaskAPITodo = pendingTaskLinkedToAPITodo.find(APITodoTask => APITodoTask.taskId === task.taskId)
                if (taskToUpdateExistsInTaskAPITodo < 0) {
                    const taskBody = this._filterToGetTaskBody(task.taskId, task.todoId)
                    //remove id from task
                    delete taskBody.taskId
                    taskToUpdatePayloadArray.push(formatAPIRequestBody(taskBody, "task"))
                }
            })

    }

    _filterToGetTaskBody(taskId, todoId) {
        //get todo from modelState
        const modelTodos = this._modelState.todo
        const todoModelIndex = this._modelState.todo.findIndex(modelTodo => modelTodo.todoId === todoId)
        const taskIndex = modelTodos[todoModelIndex].tasks.findIndex(modelTask => modelTask.taskId === taskId)
        const taskBody = modelTodos[todoModelIndex].tasks[taskIndex].slice()
        return taskBody
    }

    _makeBatchRequest(requestURL, requestPayload, requestDiffArray, requestActionType, requestCallBack, requestType, requestCallBackParam = false) {
        const queryObj = {
            endpoint: requestURL,
            token: this._token,
            sec: null,
            actionType: requestActionType,
            queryData: requestPayload,
            callBack: requestCallBack.bind(this),
            spinner: false,
            alert: false,
            type: requestType,
            callBackParam: requestCallBackParam
        }
        API.queryAPI(queryObj)
    }



    updateAndGetTokenIfSyncFails() { }

    _returnObjType(objType, obj) {
        if (objType === "todo") return obj.todoId
        if (objType === "task") return obj.taskId
    }


    _generateMarkup() {
        return `
                <div class="sync-alert">
                    <div class="sync-msg">
                      It is adviced to save data now to prevent data Loss
                    </div>
                    <div class="sync-btns">
                      <button class="btn-sync btn-sync-now bd-radius">Sync Now</button>
                      <button class="btn-sync btn-sync-later bd-radius">Sync Later</button>
                    </div>
                </div>
            `
    }

    _removeNotifier() {
        const cls = this
        this._eventListeners.forEach(ev => this._component.removeEventListener(ev, cls._handleEvents))
        this._component.remove()
        this._syncNotifyActive = false;
    }

    remove() {
        this._removeNotifier()
        this._component = null
        delete this;
    }

}
export const importSyncLocalStorageToAPI = (() => new SyncLocalStorageToAPI());
