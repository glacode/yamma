## Changelog

### Version 0.0.8 (2023-10-19)

* CONTRIBUTING.md has been created out of README.md (now more concise)
* Now partially correct theory are supported (not yet complete)

### Version 0.0.9 (2023-11-11)

* A new parameter is supported, to control Compressed proofs creation
* Compressed proofs can now emulate those created by mmj2 (but alternative behavior are allowed)

### Version 0.0.10 (2023-11-14)

* A new 'Create Model' command has been added, enabling users to directly update the model for step suggestions from within the extension.

### Version 0.0.11 (2023-11-26)

* If the theory is invalid, a valid partial theory is loaded anyway: this allows for easier change of signature of existing theorems

### Version 0.0.12 (2024-02-24)

* Completion items now are not duplicated and sorted by the Wilson Score

* Removed erroneous empty line in compressed proof formatting (when the parenthesis closing the labels was the last character on its own line)

* Fixed issue with transformation being applied to hypotheses of existing theorems

### Version 0.0.13 (2024-03-03)

* Corrected the unification algorithm for Working Vars

* Resolved problems with proof generation occurring in specific cases where a variable was unified at the final step.

### Version 0.0.14 (2024-03-10)

* A couple of runtime errors have been fixed. These fixes enhance the stability and reliability of the extension.

### Version 0.0.15 (2024-12-19)

* improved error notification and diagnostics when loading .mmt files

* $getproof now also loads $d statements for the specified theorem

#### Fixed

* the multiple theory load problem has been fixed. ([#14](https://github.com/glacode/yamma/issues/14))

* minor bug fixes
