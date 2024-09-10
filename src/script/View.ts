import { eventBus } from "./state";

export class View {
    private toolbar: HTMLElement;
    private filename: HTMLInputElement;
    private fileNew: HTMLElement;
    private fileOpen: HTMLElement;
    private fileOpenHelper: HTMLInputElement;
    private fileSave: HTMLElement;
    private textarea: HTMLTextAreaElement;
    private shiftOn: boolean;

    constructor() {
        this.toolbar =      this.getEl('toolbar');
        this.filename =     this.getEl('filename') as HTMLInputElement;
        this.fileNew =      this.getEl('fileNew');
        this.fileOpen =     this.getEl('fileOpen');
        this.fileSave =     this.getEl('fileSave');
        this.textarea =     this.getEl('textarea') as HTMLTextAreaElement;

        this.fileOpenHelper = document.createElement('input');
        this.fileOpenHelper.type = 'file';
        this.fileOpenHelper.accept = '.css,.markdown,.md,.js,.json,.jsx,.scss,.svg,.ts,.tsx,.txt,.xml';

        this.shiftOn = false;

        this.addEvents();
    }

    public focusContent = ()=> {
        this.textarea.focus();
    };

    public getContent = ()=> this.textarea.value;
    public getCursor = ()=> [this.textarea.selectionStart, this.textarea.selectionEnd];
    public getFilename = ()=> this.filename.value;
    public getCursorPosition = ()=> this.textarea.selectionStart;

    public setContent = (text: string) => {
        // Mutations here will break the textarea undo/redo stack.
        // Only use this when initialising a document. Otherwise, use document.execCommand.
        this.textarea.value = text;
    };

    public setCursor = (start: number, end: number) => {
        this.textarea.setSelectionRange(start, end);
    };

    public setFilenameText = (text: string) => {
        this.filename.value = text;
    };

    public setUIReady = ()=> {
        this.toolbar.classList.remove('toolbar--loading');
    };

    public textChangedFlag = false;

    private getEl(id: string) {
        const result = document.getElementById(id);
        if (!result) {
            throw new Error(`No element found for selector ${id}`);
        } else {
            return result;
        }
    }

    private addEvents() {
        this.fileOpen.addEventListener('click', ()=> {
            this.fileOpenHelper.click();
        }, false);

        this.fileOpenHelper.addEventListener('change', ()=> {
            if (this.fileOpenHelper.files) {
                eventBus({
                    key: 'OPEN_FILE',
                    file: this.fileOpenHelper.files[0],
                });
            }
        }, false);

        this.fileSave.addEventListener('click', ()=> {
            eventBus({ key: 'SAVE_FILE' });
        });

        this.fileNew.addEventListener('click', ()=> {
            eventBus({ key: 'NEW_FILE' });
        });

        this.filename.addEventListener('change', (e) => {
            const input = e.target as HTMLInputElement;
            eventBus({ key: 'CHANGE_FILE_NAME', name: input.value })
        })

        this.textarea.addEventListener('input', ()=> {
            if (!this.textChangedFlag) {
                this.textChangedFlag = true;
            }
        });

        this.textarea.addEventListener('keydown', (e: KeyboardEvent) => {
            // Trap tab
            if (e.key == 'Tab') {
                e.preventDefault();
                if (!this.shiftOn) {
                    eventBus({ key: 'INSERT_TAB' });
                } else {
                    eventBus({ key: 'UNINSERT_TAB' });
                }                

            // Untrap tab
            } else if (e.key == 'F6') {
                e.preventDefault();
                this.fileNew.focus();

            // Switch shift
            } else if (e.key == 'Shift') {
                // No prevent default
                this.shiftOn = true;
            }
        });

        this.textarea.addEventListener('keyup', (e: KeyboardEvent) => {
            // Switch shift
            if (e.key == 'Shift') {
                this.shiftOn = false;
            }
        });

        this.textarea.addEventListener('change', () => {
            eventBus({ key: 'TEXT_CHANGE' });
        })
    }
}
