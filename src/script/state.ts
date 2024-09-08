import trkl from 'trkl';

import { View } from "./View";
import { readFile, saveFile, toLines, trimEnd } from "./util";

export type UserEvents =
    | { key: 'NEW_FILE'}
    | { key: 'OPEN_FILE', file: File }
    | { key: 'SAVE_FILE' }
    | { key: 'INSERT_TAB' }
    | { key: 'UNINSERT_TAB' }

export const eventBus = trkl<UserEvents>({ key: 'NEW_FILE' });

export class State {
    constructor(private view: View) {
        eventBus.subscribe((event) => this.handleEvents(event), true);
        this.view.setUIReady();
    }

    private async handleEvents(event: UserEvents) {
        switch (event.key) {
            case 'NEW_FILE':
                this.view.setFilenameText('Dead Simple Text.txt');
                this.view.setContent('');
                break;
            case 'OPEN_FILE':
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