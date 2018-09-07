export enum ViewEvents {
    OPEN_FILE = 'open_file',
    SAVE_FILE = 'save_file'
}

/**
 * Abstracts over the DOM.
 * Might eschew this for a better pattern.
 */
export default class View {
    private toolbar: HTMLElement;
    private filename: HTMLElement;
    private fileOpen: HTMLElement;
    private fileOpenHelper: HTMLInputElement;
    private fileSave: HTMLElement;
    private textarea: HTMLTextAreaElement;

    constructor(document: Document) {
        this.toolbar = document.getElementById('toolbar')!;
        this.filename = document.getElementById('filename')!;
        this.fileOpen = document.getElementById('fileOpen')!;
        this.fileSave = document.getElementById('fileSave')!;
        this.textarea = document.getElementById('textarea') as HTMLTextAreaElement;

        this.fileOpenHelper = document.createElement('input');
        this.fileOpenHelper.type = 'file';
        this.fileOpenHelper.accept = '.css,.markdown,.md,.js,.json,.jsx,.scss,.svg,.ts,.tsx,.txt,.xml';

        this.addEvents();
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
    }

    private dispatchEvent(eventKey: ViewEvents, data?: object) {
        const eventData = data ? {detail: data} : undefined;
        const event = new CustomEvent(eventKey, eventData);
        this.toolbar.dispatchEvent(event);
    }

    public addEventListener = (eventKey: ViewEvents, listener: (event: CustomEvent) => void)=> {
        this.toolbar.addEventListener(eventKey, listener, false);
    };

    public focusContent = ()=> {
        this.textarea.focus();
    };

    public removeEventListener = (eventKey: ViewEvents, listener: (event: CustomEvent) => void)=> {
        this.toolbar.removeEventListener(eventKey, listener);
    };

    public setContent = (text: string)=> {
        this.textarea.value = text;
    };

    public setFilenameText = (text: string)=> {
        this.filename.innerText = text;
    };

    public setUIReady = ()=> {
        this.toolbar.classList.remove('toolbar--loading');
    };
}
