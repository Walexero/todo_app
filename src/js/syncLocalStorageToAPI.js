import { Loader } from "./components/loader.js";
import { ComponentMethods } from "./components/componentMethods.js";
import { delegateMatchTarget } from "./helper.js";
import { API } from "./api.js";

class SyncLocalStorageToAPI {
    _container = document.querySelector(".container .row")
    _modelState;
    _diffState;
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

    addModelData(modelState, diffState) {
        this._modelState = modelState
        this._diffState = diffState
    }

    _handleEvents(ev) {
        if (delegateMatchTarget(ev, "btn-sync-now")) _handleStartSync(ev)
        if (delegateMatchTarget(ev, "btn-sync-later")) this._removeNotifier()
    }

    _handleStartSync() {
        debugger;
        const pendingTodos = this._diffState.todoToCreate
        const pendingTasks = this._diffState.taskToCreate
        const pendingTodosToDelete = this._diffState.todoToDelete;
        const pendingTasksToDelete = this._diffState.taskToDelete;
        const pendingTodoToUpdate = this._diffState.todoToUpdate;
        const pendingTaskToUpdate = this._diffState.taskToUpdate;

        const createPendingTodos = []
        const createPendingTasks = []
        const createPendingTaskLinkedToAPITodo = []

        const createTodoPayload = []
        const createTaskPayload = []
        const createTodoToUpdatePayload = []
        const createTaskToUpdatePayload = []
        //TODO: write check to prevent looping through empty arrays

        //todo passes deleted check
        this._filterDeletedObjectsFromObjects(pendingTodos, pendingTodosToDelete, createPendingTodos, "todo")

        //task passes deleted check
        this._filterDeletedObjectsFromObjects(pendingTasks, pendingTasksToDelete, createPendingTasks, "task")

        //create todo payload
        if (pendingTodos.length > 0)
            createPendingTodos.forEach(todo => {
                //get todo from modelState
                const modelTodos = this._modelState.todo
                const todoModelIndex = this._modelState.todo.findIndex(modelTodo => modelTodo.todoId === todo.todoId)

                const todoBody = modelTodos[todoModelIndex].slice()

                //remove ids from todo and tasks
                delete todoBody.todoId
                todoBody.tasks.forEach(task => delete task.taskId)

                //add formatted data to todos to create
                createTodoPayload.push(todoBody)
            })

        //create todo to update payload
        if (pendingTodoToUpdate.length > 0)
            pendingTodoToUpdate.forEach(todo => {
                const todoToUpdateExistsInTodoToCreate = createPendingTodos.find(pendingTodo => pendingTodo.todoId === todo.todoId)
                const todoToUpdateExistsInTodoToDelete = pendingTodosToDelete.find(pendingTodoId => pendingTodoId === todo.todoId)

                const todoNotInOtherPendingTodos = todoToUpdateExistsInTodoToCreate < 0 && todoToUpdateExistsInTodoToDelete < 0

                if (todoNotInOtherPendingTodos) createTodoToUpdatePayload.push(todo)
            })


        //sort tasks which are not linked to todos to create
        if (pendingTasks.length > 0)
            pendingTasks.forEach(task => {
                const pendingTaskTodoExistsInPendingTodos = createPendingTodos.find(todo => todo.todoId === task.todoId)
                if (pendingTaskTodoExistsInPendingTodos < -1) createPendingTaskLinkedToAPITodo.push(task)
            })

        //task not linked to todos to create payload
        if (pendingTasks.length > 0)
            createPendingTaskLinkedToAPITodo.forEach(task => {
                //get todo from modelState
                const modelTodos = this._modelState.todo
                const todoModelIndex = this._modelState.todo.findIndex(modelTodo => modelTodo.todoId === task.todoId)
                const taskIndex = modelTodos[todoModelIndex].tasks.findIndex(modelTask => modelTask.taskId === task.taskId)
                const taskBody = modelTodos[todoModelIndex].tasks[taskIndex].slice()

                //remove id from task
                delete taskBody.taskId

                //add formatted data to tasks to create
                createTaskPayload.push(taskBody)

            })

        //sort tasks which are to be updated not in createPendingTaskLinkedToAPITodo Array
        if (pendingTaskToUpdate.length > 0)
            pendingTaskToUpdate.forEach(task => {
                const taskToUpdateExistsInTaskAPITodo = createPendingTaskLinkedToAPITodo.find(APITodoTask => APITodoTask.taskId === task.taskId)

                if (!taskToUpdateExistsInTaskAPITodo) createTaskToUpdatePayload.push(task)

            })
        //TODO: sort data ordering if missing edge cases
        //TODO: if sync request succeeds delete data from diffstate
        //TODO: if sync request fails, allow user access to local data
    }

    _filterDeletedObjectsFromObjects(object, deletedObjects, returnList, objectType) {
        if (object.length > 0)
            object.forEach(obj => {
                const pendingObjectToBeDeletedExists = deletedObjects.find(deletedObjId => deletedObjId === this._returnObjType(objectType, obj))
                if (!pendingObjectToBeDeletedExists) returnList.push(obj)
            })
    }

    _formatLocalDataBackToAPIData() {

    }

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
