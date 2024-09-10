# Dead Simple Text

Sometimes you just need plain text:

https://www.breck-mckye.com/dead-simple-text/

Dead Simple Text is a web-based text editor with minimalistic design inspired by MS DOS edit / QBASIC. It handles local
files and a single "journal" document kept in `localstorage`.

I wrote this for myself as an aid for writing notes, stories, blog posts etc. It's shared here in case anyone else 
would like to play with it.

![image](https://user-images.githubusercontent.com/3148617/50551486-ef2fb200-0c78-11e9-84a8-b73da67f5a4e.png)

I wrote DST for fairly simple reasons: I wanted a cross-platform 'distraction free' text editor, and the ones that 
existed never quite satisfied me in terms of design.

## User guide

By default, the app opens the "journal" document, `Dead Simple Text.txt`, which is synchronised with `localstorage`. If
you change the filename you fork a new, non-synchronised document.

- `New` clears the document
- `Load` opens a local text file
- `Save` downloads the text file
- `Help` goes here
- `TAB` indents the selection
- `SHIFT+TAB` un-indents the selection
- `F6` untraps the tab key (for accessibility)

### How do I set a filename?

The filename is in the top right - click to edit it.

## Building locally

`npm run build`

## License

Dead Simple Text is offered as open source software under the AGPL license. Copyright Jimmy Breck-McKye 2024