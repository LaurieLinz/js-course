/**
 * Renders a model onto a template literal string.  Renders the rendered text.
 */
function render(model, templateLiteral) {
    // declare the vars in function scope needed for our replacement
    for (let key in model) {
        let value;
        value = model[key];
        
        eval('var ' + key + ' = value; ');
    }
    
    return eval('String.raw`' + templateLiteral + '`');
}

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
        } else {
            selector = $(selector).get(0);
        }
        
        /** {HTMLElement} The parent node for this component. */
        this.parent = selector;
        
        Component.initialize(name, src).then(this.render.bind(this));

        /** {Promise} The promise that resolves when the component file is loaded */
        this.initialized = Component.promises[name];
        this.initialized.then(this.render.bind(this));
        
        /** {Object} The model to render the DOM with. */
        this.model = {};
        /** {Object} Internal model we check against. */
        this.__model__ = {};
    }

    /**
     * The default initialization function.  The component is constructed with
     * the new DOM node.
     */
    initialize() {

    }

    /**
     * Initializes the component by associating a component name with a file.
     * @param {String} name The name of the component.
     * @param {String} src The source file.
     */
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
     * For some HTML String, rebuilds the 
     * @param {String} htmlString The HTML document from which to build the path.
     * @param {Number} offset The offset from which to get the path.
     * @return {String} A path string.
     */
    static rebuildNode(htmlString, offset) {
        let substr = htmlString.substr(0, offset);
        let precedingElements = substr.match(/\<([^>]+)\>/g).reverse();
        let closedElements = substr.match(/\<\s?([/].+?)\>/g).reverse();
        // used in determining the nth number element
        let idx = {};
        // used in culling operations
        let closedStack = [];
        // used in determining the idx state of the closed element
        let currentClosedElement = 0;
        // the path array, rebuilt before returning
        let path = [];
        // the current element
        let element;
        // the number of closed elements between additions
        let closingElements = 0;
        for (let i = 0; i < precedingElements.length; i++) {
            element = precedingElements[i].match(/^\<\s*?\/*([^\>\s]+)/)[1];
            // console.info('current element', element, closedElements[currentClosedElement]);
            if (element == '!--' || 
                element == '!DOCTYPE') {
                // get those DOCTYPE's!
                continue;
            } else if (element == 'br' || 
                element == 'img' || 
                element == 'link' || 
                element == 'input' || 
                element == 'meta') {
                // get those self closers!  if we don't get them, this breaks everything!
                continue;
            } else if (precedingElements[i] == closedElements[currentClosedElement]) {
                // begin skip!  not part of our path
                currentClosedElement++; // bump!
                closedStack.push(element);
                closingElements++; // no longer adding for the moment
                continue;
            } else if (element == closedStack[closedStack.length - 1]) {
                closedStack.pop();
                if (!idx[element]) {
                    idx[element] = 0;
                }
                if (closingElements == 1) {
                    idx[element]++; // adding to our idx of our next add
                }
                closingElements--;
                continue;
            } else if (closingElements > 0) {
                if (precedingElements[i] == 
                    closedElements[currentClosedElement]) {
                    closedStack.pop();
                }
                continue;
            } else {
                // add to our path
                let identifier = '';
                if (closingElements > 0) {
                    console.warn('Currently closing elements, shouldn\'t be adding?');
                }
                if (typeof $ != 'undefined' && $(precedingElements[i]).attr('class')) {
                    identifier = '.' + 
                        $(precedingElements[i]).attr('class').split(' ')
                        .join('.');
                }
                if (!idx[element]) {
                    idx[element] = 0;
                }
                if (path.length > 0 &&
                    idx[path[path.length - 1].element]) {
                    path[path.length - 1].idx = 
                        idx[path[path.length - 1].element];
                }
                path.push({
                    element: element,
                    idx: 0,
                    identifier: identifier
                });
                idx = {};
            }
        }
        return path.reverse().reduce((str, cur, idx) => {
            if (idx > 0) {
                str += '>';
            }
            str += cur.element + ':eq(' + cur.idx + ')';
            return str;
        }, '');
    }

    /**
     * Rebuilds the DOM, rendering the DOM contents as a template literal.
     */
    render(contents) {
        let dirty, element, nextOffset, offset, offsets;
        if (contents) {
            this.contents = contents;
        } else {
            contents = this.contents;
        }
        
        dirty = [];
        // declare the vars in function scope needed for our replacement
        for (let key in this.model) {
            let value;
            if (typeof this.model[key] == 'string') {
                value = '"' + this.model[key] + '"';
            } else {
                value = this.model[key];
            }
            if (!this.__model__.hasOwnProperty(key) ||
                this.model[key] != this.__model__[key]) {
                    dirty.push(key);
                }
        }

        offsets = [];
        let itr = 0;
        contents = contents.replace(/\$\{(.*)\}/g, function(match, p1, offset) {
            let isDirty = false;
            for (let dirtyVar of dirty) {
                dirtyVar = dirtyVar.replace(/([\$\_])/g, '\\$1');
                let regex = new RegExp('(^|[\s\;])+(' + dirtyVar + 
                    ')([^\w\_\$]|$)+', 'g');
                if (p1.match(regex) != null) {
                    isDirty = true;
                }
            }
            if (isDirty) {
                offsets.push(offset + itr * 25); // fixed! fragile!
            }
            itr++;
            return '${eval("try {' + p1 + '} catch(e){\'\'}")}';
        });

        // we now have the contents, create the dummy element
        element = document.createElement('div');
        element.innerHTML = contents;

        if (!this.element) {
            this.element = document.createElement('div');
            this.contents = contents;
            this.element.innerHTML = render(this.model, this.contents);
            $(this.parent).append(this.element);
        } else {
            // update!
            for (let offset of offsets) {
                // rebuild the path for the offset where a replacement occurred
                let path = Component.rebuildNode(contents, 
                    offset);
                let query = $(this.element).find(path);
                if (query.length > 0) {
                    query.get(0).outerHTML = 
                        render(this.model, 
                            $(element).find(path).get(0).outerHTML);
                }
            }
        }
        
        this.__model__ = Object.assign({}, this.model);
        this.initialize();
    }
    
    /**
     * Removes the element from the DOM.
     */
    remove() {
        $(this.element).remove();
    }
}

if (typeof module != 'undefined' && module.exports) {
    module.exports = Component;
}