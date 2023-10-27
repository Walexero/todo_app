
class Overlay{
    constructor(html){
        this.hmtl = html
        this.positionEl = document.querySelector(".content");
    }

    _generateMarkup(){
        return `
            <div class="overlay">
                <div class="contrast">
                    
                </div>
                <div class="overlay-content">
                    
                </div>
            </div>
        `
    }

}