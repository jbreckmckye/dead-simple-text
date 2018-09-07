import View, {ViewEvents} from './View';
import {readFile, saveFile} from './util';

const view = new View(document);

let fileName = 'Dead Simple Text.txt';
let text = '';

function updateView() {
    view.setFilenameText(fileName);
    view.setContent(text);
}

view.addEventListener(ViewEvents.OPEN_FILE, (event: CustomEvent<File>)=> {
    const file = event.detail;
    if (file) {
        readFile(file).then(data => {
            fileName = file.name;
            text = data;
            updateView();
            view.focusContent();
        });  
    }
});

view.addEventListener(ViewEvents.SAVE_FILE, (event: CustomEvent) => {
    saveFile(text, fileName);
});

updateView();
view.setUIReady();