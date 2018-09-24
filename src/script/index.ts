import View, {ViewEvents} from './View';
import {readFile, saveFile} from './util';

const view = new View(document);

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
        saveFile(text, filename);
    } else {
        window.alert('Please provide a filename');
    }
});

view.addEventListener(ViewEvents.INSERT_TAB, (event: CustomEvent) => {
    const [cursorStart, cursorEnd] = view.getCursor();
    const text = view.getContent();

    if (cursorStart == cursorEnd) {
        // No selection
        const before = text.slice(0, cursorStart);
        const after = text.slice(cursorStart);
        const newPosition = cursorStart + 4;
        view.setContent(before + '    ' + after);
        view.setCursor(newPosition, newPosition);

    } else {
        // Selection
        const lines = text.split('\n');

        let position = 0;
        let newText = '';
        let tabsInserted = 0;

        lines.forEach(line => {
            const startPoint = position;
            const endPoint = position + line.length;
            const lineSelected = (endPoint >= cursorStart) && (startPoint <= cursorEnd);
            const isFinal = endPoint == text.length;

            if (lineSelected) {
                newText += ('    ' + line);
                tabsInserted++;
            } else {
                newText += line;
            }

            if (!isFinal) {
                newText += '\n';
            }

            position = endPoint + 1;
        });

        view.setContent(newText);
        view.setCursor(cursorStart, cursorEnd + (tabsInserted * 4));
    }
});

newFile();

view.setUIReady();