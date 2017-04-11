class AceEditor {
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
        this.component = new Component('ace-editor', elem, 'editor.html');
        this.component.initialized.then((el) => {
            this.editor = ace.edit(elem.querySelector('.editor'));
            this.editor.setTheme("ace/theme/twilight");
            this.editor.setOptions({
                maxLines: Infinity,
                autoScrollEditorIntoView: true
            });
            this.editor.session.setMode("ace/mode/javascript");
            if (src.length > 0) {
                this.setSrc(src).then((contents) => {  
                    this.editor.setValue(contents);
                });
            }
        });
    }

    remove() {
        this.editor.component.remove();
        this.editor.destroy();
    }

    setSrc(src) {
        return new Promise((resolve, reject) => {
            $.ajax({
                url: '/readings/' + src,
                success: function(s) {
                    resolve(s);
                }
            });
        });
    }
}