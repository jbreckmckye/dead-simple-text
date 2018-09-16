import Model from './Model';
import View, {ViewEvents} from './View';
import {readFile, saveFile} from './util';

const model = new Model();
const view = new View(document);

model.filename.subscribe(view.setFilenameText);
model.text.subscribe(view.setContent);

view.addEventListener(ViewEvents.OPEN_FILE, (event: CustomEvent<File>)=> {
    const file = event.detail;
    if (file) {
        readFile(file).then(data => {
            model.filename(file.name);
            model.text(data);
            view.focusContent();
        });
    }
});

view.addEventListener(
    ViewEvents.SAVE_FILE,
    ()=> saveFile(model.text(), model.filename())
);

model.filename('Dead Simple Text.txt');
model.text('');

view.setUIReady();