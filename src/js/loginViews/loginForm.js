
export class LoginForm{
    constructor(){

    }

    _generateMarkup(){
        return`
            <form action="" id="login-form">
                <div class="email-box form-box">
                    <input type="text" name="email" placeholder="email">
                </div>
                <div class="password-box form-box">
                    <input type="password" name="password" placeholder="password">
                </div>
                <button class="btn-login btn-submit">Submit</button>
            </form>

        `
    }
}