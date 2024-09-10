import trkl from 'trkl';

import {View} from "./View";
import {readFile, saveFile, toLines, trimEnd} from "./util";
import {LockStates, StorageLock} from "./storage";

export type UserEvents =
    | { key: '__INIT' }
    | { key: 'NEW_FILE' }
    | { key: 'OPEN_FILE', file: File }
    | { key: 'SAVE_FILE' }
    | { key: 'CHANGE_FILE_NAME', name: string }
    | { key: 'INSERT_TAB' }
    | { key: 'UNINSERT_TAB' }
    | { key: 'TEXT_CHANGE' }

export const DEAD_SIMPLE_TXT = 'Dead Simple Text.txt';

export const eventBus = trkl<UserEvents>({ key: '__INIT' });

export class State {
    constructor(private view: View, private storage: StorageLock) {
        eventBus.subscribe((event) => this.handleUserEvents(event), true);
        storage.state.subscribe((event) => this.handleStorageEvents(event), true);
    }

    private async handleUserEvents(event: UserEvents) {
        console.log('handle user event:', event)
        switch (event.key) {
            case 'NEW_FILE':
                this.storage.releaseLock();
                this.view.setFilenameText('untitled.txt');
                this.view.setContent('');
                break;

            case 'OPEN_FILE':
                this.storage.releaseLock();
                this.view.setFilenameText(event.file.name);
                this.view.setContent(await readFile(event.file));
                this.view.focusContent();
                break;

            case 'SAVE_FILE': {
                const filename = this.view.getFilename();
                if (filename.length) {
                    const text = this.view.getContent();
                    const trimmed = trimEnd(text);
                    saveFile(trimmed, filename);
                } else {
                    window.alert('Please provide a filename');
                }
                break;
            }

            case 'INSERT_TAB': {
                this.insertTab();
                break;
            }

            case 'UNINSERT_TAB':
                this.uninsertTab();
                break;

            case 'TEXT_CHANGE':
                if (this.storage.state() === LockStates.HAS_LOCK) {
                    this.storage.writeDocument(this.view.getContent());
                }
                break;

            case 'CHANGE_FILE_NAME': {
                // There are some rules for how we handle locks here:
                // - If the file is renamed from 'Dead Simple Text.txt', we release the lock and work on a fork
                // - If a file is renamed *to* 'Dead Simple Text.txt', we 'cancel' the rename
                if (this.storage.state() === LockStates.HAS_LOCK) {
                    if (event.name !== DEAD_SIMPLE_TXT) this.storage.releaseLock();
                } else {
                    if (event.name === DEAD_SIMPLE_TXT) this.view.setFilenameText('untitled.txt');
                }
                break;
            }
        }
    }

    private handleStorageEvents(event: LockStates) {
        console.log('handle storage event:', event);
        switch (event) {
            case LockStates.DISABLED:
                // Browser does not support web locks API:
            case LockStates.LOCK_REJECTED:
                // Another tab has the lock:
                window.setTimeout(() => {
                    // Timeout handles case where browser 'duplicate tab' is still manipulating the DOM
                    this.view.setFilenameText('untitled.txt');
                }, 10)
                break;

            case LockStates.HAS_LOCK:
                // We have the lock
                this.view.setFilenameText(DEAD_SIMPLE_TXT);
                this.view.setContent(this.storage.readDocument() || getInitJournal());
                break;
        }

        if (event !== LockStates.WAITING) {
            this.view.setUIReady();
        }
    }

    private insertTab(): void {
        const [cursorStart, cursorEnd] = this.view.getCursor();
        const text = this.view.getContent();
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
            this.view.setCursor(nextCursorStart, nextCursorEnd);
        }
    }

    private uninsertTab() {
        const [cursorStart, cursorEnd] = this.view.getCursor();
        const text = this.view.getContent();
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
            this.view.setCursor(nextCursorStart, nextCursorEnd);
        }
    }
}

function getInitJournal() {
    return [
        'Welcome to Dead Simple Text!',
        '',
        'This default document is your "journal", which is kept in sync with your browser storage. Any changes you make',
        `to "Dead Simple Text.txt" will be kept for your next visit.`,
        '',
        `If you change the document name (top right) you will begin working on a separate document; this won't be synced, but`,
        `you can download it using the Save button.`,
        '',
        'https://github.com/jbreckmckye/dead-simple-text'
    ].join('\n')
}