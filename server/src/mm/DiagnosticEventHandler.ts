import { DiagnosticSeverity, PublishDiagnosticsParams, Range } from 'vscode-languageserver';
import * as url from 'url';
import { FormulaNonParsableEventArgs, LabeledStatement } from './LabeledStatement';
import { MmDiagnostic, MmParserErrorCode } from './MmParser';
import { MmToken } from '../grammar/MmLexer';
import { oneCharacterRange } from './Utils';

export interface IDiagnosticSink {
    sendDiagnostics(params: PublishDiagnosticsParams): void;
}

export class DiagnosticEventHandler {
    private static _instance: DiagnosticEventHandler | null = null;
    private sink: IDiagnosticSink;

    constructor(sink: IDiagnosticSink) {
        this.sink = sink;
    }

    // arrow function binds `this` automatically
    formulaNonParsableEventHandler = (eventArgs: FormulaNonParsableEventArgs) => {
        const labeledStatement: LabeledStatement = eventArgs.labeledStatement;
        // content might be longer than formula, because it might contain a proof
        const content: MmToken[] = labeledStatement.Content;
        const formula: string[] = labeledStatement.formula;
        const symbolThatTriggeredParsingError: number = eventArgs.parseResult.parser.current;
        let range: Range = oneCharacterRange(content[formula.length - 1].range.end);
        if (symbolThatTriggeredParsingError < formula.length)
            // the parsing error was NOT for an and UnexpectedEndOfFormula
            range = content[symbolThatTriggeredParsingError].range;
        // range is the range of the first symbol that triggered the parsing error
        const mmDiagnostic: MmDiagnostic = {
            severity: DiagnosticSeverity.Error,
            message: `Formula in statement "${eventArgs.labeledStatement.Label}" is not parsable ` + eventArgs.parseResult.error?.message,
            range: range,
            code: MmParserErrorCode.formulaNonParsable,
            provableStatementLabel: eventArgs.labeledStatement.Label,
            source: 'yamma',
            mmFilePath: eventArgs.labeledStatement.labelToken.filePath!
        };

        const publishDiagnosticsParams: PublishDiagnosticsParams = {
            uri: url.pathToFileURL(eventArgs.labeledStatement.labelToken.filePath!).href,
            diagnostics: [mmDiagnostic],
        };

        this.sink.sendDiagnostics(publishDiagnosticsParams);
    };
    public static getInstance(sink?: IDiagnosticSink): DiagnosticEventHandler {
        if (!DiagnosticEventHandler._instance) {
            if (!sink) {
                throw new Error("DiagnosticEventHandler not initialized: provide a sink on first call.");
            }
            DiagnosticEventHandler._instance = new DiagnosticEventHandler(sink);
        }
        return DiagnosticEventHandler._instance;
    }
}
