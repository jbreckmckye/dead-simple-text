export enum UIEvents {
    CLICK_TIMER = 'click_timer'
}

export default class UI {
    private toolbar: HTMLElement;
    private filename: HTMLElement;
    
    constructor(document: Document) {
        this.toolbar = document.getElementById('toolbar')!;
        this.filename = document.getElementById('filename')!;
        this.addEvents();      
    }

    private addEvents() {}

    private dispatchEvent(eventKey: UIEvents) {
        const event = new Event(eventKey);
        this.toolbar.dispatchEvent(event);
    }

    public subscribe(eventKey: UIEvents, listener: EventListener) {
        this.toolbar.addEventListener(eventKey, listener, false);
    }

    public unsubscribe(eventKey: UIEvents, listener: EventListener) {
        this.toolbar.removeEventListener(eventKey, listener);
    }

    public setFilenameText(text: string) {
        this.filename.innerText = text;
    }

    public setUIReady() {
        this.toolbar.classList.remove('toolbar--loading');
    }
}
