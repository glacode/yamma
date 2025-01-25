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

### Version 0.0.16 (2025-01-01)

#### Added  

- **New Command**: "Remove unused statements" – Cleans up unused statements in a proof, making it easier to finalize. This command can also be used during proof construction, even if the proof is incomplete.  

#### Improved  

- **ProofStepDuplicateRemover**: Enhanced handling of duplicate proof steps, including those with labels.  
  - Duplicate steps are now removed unless:  
    1. The step is proven.  
    2. The preceding step with the same formula is unproven.  

#### Fixed  

- **.mm and .mmt Parsing**: Replaced residual `throw error` statements with `DiagnosticError`, preventing crashes and improving error reporting.  

- **Caching of Formulas with Working Variables**:  
  - Excluded formulas containing working variables from the cache to prevent invalid cache usage.  
  - This addresses issues caused by the unification algorithm modifying these formulas during operations.  

### Version 0.0.17 (2025-01-25)

#### Added
- A new diagnostic warning is added when a mmp proof step is justified using a label that refers to a statement with a 'new usage is discouraged' tag.
- Introduced the `$allowdiscouraged` directive in `.mmp` proofs.
  - Proofs containing this directive will bypass warnings when using labels tagged with 'new usage is discouraged.'
  - Proofs with the `$allowdiscouraged` directive will be generated if they are complete.
- The new diagnostic contains a 'Quick Fix' that automatically adds the $allowdiscouraged directive

#### Changed
- Proofs that use labels tagged as 'new usage is discouraged' are no longer generated, even if complete, unless the `$allowdiscouraged` flag is present.

#### Improved
- CompletionItems for step suggestions are now completely filtered on the server and additional client side filtering is disabled (previously, useful label suggestions were filtered out by VSCode, and not shown to the user)