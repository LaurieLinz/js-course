/**
 * @class Controls the frontend.  Singleton.
 */
class ModuleFrontend extends Frontend {
    constructor() {
        if (ModuleFrontend.instance) {
            return ModuleFrontend.instance;
        }
        super();
        ModuleFrontend.instance = this;
        this.setupNav();
    }

    /**
     * Sets of navigation events, including click events.
     */
    setupNav() {
        this.router.on({}, () => {
            try {this.editor.remove();} catch(e) {console.log(e);}
            $('.content>div').attr('hidden', '');
            $('.content>iframe').css('display', 'block');
        });
        this.router.on({'page': 'week1'}, () => {
            this.changePage('http://mikewhitfield.org/javascript-week-1/');
        });
        this.router.on({'page': 'week2'}, () => {
            this.changePage('http://mikewhitfield.org/javascript-week-2/');
        });
        this.router.on({'page': 'week3-4'}, () => {
            this.changePage('http://mikewhitfield.org/javascript-week-3-4');
        });
        this.router.on({'page': 'week5-6'}, () => {
            this.changePage('http://mikewhitfield.org/javascript-week-5-6');
        });
    }
}