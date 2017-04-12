class AceEditor extends Component {
    constructor(elem, src = '') {
        if (!AceEditor.instances) {
            AceEditor.instances = [];
        }
        if (!document.getElementById(elem) && !(elem instanceof HTMLElement)) {
            $(elem).each(function(i, el) {
                AceEditor.instances.push(new AceEditor(el, src));
            });
            return;
        }
        super('ace-editor', elem, 'editor.html');

        /** {Object} Meta information about the file. */
        this.meta = {};

        /** {String} The filename to use. */
        this.src = src;

        setInterval(this.saveContents.bind(this), 1000 * 10);
        setInterval(this.run.bind(this), 1000 * 2);
    }

    /**
     * For the given src file, get the meta options.
     * @return {Promise} A promise that resolves with the meta file.
     */
    getMeta() {
        return new Promise((resolve, reject) => {
            if (this.lastMetaLookup && this.lastMetaLookup == this.src) {
                resolve(this.meta[this.src.split('/').slice(-1)]);
            } else {
                this.lastMetaLookup = this.src;
                $.ajax({
                    url: '/meta/' + this.src,
                    success: (meta) => {
                        try {this.meta = JSON.parse(meta);} catch(e) {console.log(e)}
                        resolve(this.meta[this.src.split('/').slice(-1)]);
                    }
                });
            }
        });
    }

    /**
     * Overrides the default initialization.
     */
    initialize() {
        this.editor = ace.edit(this.element.querySelector('.editor'));
        this.editor.setTheme("ace/theme/twilight");
        this.editor.setOptions({
            maxLines: Infinity,
            autoScrollEditorIntoView: true
        });
        this.editor.session.setMode("ace/mode/javascript");

        if (this.src.length > 0 && (!this.editorContents || 
            this.editorContents.length == 0)) {
            this.setSrc(this.src);
        }

        this.setupEvents();
    }

    /**
     * Removes the code editor.
     */
    remove() {
        super.remove();
        this.editor.destroy();
    }

    /**
     * Runs the code.  If it's a Node context, sends to the server for
     * processing.
     */
    run() {
        this.getMeta().then((meta) => {
            if (meta && meta.hasOwnProperty('target') && 
                meta.target == 'node') {
                    if (!this.runPromise) {
                        this.runPromise = new Promise((resolve, reject) => {
                            $.ajax({
                                url: '/run/' + this.src,
                                success: function(results) {
                                    resolve(results);
                                }
                            });
                        }).then((results) => {
                            this.model.outputFormatString = 
                                'Outputting Node.js Execution';
                            this.model.output = results;
                            this.runPromise = null;
                            this.render();
                        });
                    }
                } else {
                    this.model.outputFormatString = 'Outputting as HTML';
                    let value = this.editor.getValue().replace(/"/g, '\"');
                    this.model.output = value;
                    this.render();
                }
        });
    }

    /**
     * Saves the contents to the server.
     * @return {Promise} A promise that resolves with the filename the contents
     * saved to.
     */
    saveContents() {
        return new Promise((resolve, reject) => {
            $.ajax({
                url: '/save/' + this.src,
                data: this.editor.getValue(),
                method: 'post',
                success: (filename) => {
                    this.lastSaved = (new Date()).toString();
                    this.model.lastSavedString = 'Last saved ' +
                        this.lastSaved.toString();
                    this.render();
                    resolve(filename);
                }
            })
        });
    }

    /**
     * Sets the source file of the code editor.
     * @param {String} src The file to read into the editor.
     * @return {Promise} A promise that resolves when the file is read.
     */
    setSrc(src) {
        this.src = src;
        return new Promise((resolve, reject) => {
            $.ajax({
                url: '/readings/' + src,
                success: (contents) => {
                    this.editorContents = contents;
                    this.editor.setValue(contents);
                    this.getMeta();
                    resolve(contents);
                }
            });
        });
    }

    /**
     * Sets up events for this particular component.
     */
    setupEvents() {
        this.find('.save').click(function() {
            this.saveContents();
        }.bind(this))
    }
}