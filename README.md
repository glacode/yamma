# Yamma

***Y***amma's ***a*** ***M***eta***m***ath proof ***a***ssistant for Visual Studio Code.

A language server for .mmp files (metamath proof files).

## Features

- __ Completions __: syntax suggestions, step suggestions, search results
- __ Diagnostics __
- __ Code Actions __
- __ Quick Fixes __: missing disjoint vars statements
- __ Semantic Tokenization __
- __ On Hover Documentation __
- __ Unification __: standard reformatting, renumbering, step completion, step derivation
- __ Search __ in the theory
- __ Step Suggestions __ (Model Based)
- __ Model Generation __
- __ Proof Generation __
- __ Load/Save additional __ theorems in .mm compatible format

## Prerequisites

To use this extension, you need to have Node.js installed on your machine. If Node.js is not yet installed, follow the official installation guide: [Node.js Installation Guide](https://nodejs.org).

## Installation

1. Launch Visual Studio Code.
2. Go to the Extensions view by clicking on the square icon on the left sidebar or pressing `Ctrl+Shift+X`.
3. Search for "Yamma" in the search bar.
4. Click on the "Install" button next to the "Yamma" extension.
5. After the installation, click on the "Reload" button to activate the extension.

## Usage

1. Open a .mmp file Visual Studio Code.
2. The extension will automatically detect the .mm file to be used as the underlying theory and it wull load it, parse it and verify it.
3. Use the command palette (`Ctrl+Shift+P` or `Cmd+Shift+P` on macOS) to access the available commands and features provided by the extension.
4. Utilize the Intellisense capabilities to get suggestions while writing your proofs.

## Contribute

First please ensure you have git, nodejs, and Visual Studio Code installed.  Then:

```
	git clone https://github.com/glacode/yamma.git
	cd yamma
	npm install
	code .
```
The final command opens Visual Studio Code, within it we can:

![Image](screenshots/launchClient.png)
1. From the side-bar on the far left, choose "Run and Debug".
2. Open the Run and Debug drop-down.
3. Choose "Launch Client" from the drop-down.
4. Press the play icon ("Start Debugging").

This runs a second instance of Visual Studio Code.  This instance is running the Yamma extension.  The first time in here we will want to open the settings and set a path to a valid .mm file.

![Image](screenshots/settings.png)
1. From the side-bar on the far left, choose "Manage".
2. From the menu this brings up, choose "Settings".
3. From the bottom of the list of settings, expand "Extensions".
4. From the list of extensions, click on "Yamma"
5. In the "Mm File Full Path" box, enter the full path to a valid .mm file.

Now when we have a .mmp file open in this instance of Visual Studio Code, Yamma provides the following keyboard commands (on a Mac we may need to use the command key rather than the CTRL key):

* CTRL+U Unify
* CTRL+H Search

