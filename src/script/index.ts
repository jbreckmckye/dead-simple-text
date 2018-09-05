import View, {ViewEvents} from './View';
import {readFile} from './util';

const view = new View(document);

view.addEventListener(ViewEvents.OPEN_FILE, (event: CustomEvent<File>)=> {
    const file = event.detail;
    if (file) {
        readFile(file).then(data => {
            view.setFilenameText(file.name);
            view.setContent(data);
            view.focusContent();
        });  
    }
})

view.setFilenameText('Dead Simple Text.txt');
view.setUIReady();