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
    const text = view.getContent();
    view.setContent(text + '    ');
});

newFile();

view.setUIReady();