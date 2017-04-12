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
        /** {String} The filename to use. */
        this.src = src;

        setInterval(this.saveContents.bind(this), 1000 * 2);
    }

    /**
     * For the given src file, get the meta options.
     * @return {Promise} A promise that resolves with the meta file.
     */
    getMeta() {
        return new Promise((resolve, reject) => {
            $.ajax({
                url: '/meta/' + this.src,
                success: function(s) {
                    try {this.meta = JSON.parse(s);} catch(e) {}
                    resolve(this.meta);
                }
            });
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
    }

    /**
     * Removes the code editor.
     */
    remove() {
        super.remove();
        this.editor.destroy();
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
                success: (filename) => {
                    this.lastSaved = (new Date()).getTime();
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
}