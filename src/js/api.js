import { timeout } from "./helper.js"
import { BASE_API_URL, HTTP_400_RESPONSE_LOGIN_USER, HTTP_200_RESPONSE, HTTP_400_RESPONSE_CREATE_USER } from "./config.js"
import { Loader } from "./components/loader.js"
import { Alert } from "./components/alerts.js"

// TODO: js docs for params

export class API {
    static APIEnum = {

        USER: {
            CREATE: "user/create/",
            GET: "user/me/",
            PUT: "user/me/",
            PATCH: "user/me/",
            TOKEN: "user/token/",
        },

        TODO: {
            CREATE: "todo/todos/",
            LIST: "todo/todos/",
            GET: ((todoId) => `todo/todos/${todoId}/`),
            PUT: ((todoId) => `todo/todos/${todoId}/`),
            PATCH: ((todoId) => `todo/todos/${todoId}/`),
            DELETE: ((todoId) => `todo/todos/${todoId}/`),
            BATCH_UPDATE: "todo/todos/batch_update/",

        },

        TASK: {
            CREATE: "todo/tasks/",
            LIST: "todo/tasks/",
            GET: ((taskId) => `todo/tasks/${taskId}/`),
            PUT: ((taskId) => `todo/tasks/${taskId}/`),
            PATCH: ((taskId) => `todo/tasks/${taskId}/`),
            DELETE: ((taskId) => `todo/tasks/${taskId}/`),
            BATCH_UPDATE: "todo/tasks/batch_update/",
        }
    }
    static timeout = 20 //timeout in 20s

    static createTodoPayload = {
        "title": ""
    }

    static getDefaultPayloadType(actionType) {
        switch (actionType) {
            case "createTodo":
                return API.createTodoPayload
                break;
        }
    }

    static queryAPI(queryObj) {
        //switch the timeout secs if null
        queryObj.sec = queryObj.sec ?? API.timeout
        //create the loader based on the queryObj
        API.loaderCreator(queryObj);

        (async () => await API.querier(queryObj))().then(returnData => {
            if (returnData) {
                queryObj.loader ? queryObj.loader.remove() : null
                queryObj.alert ? new Alert(HTTP_200_RESPONSE[queryObj.actionType], null, "success").component() : null
                if (queryObj.callBack) queryObj.callBack(returnData, queryObj.callBackParam ?? true)

                queryObj = {};
            }
        })
    }

    static async querier(queryObj) {
        let data = null;

        try {
            const res = await Promise.race([API.makeRequest(queryObj), timeout(queryObj.sec, queryObj.actionType)])

            const resContent = await res.json()

            if (!res.ok) throw new Error(`${res.status === 400 ? API.getResponseToRender(resContent, queryObj) : res.message} (${res.status})`)

            if (!resContent.non_field_errors) data = resContent
        } catch (err) {
            if (queryObj.loader) await queryObj.loader.remove()
            if (queryObj.alert) await new Alert(err.message, null, "error").component()
        } finally {
            return data
        }
    }

    static getResponseToRender(response, queryObj) {
        if (response.non_field_errors)
            return HTTP_400_RESPONSE_LOGIN_USER

        const formError = Object.getOwnPropertyNames(response)
        const formErrorsLength = Object.getOwnPropertyNames(response).length

        if (formErrorsLength > 0) return (() => {
            queryObj.callBack(response);
            return formErrorsLength === 1 ? response[formError[0]] : HTTP_400_RESPONSE_CREATE_USER
        })()
    }

    static loaderCreator(queryObj) {
        if (queryObj.spinner) {
            //add the loader to the queryObj
            queryObj.loader = new Loader(queryObj.sec)
            queryObj.loader.component();
        }
    }

    static makeRequest(queryObj) {
        switch (queryObj.type) {
            case "POST":
                return API.requestJSON(queryObj)
                break;
            case "PATCH":
                return API.requestJSON(queryObj)
            case "DELETE":
                return API.requestJSON(queryObj)
            case "PUT":
                return API.requestJSON(queryObj)
            case "GET":
                return API.requestJSON(queryObj)
            default:
                return fetch(`${BASE_API_URL}${queryObj.endpoint}`, queryObj.queryData)
                break;
        }
    }

    static requestJSON(queryObj) {
        const fetchParams = {
            method: queryObj.type,
            headers: {
                Authorization: `Token ${queryObj.token}`,
                "Content-Type": "application/json"
            },
        }
        if (queryObj.queryData) fetchParams.body = JSON.stringify(queryObj.queryData)

        return fetch(`${BASE_API_URL}${queryObj.endpoint}`, fetchParams)
    }
}