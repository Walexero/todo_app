export class TodoTemplate {
    static template() {
        return `
            <div class="container">
                <header>
                  <nav class="navbar">
                    <p class="navbar-back--btn hidden">&lt;</p>
                    <p class="navbar-header-title">TD App</p>
                  </nav>
                </header>
            <!-- <main> -->
            <div class="row">
              <div class="td-row">
                <div class="td-component--container">
                  <div class="td-render-todo--add-btn">+ Add Todo</div>
                  <div class="component-container" id="component-container"></div>
                </div>
                <div class="td-render--container hidden mobile-nav--hidden">
                  <div class="td-render--body">
                    <form action="" id="addTaskForm">
                      <div class="td-render--content">
                        <div class="td-render-component-title">
                          <input
                            type="text"
                            class="td-render-title"
                            placeholder="Title"
                            name="form-title-td"
                          />
                          <!-- <label for="td-complete">Lorem, ipsum dolor.</label> -->
                        </div>
                        <div class="td-render-component-container">
                          <div class="td-render-component-container-content"></div>
                          <div class="add-td-component-content">
                            <span class="placeholder">+ Add content</span>
                          </div>
                          <div class="completed-td-component-content"></div>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
                <!-- </main> -->
            </div>
        `
    }
}