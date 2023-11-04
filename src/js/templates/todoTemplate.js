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
                  <!--  -->
                  <div class="td-render--body">
                    <div class="td-render--content">
                      <div class="td-render-component-title">
                        <div contenteditable="true" class="td-render-title" placeholder="Untitled"></div>
                      </div>
                      <div class="td-render-component-container">
                        <div class="td-render-component-container-content"></div>
                        <div class="add-td-component-content">
                          <span class="placeholder">+ Add content</span>
                        </div>
                        <div class="completed-td-component-content"></div>
                      </div>
                    </div>
                  </div>
                  <!-- <div class="td-update-info">
                    <div class="info-update-heading">

                      <h2>Update Your Info</h2>
                    </div>
                    <div class="info-update-content">
                      
                    </div>

                  </div> -->
                </div>   
              </div>
            </div>
            </div>
        `
    }
}