import { Context } from './context';

export function tab (ctx: Context) {
  const { editor } = ctx;

  const [ cursorStart, cursorEnd ] = editor.getCursor();
  const spaces = '    ';

  // Nothing selected - just insert a tab
  if (cursorStart === cursorEnd) {
    editor.insertText(spaces);
    return;
  }

  // Else - some text was selected

  const text = editor.getText();
  const lines = toLines(text);

  // Text is built iteratively
  let newText = '';

  // Keep track of where we are in array of chars
  let lastLineEnd = 0;

  // If we insert tabs (indenting), we'll need to know how many to update the selection
  let tabsInserted = 0;

  // However if the user started selecting a whole line, we don't want to indent their selection start
  let startOnLineBreak = false;

  for (let i = 0; i < lines.length; i++) {
    const start = lastLineEnd;
    const end = lastLineEnd + lines[i].length + 1;

    // Prepend a line break on lines after the first
    if (i > 0) {
      newText += '\n';
    }

    // If current line contains selected area, indent
    if (end > cursorStart && start < cursorEnd) {
      newText += spaces;
      tabsInserted++;
    }

    if (start == cursorStart) {
      startOnLineBreak = true;
    }

    newText += lines[i];
    lastLineEnd = end;
  }

  editor.replaceText(newText);

  // Update the selection area based on the constraints commented above
  // - Move cursor start UNLESS we started on line break
  // - Move cursor end based on spaces inserted
  const nextCursorStart = startOnLineBreak ? cursorStart : cursorStart + spaces.length;
  const nextCursorEnd = cursorEnd + (tabsInserted * spaces.length);

  editor.positionCursor(nextCursorStart, nextCursorEnd);
}

export function untab (ctx: Context) {
  const { editor } = ctx;

  const [ cursorStart, cursorEnd ] = editor.getCursor();
  const initialSpaces = /^    /g;

  // No selection - nothing to do
  if (cursorStart === cursorEnd) {
    return;
  }

  // Else - some selection

  const text = editor.getText();
  const lines = toLines(text);

  // New text is built iteratively
  let newText = '';

  // Keep track of where we are in the array of chars
  let lastLineEnd = 0;

  // If we remove spaces (unindenting) we'll want to update the selection position
  let spacesRemoved = 0;

  // If the selection starts on a new line, we won't update the selection start
  let startOnLineBreak = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const start = lastLineEnd;
    const end = lastLineEnd + line.length + 1;

    let lineTransformed = line;

    // Prepend a line break on lines after the first
    if (i > 0) {
      newText += '\n';
    }

    // Line contains the selection - perform unindent
    if (end > cursorStart && start < cursorEnd) {
      lineTransformed = line.replace(initialSpaces, '');
    }

    if (start == cursorStart) {
      startOnLineBreak = true;
    }

    newText += lineTransformed;
    spacesRemoved += (line.length - lineTransformed.length);
    lastLineEnd = end;

    editor.replaceText(newText);

    // Update the selection area
    // - Move it forward to account for removed spaces
    // - HOWEVER don't do this if selection began on line start
    const nextCursorStart = startOnLineBreak ? cursorStart : cursorStart - 4;
    const nextCursorEnd = cursorEnd - spacesRemoved;

    editor.positionCursor(nextCursorStart, nextCursorEnd);
  }
}

export function keep (ctx: Context) {
  const { dialog, editor, storage, toolbar } = ctx;

  const storedFile = storage.get('storedFile');
  const storedText = storage.get('storedText');

  if (storedFile && storedText) {
    const overwrite = dialog.confirm(`A document was stored already (${storedFile}) - replace?`);
    if (!overwrite) return;
  }

  const file = toolbar.getName();
  const text = editor.getText();

  storage.set('storedFile', file);
  storage.set('storedText', text);
}

function toLines(text: string) {
  return text.split(/\r\n|\r|\n/);
}
