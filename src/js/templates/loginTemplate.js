export class LoginTemplate {
    static template() {
        return `
            <div class="content">
                <header>
                    <nav class="nav-links">
                        <div class="header-logo-box">
                            <h1 class="header-logo">Td App</h1>
                        </div>
                    </nav>
                </header>
                <div class="content-container">
                    <div class="row">
                        <div class="page-content">
                            <p class="page-content-text">
                                Get your todos in order,
                                seamlessly
                            </p>
                            <div class="cta-section">
                                <ul class="btn_list">
                                    <li class="btn_link btn-sm btn-login bd-radius">Login</li>
                                    <li class="btn_link btn-create bd-radius">Create Account</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `
    }
}