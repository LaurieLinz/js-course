/**
 * Class fetches a filename and stores it in a "ShadowDOM".  Allows the
 * component the be repeated.
 */
class Component {
    constructor(name, selector, src = '') {
        if ($(selector).length > 1) {
            $(selector).each(function(i, el) {
                new Component(name, el, src);
            });
            return;
        }

        Component.initialize(name, src).then((contents) => {
            this.contents = contents;
            this.element = document.createElement('div');
            this.element.innerHTML = this.contents;
            $(selector).append(this.element);
        });
        this.initialized = Component.promises[name];
    }

    static initialize(name, src = '') {
        if (!Component.promises) {
            Component.promises = {};
        }
        if (!Component.contents) {
            Component.components = {};
        }
        if (Component.components[name]) {
            return new Promise((resolve, reject) => {
                resolve(Component.components[name]);
            });
        }
        if (src.length > 0) {
            Component.promises[name] = (new Promise((resolve, reject) => {
                $.ajax({
                    url: src,
                    success: function(s) {
                        resolve(s);
                    }
                });
            }));
            Component.promises[name].then((contents) => {
                Component.components[name] = contents;
            });
        }
        return Component.promises[name];
    }
    
    /**
     * Removes the element from the DOM.
     */
    remove() {
        $(this.element).remove();
    }
}