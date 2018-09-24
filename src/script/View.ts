export enum ViewEvents {
    NEW_FILE = 'new_file',
    OPEN_FILE = 'open_file',
    SAVE_FILE = 'save_file',
    INSERT_TAB = 'insert_tab',
    LENGTH_CHANGE = 'length_change'
}

/**
 * Abstracts over the DOM.
 * Might eschew this for a better pattern.
 */
export default class View {
    private toolbar: HTMLElement;
    private filename: HTMLInputElement;
    private fileNew: HTMLElement;
    private fileOpen: HTMLElement;
    private fileOpenHelper: HTMLInputElement;
    private fileSave: HTMLElement;
    private textarea: HTMLTextAreaElement;
    private textAreaChangeCallback: number | undefined;

    constructor(document: Document) {
        this.toolbar =      this.getEl('toolbar');
        this.filename =     this.getEl('filename') as HTMLInputElement;
        this.fileNew =      this.getEl('fileNew');
        this.fileOpen =     this.getEl('fileOpen');
        this.fileSave =     this.getEl('fileSave');
        this.textarea =     this.getEl('textarea') as HTMLTextAreaElement;

        this.fileOpenHelper = document.createElement('input');
        this.fileOpenHelper.type = 'file';
        this.fileOpenHelper.accept = '.css,.markdown,.md,.js,.json,.jsx,.scss,.svg,.ts,.tsx,.txt,.xml';

        this.addEvents();
    }

    public addEventListener = (eventKey: ViewEvents, listener: (event: CustomEvent) => void)=> {
        this.toolbar.addEventListener(eventKey, listener, false);
    };

    public focusContent = ()=> {
        this.textarea.focus();
    };

    public getContent = ()=> this.textarea.value;
    public getCursor = ()=> [this.textarea.selectionStart, this.textarea.selectionEnd];
    public getFilename = ()=> this.filename.value;
    public getCursorPosition = ()=> this.textarea.selectionStart;

    public removeEventListener = (eventKey: ViewEvents, listener: (event: CustomEvent) => void)=> {
        this.toolbar.removeEventListener(eventKey, listener);
    };

    public setContent = (text: string)=> {
        this.textarea.value = text;
    };

    public setCursor = (start: number, end: number) => {
        this.textarea.setSelectionRange(start, end);
    }

    public setFilenameText = (text: string)=> {
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
                this.dispatchEvent(ViewEvents.OPEN_FILE, this.fileOpenHelper.files[0])
            }
        }, false);

        this.fileSave.addEventListener('click', ()=> {
            this.dispatchEvent(ViewEvents.SAVE_FILE);
        });

        this.fileNew.addEventListener('click', ()=> {
            this.dispatchEvent(ViewEvents.NEW_FILE);
        });

        this.textarea.addEventListener('input', ()=> {
            if (!this.textChangedFlag) {
                this.textChangedFlag = true;
            }
        });

        this.textarea.addEventListener('keydown', (e: KeyboardEvent) => {
            // Trap tab
            if (e.key == 'Tab') {
                e.preventDefault();
                this.dispatchEvent(ViewEvents.INSERT_TAB);

            // Untrap tab
            } else if (e.key == 'F6') {
                e.preventDefault();
                this.fileNew.focus();
            }
        });
    }

    private dispatchEvent(eventKey: ViewEvents, data?: any) {
        const eventData = nonEmpty(data) ? {detail: data} : undefined;
        const event = new CustomEvent(eventKey, eventData);
        this.toolbar.dispatchEvent(event);
    }
}

function nonEmpty(subject: any) {
    return subject !== undefined && subject !== null;
}