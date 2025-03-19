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

### Version 0.0.18 (2025-02-09)

#### Added
- **Support for unproven statements and warnings in `MmParser`**  
  - Introduced `MmParserWarningCode.unprovenStatement` to detect unproven statements (`$= ? $`).
  - Added the `containsUnprovenStatements` flag in `MmParser` to track theories with unproven statements.
  - Implemented `addDiagnosticWarning` to emit warnings for unproven statements during parsing.
  - Updated `TheoryLoader` to notify users when a theory contains unproven statements.

- **Support for the file inclusion command (Metamath Book, Section 4.1.2: 'Preprocessing')**  
  - Multiple `include` statements are supported, but each must be written on a single line (i.e., it cannot span multiple lines).  
  - Recursive file inclusion is supported.  
  - `.mm` tokens now retain information about the `.mm` file they originate from.  
  - Diagnostic errors and warnings are reported for each specific `.mm` file.

### Version 0.0.19 (2025-03-19)
#### Added
- **Automatic Generation of Disjoint Variable Constraints**: 
  - Introduced a new configuration option `yamma.disjVarAutomaticGeneration` in `package.json` to control the automatic generation of disjoint variable (`$d`) constraints. The available options are:
    - `GenerateNone`: No automatic generation of `$d` statements.
    - `GenerateDummy`: Automatically generates dummy `$d` statements for non-mandatory disjoint variable constraints (default configuration)
    - `GenerateAll`: Automatically generates all required `$d` statements, including mandatory ones.
- **Enhanced README.md Documentation**:
  - **Removed Node.js Prerequisite**: Updated the `README.md` to clarify that Node.js is not required for installation, as it was never a prerequisite.
  - Added **CTRL+R** shortcut for **Unify and Renumber** functionality.
  - Added **CTRL+SPACE** shortcut for **Step Suggestions**.
  - Included **animated GIFs** to demonstrate:
    - **Syntax Suggestions** feature.
    - **Step Suggestions** feature.

### Improve
- Diagnostic for missing $d statements is now divided in **mandatory** and **dummy**
  - Code actions are distinct for both cases
- Quick fixes now keep clearly separated newly generated $d statements 
- At the bottom of the proof, $d statements are **automatically classified in mandatory or dummy**
  - Within each group, $d statements are now reordered alphabetically
- Eliminated redundant $d constraints to improve consistency and readability of constraint declarations

### Fix
- Prevent multiple theory loads when mmFileFullPath is empty and the semantic tokenization is triggered while the TheoryLoader is still processing
- Fix **semantic tokenization** timing:
      - Perform semantic tokenization just after the theory is downloaded.
      - Ensure tokenization is correctly triggered when a tab is clicked.

### Performance
- **Optimized Test Suite Execution**: Introduced the `--runInBand` parameter to enhance performance by running tests sequentially, preventing resource depletion and improving stability during test execution.
- MmpParser.mandatoryVars is now computed once and cached
