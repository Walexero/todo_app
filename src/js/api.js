import { timeout } from "./helper.js"
import { BASE_API_URL, HTTP_400_RESPONSE_LOGIN_USER, HTTP_200_RESPONSE, HTTP_400_RESPONSE_CREATE_USER } from "./config.js"
import { Loader } from "./components/loader.js"
import { Alert } from "./components/alerts.js"

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
            GET: ((todoId) => `todo/todos/${todoId}`),
            PUT: ((todoId) => `todo/todos/${todoId}`),
            PATCH: ((todoId) => `todo/todos/${todoId}`),
            DELETE: ((todoId) => `todo/todos/${todoId}`)
        },

        TASK: {
            CREATE: "todo/tasks/",
            LIST: "todo/tasks/",
            GET: ((taskId) => `todo/tasks/${taskId}`),
            PUT: ((taskId) => `todo/tasks/${taskId}`),
            PATCH: ((taskId) => `todo/tasks/${taskId}`),
            DELETE: ((taskId) => `todo/tasks/${taskId}`),
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
        }
    }

    static queryAPI(endpoint, sec, actionType, queryData, callBack, spinner = true) {
        const loader = API.loaderCreator(spinner, sec);

        (async () => await API.querier(endpoint, sec ?? API.timeout, actionType, queryData ?? API.getDefaultPayloadType(actionType), loader, callBack))().then(returnData => {
            if (returnData) {
                loader.remove()
                new Alert(HTTP_200_RESPONSE[actionType], null, "success").component()
                if (callBack) callBack(returnData, true)
            }
        })
    }

    static async querier(endpoint, sec, actionType, queryData, loader, callBack) {
        let data = null;

        try {
            const res = await Promise.race([fetch(`${BASE_API_URL}${endpoint}`, queryData), timeout(sec, actionType)])

            const resContent = await res.json()

            if (!res.ok) throw new Error(`${res.status === 400 ? API.getResponseToRender(resContent, callBack) : res.message} (${res.status})`)

            if (!resContent.non_field_errors) data = resContent
        } catch (err) {
            if (loader) await loader.remove()
            await new Alert(err.message, null, "error").component()
        } finally {
            return data
        }
    }

    static getResponseToRender(response, callBack) {
        if (response.non_field_errors)
            return HTTP_400_RESPONSE_LOGIN_USER

        const formError = Object.getOwnPropertyNames(response)
        const formErrorsLength = Object.getOwnPropertyNames(response).length

        if (formErrorsLength > 0) return (() => {
            callBack(response);
            return formErrorsLength === 1 ? response[formError[0]] : HTTP_400_RESPONSE_CREATE_USER
        })()
    }

    static loaderCreator(spinner, sec) {
        if (spinner) {
            const loader = new Loader(sec)
            loader.component();
            return loader
        }
    }

    static requestJSON(url, type, token, payload) {
        return fetch(url, {
            method: type,
            headers: {
                Authorization: "Bearer Token",
                "X-Custom-Header": token
            },
            body: payload
        })
    }

    // static getUserToken() {
    //     const token
    // }
}