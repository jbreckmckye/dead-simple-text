import View, {ViewEvents} from './View';
import {readFile, saveFile, trimEnd} from './util';

const view = new View();

function newFile() {
    view.setFilenameText('Dead Simple Text.txt');
    view.setContent('');
}

view.addEventListener(ViewEvents.NEW_FILE, newFile);

view.addEventListener(ViewEvents.OPEN_FILE, (event: CustomEvent<File>)=> {
    const file = event.detail;
    if (file) {
        readFile(file).then(data => {
            view.setFilenameText(file.name);
            view.setContent(data);
            view.focusContent();
        });
    }
});

view.addEventListener(ViewEvents.SAVE_FILE, ()=> {
    const filename = view.getFilename();
    if (filename.length) {
        const text = view.getContent();
        const cleanedText = trimEnd(text);
        saveFile(cleanedText, filename);
    } else {
        window.alert('Please provide a filename');
    }
});

view.addEventListener(ViewEvents.INSERT_TAB, (event: CustomEvent) => {
    const [cursorStart, cursorEnd] = view.getCursor();
    const text = view.getContent();
    const tab = '    ';

    if (cursorStart == cursorEnd) {
        document.execCommand('insertText', undefined, tab);

    } else {
        // Selection
        const lines = text.split(/\r\n|\r|\n/);

        let newText = '';
        let lastLineEnd = 0;
        let tabsInserted = 0;

        for (let i = 0; i < lines.length; i++) {
            const start = lastLineEnd;
            const end = lastLineEnd + lines[i].length + 1;

            if (i > 0) {
                newText += '\n';
            }

            if (end > cursorStart && start < cursorEnd) {
                newText += tab;
            }

            newText += lines[i];
            lastLineEnd = end;
        }

        document.execCommand('selectAll');
        document.execCommand('insertText', undefined, newText);
        view.setCursor(0, 0);
    }
});

newFile();

view.setUIReady();