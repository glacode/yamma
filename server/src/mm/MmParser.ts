import * as fs from 'fs';
import * as readline from 'readline';
import { BlockStatement } from "./BlockStatement";
import { Frame } from "./Frame";
import { AxiomStatement } from "./AxiomStatement";
import { ProvableStatement } from "./ProvableStatement";
import { LabeledStatement } from "./LabeledStatement";
import { AssertionStatement } from "./AssertionStatement";
import { TokenReader } from "./TokenReader";
import { Verifier } from "./Verifier";
import { MmToken } from '../grammar/MmLexer';
import { Grammar } from 'nearley';
import { GrammarManager } from '../grammar/GrammarManager';
import { Range } from 'vscode-languageserver-textdocument';
import { Connection, Diagnostic } from 'vscode-languageserver';
import { WorkingVars } from '../mmp/WorkingVars';
import { GlobalState } from '../general/GlobalState';
import { EHyp } from './EHyp';
import { FHyp } from './FHyp';
import * as events from 'events';
import { creaParseNodesInANewThread } from '../parseNodesCreatorThread/ParseNodesCreator';
import { EventEmitter } from 'stream';
import { IExtensionSettings } from './ConfigurationManager';


export enum MmParserErrorCode {
    varNotInActiveFStatement = "varNotInActiveFStatement",
    stackHasMoreThanOneItemAtEndOfProof = "stackHasMoreThanOneItemAtEndOfProof",
    assertionProvenDoesntMatch = "assertionProvenDoesntMatch",
    eHypDoesntMatchTheStackEntry = "eHypDoesntMatchTheStackEntry",
    missingDjVarsStatement = "missingDjVarsStatement",
    missingCloseParenthesisInPStatement = "missingCloseParenthesisInPStatement"
}

export enum MmParserEvents {
    newAxiomStatement = "newAxiomStatement",
    newProvableStatement = "newProvableStatement",
    parsingProgress = 'newParsingProgress'
}

export type AssertionParsedArgs = {
    labeledStatement: LabeledStatement,
    mmParser: MmParser
}

export type ParsingProgressArgs = {
    percentageOfWorkDone: number,
    connection: Connection
}

// Parser for .mm files
export class MmParser extends EventEmitter {
    //    blockStack: BlockStack
    outermostBlock: BlockStatement
    labelToStatementMap: Map<string, LabeledStatement>;  // maps each label to its statement

    /** it will contain a map to assertions that are NOT for syntax expression */
    labelToNonSyntaxAssertionMap: Map<string, AssertionStatement>;
    lastComment: string;
    isParsingComplete = false;

    diagnostics: Diagnostic[] = [];

    parseFailed: boolean;  // true iff parsing/validation fails

    // progressListener?: (percentageOfWorkDone: number) => void;

    private _grammar: Grammar | undefined;
    private _percentageOfWorkDone: number;

    /** it will be set by the theory loader, when all theory parse nodes will
     * be ready
     */
    areAllParseNodesComplete: boolean;

    public get grammar() {
        if (this._grammar == undefined)
            this._grammar = GrammarManager.CreateGrammar(this.labelToStatementMap, this.workingVars);
        return this._grammar;
    }

    private _workingVars: WorkingVars | undefined;

    //TODO now we are passing working vars defined in the configuration file, but in the future
    //this could/should be driven from $j comments in the theory itself
    /** returns the WorkingVars class for this theory */
    public get workingVars(): WorkingVars {
        if (this._workingVars == undefined) {
            let kindToPrefixMap: Map<string, string> = new Map<string, string>();
            const lastFetchedSettings: IExtensionSettings | undefined = this.globalState?.lastFetchedSettings;
            if (lastFetchedSettings != undefined && lastFetchedSettings.variableKindsConfiguration != undefined)
                kindToPrefixMap = WorkingVars.getKindToWorkingVarPrefixMap(lastFetchedSettings.variableKindsConfiguration);
            // GlobalState.lastFetchedSettings.variableKindsConfiguration.forEach((variableKindConfiguration: IVariableKindConfiguration,
            //     kind: string) => {
            //     kindToPrefixMap.set(kind, variableKindConfiguration.workingVarPrefix);
            // });
            this._workingVars = new WorkingVars(kindToPrefixMap);
        }
        return this._workingVars;
    }

    constructor(private globalState?: GlobalState) {
        super();
        this.outermostBlock = new BlockStatement();
        this.labelToStatementMap = new Map<string, LabeledStatement>();
        this.labelToNonSyntaxAssertionMap = new Map<string, AssertionStatement>();
        this.lastComment = "";
        this.parseFailed = false;
        this.areAllParseNodesComplete = false;
        this._percentageOfWorkDone = 0;
    }

    //#region Parse

    private fail(message: string) {
        this.parseFailed = true;
        throw new Error(message);
    }

    private addDiagnosticError(message: string, range: Range, code: MmParserErrorCode) {
        const diagnostic: Diagnostic = {
            message: message,
            range: range,
            code: code
        };
        this.diagnostics.push(diagnostic);
        this.parseFailed = true;
    }

    //#region buildLabelToStatementMap
    private notifyProgressIfTheCase(tokenReader: TokenReader) {
        const percentageOfWorkDone: number = Math.trunc((tokenReader.indexForNextToken * 100)
            / tokenReader.tokens.length);
        if (this._percentageOfWorkDone < percentageOfWorkDone) {
            this._percentageOfWorkDone = percentageOfWorkDone;
            // console.log(percentageOfWorkDone + '%');
            // if (this.progressListener != undefined)
            //     this.progressListener(percentageOfWorkDone);
            if (this.globalState?.connection != undefined) {
                const parsingProgressArgs: ParsingProgressArgs = {
                    percentageOfWorkDone: percentageOfWorkDone,
                    connection: this.globalState.connection
                };
                this.emit(MmParserEvents.parsingProgress, parsingProgressArgs);
            }
        }
    }
    private readComment(tokenValue: string, toks: TokenReader) {
        let comment = "";
        let token: MmToken | undefined;
        while (tokenValue != "$)") {
            comment = comment + " " + tokenValue;
            token = toks.Read();
            if (token == undefined)
                this.fail('The file has ended before the comment was closed!');
            else
                tokenValue = token.value;
        }
        this.lastComment = comment;
    }
    private addFStatement(label: MmToken | undefined, toks: TokenReader, currentBlock: BlockStatement) {
        const statementContent = toks.readstat();
        if (label === undefined) {
            this.fail('$f must have label');
        } else if (statementContent.length !== 2) {
            this.fail("$f must have length 2");
        } else {
            const fHyp: FHyp = new FHyp(label.value, statementContent, currentBlock);
            //currentBlock.add_f(statementContent[1], statementContent[0], label)
            currentBlock.addFHyp(fHyp);
            //this.labelToStatementMap.set(label, new FHyp(label, statementContent, currentBlock))
            currentBlock.labelToStatementMap.set(label.value, fHyp);
            //TODO try to remove this.labelToStatementMap and use the outermost scope, instead
            if (currentBlock.ParentBlock == null)
                // the current block is the outermost scope
                this.labelToStatementMap.set(label.value, fHyp);
            // else
            //     // the current block is not the outermost scope
            //     currentBlock.labelToStatementMap.set(label.value, fHyp);
            label = undefined;
        }
    }

    // Implements the control required by the spec in the Metamath book P. 114:
    // "Each variable in a $e, $a, or $p statement must exist in an active $f statement"
    // see also this discussion in the forum:
    // https://groups.google.com/g/metamath/c/PAm7YQb2qkw/m/OcDhSoCFAgAJ
    checkEveryVarIsInActiveFStatement(statementContent: MmToken[], currentBlock: BlockStatement) {
        statementContent.forEach(token => {
            const symbol: string = token.value;
            if (currentBlock.v.has(symbol) && currentBlock.kindOf(symbol) === undefined) {
                // symbol is a variable, but it's not defined in an active $f statement
                const message = `The variable '${symbol}' does not appear  in an active $f statement`;
                const range: Range = token.range;
                const code = MmParserErrorCode.varNotInActiveFStatement;
                this.addDiagnosticError(message, range, code);
                this.fail(message);
            }
        });
    }
    addAStatement(label: MmToken | undefined, toks: TokenReader, currentBlock: BlockStatement) {
        if (label === undefined)
            this.fail('$a must have label');
        else {
            const statementContent = toks.readstat();
            this.checkEveryVarIsInActiveFStatement(statementContent, currentBlock);
            const statement: AxiomStatement = new AxiomStatement(label.value, statementContent, currentBlock, toks.lastComment);
            Frame.createFrame(statement);
            currentBlock.labelToStatementMap.set(label.value, statement);
            this.labelToStatementMap.set(label.value, statement);
            if (!GrammarManager.isSyntaxAxiom2(statement))
                this.labelToNonSyntaxAssertionMap.set(label.value, statement);
            label = undefined;
            const newAssertionParams: AssertionParsedArgs = {
                labeledStatement: statement,
                mmParser: this
            };
            this.emit(MmParserEvents.newAxiomStatement, newAssertionParams);
        }
    }
    addEStatement(label: MmToken | undefined, toks: TokenReader, currentBlock: BlockStatement) {
        if (label === undefined)
            this.fail("$e must have label");
        else {

            const statementContent = toks.readstat();
            this.checkEveryVarIsInActiveFStatement(statementContent, currentBlock);
            const statement: EHyp = new EHyp(label.value, statementContent, currentBlock, toks.lastComment);
            currentBlock.eHyps.push(statement);
            currentBlock.labelToStatementMap.set(label.value, statement);
            // if (currentBlock.ParentBlock == null)
            //     this.labelToStatementMap.set(label.value, statement);
            // else
            //     // the current block is not the outermost scope
            //     currentBlock.labelToStatementMap.set(label.value, statement);
            currentBlock.labelToStatementMap.set(label.value, statement);
            this.labelToStatementMap.set(label.value, statement);
            label = undefined;
        }
    }
    addPStatement(label: MmToken | undefined, toks: TokenReader, currentBlock: BlockStatement) {
        if (label === undefined)
            this.fail('$p must have label');
        else {
            const statementContent = toks.readstat();
            const statementContentStrings = MmToken.fromTokensToStrings(statementContent);
            const i: number = statementContentStrings.indexOf('$=');
            if (i === -1)
                // statementContent doesn't contain '$='
                this.fail('$p must contain proof after $=');
            else {
                const proof = statementContentStrings.slice(i + 1);
                const statement: ProvableStatement =
                    new ProvableStatement(label.value, statementContent, currentBlock, toks.lastComment);
                Frame.createFrame(statement);
                const verifier: Verifier = new Verifier(this.diagnostics);
                verifier.verify(statement, proof, this.labelToStatementMap);
                this.parseFailed ||= verifier.verificationFailed;

                this.labelToStatementMap.set(label.value, statement);
                if (!GrammarManager.isSyntaxAxiom2(statement))
                    this.labelToNonSyntaxAssertionMap.set(label.value, statement);
                label = undefined;
                const newAssertionParams: AssertionParsedArgs = {
                    labeledStatement: statement,
                    mmParser: this
                };
                this.emit(MmParserEvents.newProvableStatement, newAssertionParams);
            }
        }
    }
    buildLabelToStatementMap(toks: TokenReader, currentBlock?: BlockStatement) {
        //TODO prova a valutare di evitare d'usare BlockStack
        //const currentBlock = new BlockStatement(this.outermostBlock.last())
        //this.outermostBlock.push(currentBlock)
        let label: MmToken | undefined = undefined;
        let tok = toks.Readc();
        if (currentBlock === undefined)
            currentBlock = this.outermostBlock;
        while (tok !== undefined && tok.value !== '$}' && !this.parseFailed) {
            this.notifyProgressIfTheCase(toks);
            // tok is not an end of block
            switch (tok.value) {
                case '$(': {
                    this.readComment(tok.value, toks);
                }
                    break;
                case '$c': {
                    const statement = toks.readstat();
                    for (const mmconst of statement) {
                        currentBlock.add_c(mmconst.value);
                    }
                    break;
                }
                case '$v': {
                    const statement = toks.readstat();
                    for (const mmvar of statement) {
                        currentBlock.add_v(mmvar.value);
                    }
                    break;
                }
                case '$f': {
                    this.addFStatement(label, toks, currentBlock);
                    break;
                }
                case '$a': {
                    this.addAStatement(label, toks, currentBlock);

                    break;
                }
                case '$e': {
                    this.addEStatement(label, toks, currentBlock);
                    break;
                }
                case '$p': {
                    this.addPStatement(label, toks, currentBlock);
                    break;
                }
                case '$d': {
                    const statementContent = toks.readstat();
                    // const statement: DisjointStatement =
                    //     new DisjointStatement(statementContent, currentBlock);
                    currentBlock.add_d(statementContent);
                    break;
                }
                case '${': {
                    const subBlock = new BlockStatement(currentBlock);
                    this.Parse(toks, subBlock);
                    break;
                }
                default:
                    if (tok.value.substring(0, 0) !== "$")
                        label = tok;
                    else
                        this.fail('"Unexpexcted token: " + tok');
                    break;
            }
            tok = toks.Readc();
        }
    }
    //#endregion buildLabelToStatementMap

    Parse(tokenReader: TokenReader, currentBlock?: BlockStatement) {
        // this.isParsingComplete = false;
        this.buildLabelToStatementMap(tokenReader, currentBlock);
        // this.isParsingComplete = true;
        // this.buildGrammar(this.labelToStatementMap);
    }
    //#endregion Parse

    // the async version. It works fine, but I'm not using
    // it anymore, I'm using ParseFileSync, instead
    ParseFileAsync(localFileName: string) {
        (async function processLineByLine(parser: MmParser) {
            try {
                const rl = readline.createInterface({
                    input: fs.createReadStream(localFileName),
                    crlfDelay: Infinity
                });

                const fileLines: string[] = [];

                rl.on('line', (line) => {
                    fileLines.push(line);
                });

                await events.EventEmitter.once(rl, 'close');

                console.log('Reading file line by line with readline done.');
                const used = process.memoryUsage().heapUsed / 1024 / 1024;
                console.log(`The script uses approximately ${Math.round(used * 100) / 100} MB`);

                console.log("inizio parsing: " + new Date());
                const toks = new TokenReader(fileLines);

                // const outermostBlock: BlockStatement = new BlockStatement(undefined, parser);

                parser.isParsingComplete = false;
                parser.outermostBlock.mmParser = parser;
                parser.Parse(toks, parser.outermostBlock);
                parser.isParsingComplete = true;

                console.log("fine parsing: " + new Date());


            } catch (err) {
                console.error(err);
            }
        })(this);
    }

    //#region ParseFileSync

    // the synchronous version of ParseFile
    private parseLines(fileLines: string[]) {
        const toks = new TokenReader(fileLines);
        this.isParsingComplete = false;
        this.outermostBlock.mmParser = this;
        this.Parse(toks, this.outermostBlock);
        this.outermostBlock.grammar = this.grammar;
        this.isParsingComplete = true;
    }

    ParseFileSync(localFileName: string) {
        try {


            const fileLines: string[] = fs.readFileSync(localFileName, 'utf-8')
                .split('\n');

            console.log('Reading file line by line with readline done.');
            const used = process.memoryUsage().heapUsed / 1024 / 1024;
            console.log(`The script uses approximately ${Math.round(used * 100) / 100} MB`);

            console.log("inizio parsing: " + new Date());

            this.parseLines(fileLines);


            console.log("fine parsing: " + new Date());


        } catch (err) {
            console.error(err);
        }
    }
    //#endregion ParseFileSync

    // parses a text: useful for testing
    ParseText(text: string) {
        const fileLines: string[] = text.split('\n');
        this.parseLines(fileLines);
    }

    //#region createParseNodesForAssertions

    public createParseNodesForAssertionsAsync() {
        if (this.isParsingComplete && !this.parseFailed)
            creaParseNodesInANewThread(this);
    }

    /** true iff the formula is a provable statement (typically, it starts with '|-' ) */
    public static isParsable(labeledStatement: LabeledStatement): boolean {
        const result: boolean = labeledStatement instanceof EHyp ||
            labeledStatement instanceof AssertionStatement && !GrammarManager.isSyntaxAxiom2(labeledStatement);
        return result;
    }

    /** use this method only for testing small .mm files */
    public createParseNodesForAssertionsSync() {
        this.labelToStatementMap.forEach((labeledStatement: LabeledStatement) => {
            // if (labeledStatement instanceof EHyp ||
            //     labeledStatement instanceof AssertionStatement && !GrammarManager.isSyntaxAxiom2(labeledStatement)) {
            if (MmParser.isParsable(labeledStatement)) {
                // if the parseNode is undefined, it will create it
                labeledStatement.parseNode;
            }
        });
        this.areAllParseNodesComplete = true;
    }
}