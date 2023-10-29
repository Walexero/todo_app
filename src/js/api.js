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
        }
    }
    static timeout = 20 //timeout in 20s

    static queryAPI(endpoint, sec, actionType, queryData, callBack) {
        const loader = new Loader(sec)
        loader.component();

        (async () => await API.querier(endpoint, sec ?? API.timeout, actionType, queryData, loader, callBack))().then(returnData => {
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
            await loader.remove()
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

    // static getUserToken() {
    //     const token
    // }
}