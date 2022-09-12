import { Grammar } from 'nearley';
import { DisjointVarMap } from './DisjointVarMap';
import { MmToken } from '../grammar/MmLexer';
import { MmParser } from './MmParser';
import { Statement, FHyp, EHyp, LabeledStatement } from "./Statements";


export class BlockStatement extends Statement {
    c: Set<string>;
    v: Set<string>;
    // disjVars: DisjVars;
    disjVars: DisjointVarMap;

    fHyps: FHyp[];
    // maps a variable to the label of the statement defining it
    //f_labels: Map<string, string>;
    eHyps: EHyp[];
    // maps a statement to its label
    //e_labels: Map<Statement, string>

    // this property contains locally scoped labeled statemens, that are $f and $e statements.
    // For the outermost block, this property is not used: for perfomance reason
    // it is used the labelToStatementMap of the parser
    labelToStatementMap: Map<string, LabeledStatement>;



    /**maps a variable to the FHyp assigning a typecode to the var*/
    varToFHypMap: Map<string, FHyp>;

    // maps a variable to its kind (also called typecode)
    varToKindMap: Map<string, string>;
    // varToKindMap is not strictly necessary for parsing/verifying, but it is used for performance improvement

    // contains the set of kinds defined by $f statements
    varKinds: Set<string> = new Set<string>();

    /** at the end of the .mm parsing, this property will be assigned with the generated grammar */
    grammar: Grammar | undefined;

    /** at the end of the .mm parsing, this property will be assigned with the MmParser that did the parsing */
    mmParser: MmParser | undefined;


    private _nextLabeledStatementNumber: number | undefined;
    get nextLabeledStatementNumber(): number {
        let nextNumber: number;
        if (this.ParentBlock == undefined)
            // this is the outermost block
            nextNumber = (<number>this._nextLabeledStatementNumber)++;
        else
            // this is not the outermost block
            nextNumber = this.ParentBlock.nextLabeledStatementNumber;
        return nextNumber;
    }
    // varKinds in not used for parsing, it is used for grammar generation

    //TODO use parentBlock? instead of | null (and remove all the "new" with null in the parameter)
    constructor(parentBlock?: BlockStatement, mmParser?: MmParser, comment?: MmToken[]) {
        super(parentBlock,comment);
        this.c = new Set();
        this.v = new Set();
        // this.disjVars = new Set();
        this.disjVars = new DisjointVarMap();
        this.fHyps = [];
        //this.f_labels = new Map();
        this.varToFHypMap = new Map<string, FHyp>();
        this.varToKindMap = new Map<string, string>();
        this.eHyps = [];
        this.labelToStatementMap = new Map<string, LabeledStatement>();

        if (parentBlock == undefined)
            // this is the outermost Block
            this._nextLabeledStatementNumber = 1;
        this.mmParser = mmParser;
        //this.e_labels = new Map()
    }

    isConstantAlreadyDefinedInScope(constant: string): boolean {
        let isAlreadyPresent = this.c.has(constant);
        if (!isAlreadyPresent && this.ParentBlock != null) {
            isAlreadyPresent = this.ParentBlock.c.has(constant);
        }
        return isAlreadyPresent;
    }

    isVariableAlreadyDefinedInScope(variable: string): boolean {
        let isAlreadyPresent = this.v.has(variable);
        if (!isAlreadyPresent && this.ParentBlock != null) {
            isAlreadyPresent = this.ParentBlock.v.has(variable);
        }
        return isAlreadyPresent;
    }

    // add a variable in the current block
    add_v(variable: string) {
        //const frame = this[this.length - 1]
        if (this.isConstantAlreadyDefinedInScope(variable)) {
            throw new Error("var already defined as const in scope");

        }
        //if (frame.v.has(variable)) {
        if (this.isVariableAlreadyDefinedInScope(variable)) {
            throw new Error("var already defined in scope");
        }
        this.v.add(variable);
    }

    add_d(statementContent: MmToken[]) {
        for (let i = 0; i < statementContent.length; i++) {
            for (let j = i + 1; j < statementContent.length; j++) {
                // const x = this.getFirst(statementContent[i].value, statementContent[j].value);
                // const y = this.getSecond(statementContent[i].value, statementContent[j].value);
                // this.disjVars.add(new DisjVarUStatement(x, y));
                this.disjVars.add(statementContent[i].value, statementContent[j].value);
            }
        }
    }

    //adds a constant to the current block
    add_c(constant: string): void {
        //const frame = this[this.length - 1]
        //        if (this.c.has(tok)) {
        if (this.ParentBlock != null)
            throw new Error("constants can only be defined in the outermost scope");

        if (this.isConstantAlreadyDefinedInScope(constant)) {
            throw new Error("const already defined in scope");

        }
        if (this.v.has(constant)) {
            throw new Error("const already defined as var in scope");
        }
        this.c.add(constant);
    }

    // add a variable-type (“floating”) hypothesis
    //addFHyp(variable: string, kind: string, label: string) {
    addFHyp(fHyp: FHyp) {

        if (!this.isVariableAlreadyDefinedInScope(fHyp.Variable)) {
            throw new Error("var in $f not defined:" + fHyp.Variable);
        }
        if (!this.isConstantAlreadyDefinedInScope(fHyp.Kind)) {
            throw new Error("kind in $f not defined:" + fHyp.Kind);
        }
        //const block = <BlockStatement>this.at(-1)
        //TODO you could check if a $f for this variable was already present (the spec says
        //a different typecode cannot be assigned, but it doesn't say that a $f statement
        //cannot appear twice, with the same typecode)
        this.varToFHypMap.set(fHyp.Variable, fHyp);
        this.fHyps.push(fHyp);
        //this.f_labels.set(fHyp.Variable, fHyp.Kind);
        this.varToKindMap.set(fHyp.Variable, fHyp.Kind);
        if (!this.varKinds.has(fHyp.Kind))
            this.varKinds.add(fHyp.Kind);
    }

    //#region lookup_d
    // private getFirst(x: string, y: string): string {
    //     if (x === y) {
    //         throw new Error("Two different variables are expexted");
    //     }
    //     let first = x;
    //     if (y < x) {
    //         first = y;
    //     }
    //     return first;
    // }
    // private getSecond(x: string, y: string): string {
    //     if (x === y) {
    //         throw new Error("Two different variables are expexted");
    //     }
    //     let second = y;
    //     if (y < x) {
    //         second = x;
    //     }
    //     return second;
    // }
    // returns true if the two variables are
    // declared disjoint in the current frame
    lookup_d(x: string, y: string): boolean {
        // let areDisjoint = false;
        // this.disjVars.forEach(djVar => {
        //     const first = this.getFirst(x, y);
        //     const second = this.getSecond(x, y);
        //     if (djVar.var1 === first && djVar.var2 === second) {
        //         areDisjoint = true;
        //         return true;
        //     }
        // });
        let areDisjoint = this.disjVars.containsDjContraint(x, y);
        if (!areDisjoint && this.ParentBlock != null)
            areDisjoint = this.ParentBlock.lookup_d(x, y);
        return areDisjoint;
    }
    //#endregion lookup_d


    lookup_v(variable: string): boolean {
        let isAlreadyPresent = this.v.has(variable);
        if (!isAlreadyPresent && this.ParentBlock != null) {
            isAlreadyPresent = this.ParentBlock.lookup_v(variable);
        }
        return isAlreadyPresent;
    }

    //#region get_mand_vars
    private addVar(tok: string, varArray: string[]): void {
        if (this.lookup_v(tok)) {
            // the current token in the assertion is a variable
            if (!varArray.includes(tok)) {
                varArray.push(tok);
            }
        }
    }

    get_mand_vars(statement: string[], eHyps: EHyp[]): string[] {
        const mand_vars: string[] = [];
        // adds the variables in the assertion
        statement.forEach(tok => {
            this.addVar(tok, mand_vars);

        });
        // adds the variables in any active $e statements
        eHyps.forEach(e_hyp => {
            e_hyp.Content.forEach(tok => {
                this.addVar(tok.value, mand_vars);
            });
        });
        return mand_vars;
    }
    //#endregion get_mand_vars

    //#region getDisjointVars
    //TODO check why _blockStatement is never used
    //TODO I originally added mandatory vars only, I don't know why (mmverify.py has a function add_d that adds all ordered pairs);
    //now I add also non mandatory vars
    // addDisjointVarsForSingleBlock(mand_vars: string[], _blockStatement: BlockStatement,
    addDisjointVarsForSingleBlock(
        // disjVars: Set<DisjVarUStatement>) {
        disjVars: DisjointVarMap) {
        // this.disjVars.forEach(disjVar => {
        //     if (mand_vars.includes(disjVar.var1) && mand_vars.includes(disjVar.var2)) {
        //         disjVars.add(disjVar);
        //     }
        // });
        this.disjVars.map.forEach((vars2: Set<string>, var1: string) => {
            vars2.forEach((var2: string) => {
                // if (mand_vars.includes(var1) && mand_vars.includes(var2)) {
                disjVars.add(var1, var2);
                // }
            });
        });
        return disjVars;
    }
    //returns the disjoint vars for the mandatory variables, only
    // getDisjointVars(mand_vars: string[]): DisjVars {
    // getDisjointVars(mand_vars: string[]): DisjointVarMap {
    getDisjointVars(): DisjointVarMap {
        // const disjVars = new Set<DisjVarUStatement>();
        const disjVars = new DisjointVarMap();
        // this.addDisjointVarsForSingleBlock(mand_vars, this, disjVars);
        this.addDisjointVarsForSingleBlock(disjVars);
        if (this.ParentBlock != undefined)
            // this.addDisjointVarsForSingleBlock(mand_vars, this.ParentBlock, disjVars);
            this.addDisjointVarsForSingleBlock(disjVars);
        return disjVars;
    }
    //#endregion getDisjointVars

    mandatoryEHyps(): EHyp[] {
        let retMandatoryEHyps: EHyp[] = this.eHyps;

        if (this.ParentBlock != undefined) {
            const mandatoryEHypsFromOuterBlocks: EHyp[] = this.ParentBlock.mandatoryEHyps();
            retMandatoryEHyps = mandatoryEHypsFromOuterBlocks.concat(retMandatoryEHyps);
        }

        return retMandatoryEHyps;
    }


    //#region mandatoryFHyps

    mandatoryFHyps(mandatoryVariables: string[]): FHyp[] {
        let retMandatoryFHyps: FHyp[] = [];
        // add mandatory fHyps from the current block
        //TODO this can be sped up with an auxiliary set of defined variables
        this.fHyps.forEach(fHyp => {
            if (mandatoryVariables.includes(fHyp.Content[1].value)) {
                retMandatoryFHyps.push(fHyp);
            }
        });
        // add mandatory fHyps from the parent block (and)
        if (this.ParentBlock != undefined) {
            const mandatoryFHypsFromOuterBlocks: FHyp[] =
                this.ParentBlock.mandatoryFHyps(mandatoryVariables);
            retMandatoryFHyps = mandatoryFHypsFromOuterBlocks.concat(
                retMandatoryFHyps);
        }
        return retMandatoryFHyps;
    }

    //TODO use this.varToFHypMap to drammatically speedup this method
    mandatoryFHypsRecursive(mandatoryVariables: string[]): FHyp[] {
        let retMandatoryFHyps: FHyp[] = [];
        // add mandatory fHyps from the current block
        //TODO this can be sped up with an auxiliary set of defined variables (but the order
        // must be preserver, see the comment below)
        // this.fHyps.forEach(fHyp => {
        //     if (mandatoryVariables.includes(fHyp.Content[1].value)) {
        //         retMandatoryFHyps.push(fHyp);
        //     }
        // });
        // the forEach commented below, should be much faster then the forEach above,
        // but it doesn't preserve the order. Consider using it with a subsequent sort
        mandatoryVariables.forEach((variable: string) => {
            const fHyp: FHyp | undefined = this.varToFHypMap.get(variable);
            if (fHyp != undefined)
                retMandatoryFHyps.push(fHyp);
        });
        // add mandatory fHyps from the parent block (and)
        if (this.ParentBlock != undefined) {
            const mandatoryFHypsFromOuterBlocks: FHyp[] =
                this.ParentBlock.mandatoryFHypsRecursive(mandatoryVariables);
            retMandatoryFHyps = mandatoryFHypsFromOuterBlocks.concat(
                retMandatoryFHyps);
        }
        return retMandatoryFHyps;
    }
    /** this version is faster then mandatoryFHyps, but the code is more complex, and
     * the gain doesn't seem to be worthwile, thus we keep using mandatoryFHyps, for the
     * time being
     */
    mandatoryFHypsFasterVersion(mandatoryVariables: string[]): FHyp[] {
        const retMandatoryFHyps: FHyp[] = this.mandatoryFHypsRecursive(mandatoryVariables);
        retMandatoryFHyps.sort((a: FHyp, b: FHyp) => a.statementNumber - b.statementNumber);
        return retMandatoryFHyps;
    }
    //#endregion mandatoryFHyps

    /**
     * returns an $f or an $e statement that was defined in the current
     * scope (but not in the outermost scope: those are handeled by
     * the parser, for better performance)
     * @param label 
     */
    getLabeledStatement(label: string): LabeledStatement | undefined {
        let labeledStatement: LabeledStatement | undefined = this.labelToStatementMap.get(label);
        if (labeledStatement == undefined && this.ParentBlock != undefined)
            labeledStatement = this.labelToStatementMap.get(label);
        // if (this.ParentBlock != null) {
        //     labeledStatement = this.labelToStatementMap.get(label);
        //     if (labeledStatement === undefined)
        //         labeledStatement = this.ParentBlock.getLabeledStatement(label);
        // }
        return labeledStatement;
    }

    /**
     * returns true if the given kind is "active" in the current block (or in its parent blocks)
     * @param kind 
     */
    hasKind(kind: string): boolean {
        let hasKind: boolean = this.varKinds.has(kind);
        if (!hasKind && this.ParentBlock != null)
            hasKind = this.ParentBlock.hasKind(kind);
        return hasKind;
    }

    /**
     * Returns the kind of the given variable.
     * @param variable 
     */
    kindOf(variable: string): string | undefined {
        let kind: string | undefined = this.varToKindMap.get(variable);
        if (kind === undefined && this.ParentBlock != null) {
            kind = this.ParentBlock.kindOf(variable);
        }
        return kind;
    }

    /**
     * given a set of vars, it returns an array of those vars, in RPN order
     * @param vars 
     */
    getVariablesInRPNorder(vars: Set<string>): string[] {
        const unsortedMap: Map<string, number> = new Map<string, number>();
        vars.forEach((variable: string) => {
            const fHyp: FHyp | undefined = this.varToFHypMap.get(variable);
            if (fHyp == undefined)
                // the current variable is not a variable in this block
                throw new Error("this method shoul always be invoked with a set of true variables");
            else
                // the current variable is actually a variable in this block
                unsortedMap.set(variable, fHyp.statementNumber);
        });
        const sortedMap: Map<string, number> = new Map([...unsortedMap.entries()].sort((a, b) => a[1] - b[1]));
        const arrayInRPNorder: string[] = Array.from(sortedMap.keys());
        return arrayInRPNorder;
    }

    // /**
    //  * Returns the kind of the given variable.
    //  * This method is not strictly needed, but it is used for performance improvement
    //  * 
    //  * @param variable variable for which the kind has to be returned
    //  */
    // kindOf(variable: string): string {
    //     resu
    // 	throw new Error('Method not implemented.');
    // }


}
