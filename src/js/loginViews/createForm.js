
export class CreateForm{
    constructor(){

    }

    _generateMarkup(){
        return `
            <form action="" id="create-form" class="form-class">
                <div class="first-name-box form-box">
                    <input type="text" name="first-name" placeholder="first name">
                </div>
                <div class="last-name-box form-box">
                    <input type="text" name="last-name" placeholder="last name">
                </div>
                <div class="email-box form-box">
                    <input type="text" name="email" placeholder="email">
                </div>
                <div class="password-box form-box">
                    <input type="password" name="password1" placeholder="password">
                </div>
                <div class="password-box form-box">
                    <input type="password" name="password2" placeholder="confirm password">
                </div>
                <button class="btn-login btn-submit">Submit</button>
            </form>
        `
    }
}