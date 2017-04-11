/**
 * @class Controls the frontend.  Singleton.
 */
class Frontend {
    constructor() {
        if (Frontend.instance) {
            return Frontend.instance;
        }
        Frontend.instance = this;
        this.router = new HashRouter();
        this.setupEvents();
        this.setupNav();
    }

    /**
     * Changes page to a name iframe window.
     * @param {String} url URL to change the iframe to.
     */
    changePage(url) {
        $('.content>iframe').attr('src', url);
    }

    /**
     * Given a filename, displays a module in the provided content space.
     * @param {String} file The file to display.
     */
    displayModule(file) {
        try {this.editor.remove();} catch(e) {console.log(e);}
        $('.content>iframe').css('display', 'none').attr('src', '');
        $('.content>div').css('height', 'auto').css('width', '100%');
        $('.content>div').removeAttr('hidden');
        $('body').css('overflow-y', 'auto');
        this.editor = new AceEditor($('.content>div').get(0), file);
        this.editor.component.initialized.then(() => {
            $('body').css('height', $(document.body).height() + 'px');
        });
    }

    /**
     * Sets up general events for listening.
     */
    setupEvents() {
        var self = this;
        $('iframe').on('load', function() {
            let observer;
            try {
                this.style.height =
                    this.contentWindow.document.body.offsetHeight + 'px';
                $('body').css('overflow-y', 'auto');
            } catch(e) {
                this.style.height = (document.body.offsetHeight - 
                    $('iframe').offset().top) + "px";
                $('body').css('overflow-y', 'hidden');
            }
            try {
                observer = new MutationObserver(() => {
                    try {
                        this.style.height =
                        this.contentWindow.document.body.offsetHeight + 'px';
                    } catch(e) { 
                        this.style.height = (document.body.offsetHeight - 
                            $('iframe').offset().top) + "px";
                        $('body').css('overflow-y', 'hidden');
                    }
                });
                observer.observe(this.contentWindow.document.body, {
                    'attributes': true,
                    'childList': true, 
                    'characterData': true,
                    'subtree': true
                });
            } catch(e) {
                this.style.height = (document.body.offsetHeight - 
                    $('iframe').offset().top) + "px";
                $('body').css('overflow-y', 'hidden');
            }
        });
    }

    /**
     * Sets of navigation events, including click events.
     */
    setupNav() {
        this.router.on({}, () => {
            $('iframe').one('load', function() {
                this.style.height = (document.body.offsetHeight - 
                    $('iframe').offset().top) + "px";
                $('body').css('overflow-y', 'hidden');
            });
        });
        this.router.on({'page': 'quiz1'}, () => {
            this.changePage('https://docs.google.com/forms/d/e/1FAIpQLSdKVApwuQjnD3auoJI8ESKtfS-w6PlCptSHTbkxNGyPH1Iv6A/viewform?usp=sf_link');
        });
        this.router.on({'page': 'quiz2'}, () => {
            this.changePage('https://docs.google.com/forms/d/e/1FAIpQLSdt06Q9VWQHuVUZCfk0fnhMb6InsBAcI3bDrFXcKiSmiqgNvA/viewform?usp=sf_link');
        });
        this.router.on({'page': 'module1'}, () => {
            this.changePage('module1.html');
        });
        this.router.on({'page': 'module2'}, () => {
            this.changePage('module2.html');
        });
        this.router.on({'page': 'module3'}, () => {
            this.changePage('module3.html');
        });
    }
}