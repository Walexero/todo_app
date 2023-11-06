export const MUTATION_OBSERVER_TIMEOUT = 2;
export const MAX_LENGTH_INPUT_TEXT_WITHOUT_SPACE = 40;
export const MOBILE_MAX_SCREEN_SIZE = "(max-width: 450px)";
export const BASE_API_URL = `http://0.0.0.0:9090/api/` //`https://appistodo.ddns.net/api/`
export const CANNOT_UPDATE_COMPLETED_TASK =
    "You can't edit a completed task, you have to make it an active task to edit";

export const PASSWORD_NOT_MATCH_ERROR = "Passwords Do Not Match"
export const INVALID_EMAIL_ERROR = "Email Provided Is Invalid"
export const INVALID_NAME_FORMAT = "Space not Expected in Name Field"
export const DEFAULT_ALERT_TIMEOUT = 1;
export const DEFAULT_LOGIN_PAGE_TIMEOUT = 5;
export const DEFAULT_REQUEST_TIMEOUT = 5;
export const HTTP_400_RESPONSE_LOGIN_USER = "Email or Password Incorrect";
export const HTTP_400_RESPONSE_CREATE_USER = "Invalid Data Supplied";
export const HTTP_200_RESPONSE = {
    "login": ((placeholder) => "Authentication Successful")(), "create": ((placeholder) => "Account Created Successfully")(), "loadTodos": ((placeholder) => "Data Loading Completed")(), "updatePwd": ((placeholder) => "Password Changed Successfully")(), "updateInfo": ((placeholder) => "User Info Updated Successfully")(),
    "resetPwd": ((APIResp) => `${APIResp}\n Please fill in the form with the email details`),
    "resetConfirmPwd": ((APIResp) => APIResp),
} //if needed for other response, add here
export const ALERT_STATUS_ERRORS = [400, 401]
export const GENERIC_SUCCESS_ALERT = "Request completed Successfully"
