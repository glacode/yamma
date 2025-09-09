import { Grammar, Parser } from 'nearley';
import { BlockStatement } from "./BlockStatement";
import { MmLexer, MmToken } from '../grammar/MmLexer';
import { InternalNode, ParseNode } from '../grammar/ParseNode';
import { concatWithSpaces, concatWithSpacesSkippingStart } from './Utils';
import { WorkingVars } from '../mmp/WorkingVars';
import { NonBlockStatement } from "./NonBlockStatement";
import { EventEmitter } from 'stream';

export interface FormulaNonParsableEventArgs {
    labeledStatement: LabeledStatement;
    parseResult: ParseResult;
}

export enum LabeledStatementEvents {
    // a $a or $e statement has a non parsable formula wrt the specific theory this event is raised by the
    // labeled statement when the parseNode is requested and it will not happen when the .mm file is parsed,
    // because it would slow down the .mm parsing too much; it will happen when the MmpParser will try to parse
    // an instance of the LabeledStatement in the .mmp file
    formulaNonParsable = 'formulaNonParsable'
}

// statements with a label; blocks and '$d' statements
// are NOT labeled

export type ParseResult = {
    parseNode?: ParseNode;
    parser: Parser;
    error?: Error;
};

export abstract class LabeledStatement extends NonBlockStatement {
    private readonly emitter = new EventEmitter();

    on = this.emitter.on.bind(this.emitter);
    emit = this.emitter.emit.bind(this.emitter);

    Label: string;

    private _parseNode: InternalNode | undefined;

    /** statement number for labeled statements */
    statementNumber: number;

    /** this is set to true when the formula is found to be non parsable
     * this avoids trying to parse it again and again: it's tried only once
     * and if it's not parsable, this is set to true and the parseNode is never set
     * (it remains undefined)
     */
    isFormulaMarkedAsNonParsable = false;

    public static parseString(formula: string, grammar: Grammar, workingVars: WorkingVars): ParseResult {
        let parseNode: ParseNode | undefined;
        grammar.lexer = new MmLexer(workingVars);
        const parser: Parser = new Parser(grammar);
        let error: Error | undefined;
        // Parse something!
        try {
            parser.feed(formula);
            parseNode = parser.results[0];
        } catch (err: any) {
            // this error could also happen when a 'weird' $e statement is present
            // even though the .mm file is valid;
            // it could also happen when a $a statement contains a non parsable formula (but the .mm file is still valid)
            // thus we don't throw an exception
            // (the caller should check for parseNode being undefined)
            console.log("Unexpected error! - parseStrArray : " + formula);
            error = err;
            // throw new Error("Unexpected error! - parseStrArray : " + formula);
        }
        return { parseNode, parser, error };
    }

    // parses a formula, without producing diagnostics
    // we invoke it with theory formulas, thus no error is expected
    // TODO Jul 6 2025: the above part of the comment is not accurate, because the theory formula might be invalid
    // for example, it could happen when a 'weird' $e statement is present even though the .mm file is valid
    // or it could happen when a $a statement contains a non parsable formula (but the .mm file is still valid)
    protected parseStrArray(theoryFormula: string[], grammar: Grammar, workingVars: WorkingVars): ParseNode | undefined {
        const formula: string = concatWithSpaces(theoryFormula);
        const parseResult: ParseResult = LabeledStatement.parseString(formula, grammar, workingVars);
        if (parseResult.error) {
            // notify the MmParser that a formula is not parsable
            // this will be handled by the DiagnosticEventHandler that will produce a diagnostic
            // (the .mm file is still valid, thus no exception is thrown)
            // this part of the code will be executed when a 'weird' $e statement is present
            // even though the .mm file is valid;
            // it could also happen when a $a statement contains a non parsable formula (but the .mm file is still valid)
            this.isFormulaMarkedAsNonParsable = true;
            const formulaNonParsableEventArgs: FormulaNonParsableEventArgs = { labeledStatement: this, parseResult: parseResult };
            this.emit(LabeledStatementEvents.formulaNonParsable, formulaNonParsableEventArgs);
        }
        return parseResult.parseNode;
    }

    public isParseNodeDefined(): boolean {
        const isDefined = !!this.parseNode;
        return isDefined;
    }

    public get parseNode(): InternalNode | undefined {
        if (this._parseNode == undefined && !this.isFormulaMarkedAsNonParsable)
            // this._parseNode = <InternalNode>this.parseStrArray(this.formula, grammar, new WorkingVars());
            this._parseNode = <InternalNode>this.parseStrArray(
                this.formula, this.outermostBlock!.grammar!, this.outermostBlock!.mmParser!.workingVars);
        return this._parseNode;
    }

    public setParseNode(parseNode: InternalNode) {
        this._parseNode = parseNode;
    }


    private _logicalVariables: Set<string> | undefined;

    public get logicalVariables(): Set<string> | undefined {
        if (this._logicalVariables == undefined && this.parseNode)
            // this._parseNode = <InternalNode>this.parseStrArray(this.formula, grammar, new WorkingVars());
            this._logicalVariables = this.parseNode.logicalVariables(this.outermostBlock!);
        return this._logicalVariables;
    }

    //#region parseNodeForSyntaxAxiom
    /**
     *
     * @param strToParse
     * @param grammar
     */
    parseForTypecode(typecode: string, strToParse: string, grammar: Grammar): InternalNode {
        let parseNode: ParseNode | undefined;
        grammar.lexer = new MmLexer(this.outermostBlock!.mmParser!.workingVars);
        grammar.start = typecode;
        const parser: Parser = new Parser(grammar);
        // Parse something!
        try {
            parser.feed(strToParse);
            parseNode = parser.results[0];
        } catch (error: any) {
            throw new Error("Unexpected error! - parseForTypecode typecode: " + typecode + " - strToParse:" + strToParse);
        }
        //TODO use a constant, instead
        grammar.start = "provable";
        return <InternalNode>parseNode;
    }
    /** this should be invoked for SyntaxAxioms. The first symbol is replaced by
     * the provable typecode and then the parse method is invoked
     */
    parseNodeForSyntaxAxiom(grammar: Grammar): InternalNode {
        if (this._parseNode == undefined) {
            const typecode: string = this.formula[0];
            //TODO it might be faster using a MmLexer that uses symbols directly (without creating the intermediate string)
            const strToParse: string = concatWithSpacesSkippingStart(1, this.formula);
            this._parseNode = <InternalNode>this.parseForTypecode(typecode, strToParse, grammar);
        }
        return this._parseNode;
    }
    //#endregion parseNodeForSyntaxAxiom
    constructor(public labelToken: MmToken, content: MmToken[], parentBlock: BlockStatement, comment?: MmToken[]) {
        super(content, parentBlock, comment);
        //public FileInfo File;
        //public int Line;
        //public int Column;
        //public int ByteOffset;
        this.Label = labelToken.value;
        this.statementNumber = parentBlock.nextLabeledStatementNumber;
    }
}
