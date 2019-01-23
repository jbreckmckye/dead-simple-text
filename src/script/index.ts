import View, {ViewEvents} from './View';
import {readFile, saveFile, trimEnd, toLines} from './util';

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
        const lines = toLines(text);

        let newText = '';
        let lastLineEnd = 0;
        let tabsInserted = 0;
        let startOnLineBreak = false;

        for (let i = 0; i < lines.length; i++) {
            const start = lastLineEnd;
            const end = lastLineEnd + lines[i].length + 1;

            if (i > 0) {
                newText += '\n';
            }

            if (end > cursorStart && start < cursorEnd) {
                newText += tab;
                tabsInserted++;
            }

            if (start == cursorStart) {
                startOnLineBreak = true;
            }

            newText += lines[i];
            lastLineEnd = end;
        }

        document.execCommand('selectAll');
        document.execCommand('insertText', undefined, newText);

        const nextCursorStart = startOnLineBreak 
            ? cursorStart 
            : cursorStart + tab.length;
        const nextCursorEnd = cursorEnd + (tabsInserted * tab.length);
        view.setCursor(nextCursorStart, nextCursorEnd);
    }
});

view.addEventListener(ViewEvents.UNINSERT_TAB, (event: CustomEvent) => {
    const [cursorStart, cursorEnd] = view.getCursor();
    const text = view.getContent();
    const initialSpaces = /^    /g;

    if (cursorStart != cursorEnd) {
        const lines = toLines(text);

        let newText = '';
        let lastLineEnd = 0;
        let spacesRemoved = 0;
        let startOnLineBreak = false;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const start = lastLineEnd;
            const end = lastLineEnd + line.length + 1;

            let lineTransformed = line;

            if (i > 0) {
                newText += '\n';
            }

            if (end > cursorStart && start < cursorEnd) {
                lineTransformed = line.replace(initialSpaces, '');
            }

            if (start == cursorStart) {
                startOnLineBreak = true;
            }

            newText += lineTransformed;
            spacesRemoved += (line.length - lineTransformed.length);
            lastLineEnd = end;
        }

        document.execCommand('selectAll');
        document.execCommand('insertText', undefined, newText);

        const nextCursorStart = startOnLineBreak
            ? cursorStart
            : cursorStart - 4;
        const nextCursorEnd = cursorEnd - spacesRemoved;
        view.setCursor(nextCursorStart, nextCursorEnd);
    }
});

newFile();
view.setUIReady();