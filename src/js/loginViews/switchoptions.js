export class SwitchOption{

    _generateMarkup(){
        return `
            <div class="login-option">
                <div class="option-box login-box active">
                    <h2 class="login-heading option-heading">
                        Login
                    </h2>
                </div>
                <div class="option-box create-box inactive">
                    <h2 class="create-heading option-heading">
                        Sign Up
                    </h2>
                </div>
            </div>
        `
    }
}