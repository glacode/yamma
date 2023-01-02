# Yamma

***Y***amma's ***a*** ***M***eta***m***ath proof ***a***ssistant for Visual Studio Code.

A language server for .mmp files (metamath proof files).

## Functionality

This Language Server works for .mmp files.  It has the following language features:
- Completions
- Diagnostics
- Code Actions
- Quick Fixes
- Semantic Tokenization
- On Hover Documentation
- Unification (and Standard Reformatting)
- Search (in the theory)
- Step Suggestions (Model Based)
- Model Generation
- Load/Save additional theorems in .mm compatible format

## Getting started

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

