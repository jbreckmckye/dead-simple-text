type LineTransformation = (lineText: string, index: number, inSelection: boolean) => string;

const fileType = {
    type: 'text/plain;charset=utf-8'
};

const anchor = document.createElement('a');

export function readFile(file: File): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = err => reject(err);
        reader.readAsText(file);
    });
}

export function saveFile(text: string, name: string) {
    const blob = new Blob([text], fileType);
    const objURL = URL.createObjectURL(blob);

    anchor.href = objURL;
    anchor.download = name;
    anchor.click();

    // Prevents memory leaks
    URL.revokeObjectURL(objURL);
}

export function trimEnd(text: string) {
    const trimPoint = text.match(/(\s)+$/g);
    if (trimPoint) {
        return text.substr(0, trimPoint.index);
    } else {
        return text;
    }
}

export function toLines(text: string) {
    return text.split(/\r\n|\r|\n/);
}