export function dialogAdapter () {
  const dialog = {
    alert (message: string) {
      window.alert(message);
    },
    confirm (message: string) {
      return window.confirm(message);
    }
  };

  return {
    ctx: { dialog }
  };
}

export function editorAdapter () {
  const textarea = el('#textarea') as HTMLTextAreaElement;

  const editor = {
    focus () {
      textarea.focus();
    },
    getCursor () {
      return [ textarea.selectionStart, textarea.selectionEnd ];
    },
    getText () {
      return textarea.value;
    },
    positionCursor (start: number, end: number) {
      textarea.setSelectionRange(start, end);
    },
    insertText (text: string) {
      document.execCommand('insertText', undefined, text);
    },
    replaceText (text: string) {
      document.execCommand('selectAll');
      document.execCommand('insertText', undefined, text);
    },
    setText (text: string) {
      textarea.value = text;
    }
  };

  return {
    ctx: { editor }
  };
}

export function fileAdapter () {
  const anchor = document.createElement('a');

  const files = {
    read (file: File) {
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = err => reject(err);
        reader.readAsText(file);
      });
    },
    save (name: string, text: string) {
      const fileType = {
        type: 'text/plain;charset=utf-8'
      };

      const blob = new Blob([text], fileType);
      const objURL = URL.createObjectURL(blob);

      anchor.href = objURL;
      anchor.download = name;
      anchor.click();

      // Prevent memory leaks
      URL.revokeObjectURL(objURL);
    }
  };

  return {
    ctx: { files }
  };
}

export function storageAdapter () {
  const storage = {
    get (key: string) {
      return localStorage.getItem(key);
    },
    set (key: string, text: string) {
      localStorage.setItem(key, text);
    }
  };

  return {
    ctx: { storage }
  };
}

export function toolbarAdapter () {
  const filename = el('#filename') as HTMLInputElement;

  const toolbar = {
    getName () {
      return filename.value;
    },
    setName (name: string) {
      filename.value = name;
    }
  };

  return {
    ctx: { toolbar }
  };
}

function el (selector: string) {
  const result = document.querySelector(selector);
  if (!result) {
    throw new Error('Invariant - no element found for selector ' + selector);
  } else {
    return result;
  }
}