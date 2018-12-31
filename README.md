# Dead Simple Text

Sometimes you just need plain text:

https://www.breck-mckye.com/dead-simple-text/

Dead Simple Text is a web-based text editor with minimalistic design inspired by MS DOS editors of old. It can open files from the user's filesystem and save them back to a user-specified downloads folder.

![image](https://user-images.githubusercontent.com/3148617/50551486-ef2fb200-0c78-11e9-84a8-b73da67f5a4e.png)

I wrote DST for fairly simple reasons: I wanted a cross-platform 'distraction free' text editor, and the ones that existed never quite satisfied me aesthetically.

## Usage
- `New` clears the workspace
- `Load` opens from the local machine
- `Save` saves to the downloads folder
- `TAB` indents the selection
- `SHIFT+TAB` unindents the selection
- `F6` untraps the tab key (for visually impaired users)

### Setting the save location
If you want to save a file to a location other than your 'downloads', you'll need to configure your browser to ask you for a location every time a website downloads anything. Unfortunately this option is all-or-nothing: if you want it, it'll affect other websites too.

In Chrome the config item is labelled _Ask where to save each file before downloading_.

### How do I set a filename?
The filename is in the top right - click to edit it.

## Building locally

`npm run build && npm run bundle`
