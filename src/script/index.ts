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

    if (cursorStart == cursorEnd) {
        document.execCommand('insertText', undefined, '    ');

    } else {
        // Selection
        const lines = text.split('\n');

        let position = 0;
        let newText = '';
        let tabsInserted = 0;

        lines.forEach(line => {
            const startCharPos = position;
            const endCharPos = position + line.length;
            const lineContainsSelection = (endCharPos >= cursorStart) && (startCharPos <= cursorEnd);
            const isLastLine = endCharPos == text.length;

            if (lineContainsSelection) {
                newText += ('    ' + line);
                tabsInserted++;
            } else {
                newText += line;
            }

            if (!isLastLine) {
                newText += '\n';
            }

            position = endCharPos + 1;
        });

        document.execCommand('selectAll');
        document.execCommand('insertText', undefined, newText);
        view.setCursor(cursorStart, cursorEnd + (4 * tabsInserted));
    }
});

newFile();

view.setUIReady();