import * as fs from 'fs';
import { MmToken } from '../grammar/MmLexer';
import { splitToTokensDefaultInLine } from './Utils';

export class TokenReader {
    lines_buf: string[]   // TODO remove, slow method
    tokbuf: string[]    // TODO remove, slow method
    tokens: MmToken[]
    indexForNextToken = 0
    imported_files: Set<any>
    lastComment: MmToken[];

    constructor(readLines: string[]) {
        this.lines_buf = readLines;
        this.tokbuf = [];
        this.imported_files = new Set();

        // const dateTime = new Date();
        // console.log("inizio prova" + dateTime);
        this.tokens = this.provaSplit();
        this.lastComment = [];

        // console.log("fine prova");
    }

    provaSplit(): MmToken[] {
        const prova: MmToken[] = [];
        for (let i = 0; i < this.lines_buf.length; i++) {
            const line = this.lines_buf[i];
            // const lineTokens = splitToTokensDefault(line);
            const lineTokens = splitToTokensDefaultInLine(line, i);
            lineTokens.forEach(token => {
                prova.push(token);
            });
        }
        return prova;
    }



    // reads the next token and increases the index for the next token
    Read(): MmToken | undefined {
        let tok: MmToken | undefined;
        if (this.indexForNextToken < this.tokens.length)
            tok = this.tokens[this.indexForNextToken++];
        return tok;
    }

    // read an included file
    Readf(): MmToken | undefined {
        const tok: MmToken | undefined = this.Read();
        while (tok?.value === '$[') {
            // let fullPathFileName: string | null;
            const localFileName = this.Read();
            const endBracket = this.Read();
            if (endBracket?.value != '$]')
                throw new Error("Inclusion command not terminated");
            fs.realpath(<string>localFileName?.value, (error, fullPathFileName) => {
                if (error) {
                    throw new Error("Included file not found!");
                }
                else {
                    if (!this.imported_files.has(fullPathFileName)) {
                        //TODO implement this part
                        throw new Error("Not implemented, yet");

                    }
                }
            });

        }
        return tok;
        //throw new Error('Method not implemented.2');
    }


    // read a token and returns it
    // comments are consumed and skipped
    // Readc() {
    //     while (true) {
    //         let tok: MmToken | undefined = this.Readf();
    //         if (tok === undefined)
    //             return undefined;
    //         if (tok.value === '$(')
    //             while (tok?.value != '$)')
    //                 tok = this.Read();
    //         else
    //             return tok;
    //     }
    // }

    // this below has a problem
    Readc() {
        let tok: MmToken | undefined = this.Readf();
        while (tok?.value == '$(') {
            this.lastComment = [];
            while (tok != undefined && tok?.value != '$)') {
                tok = this.Read();
                if (tok != undefined && tok?.value != '$)')
                    this.lastComment.push(tok);
            }

            if (tok == undefined)
                // a comment was open, but we reached end of file without it being closed
                //TODO add diagnostics
                throw new Error("A comment was never closed");
            else
                // the comment was closed
                tok = this.Read();
        }
        return tok;
    }

    // reaturns a list of tokens inside the statement
    // the first token used to define the statement is NOT returned and
    // the last token '$.' is NOT returned
    readstat() {
        const stat: MmToken[] = [];
        let tok = this.Readc();
        while (tok?.value != '$.') {
            if (tok === undefined) {
                throw new Error("EOF before $.");
            }
            stat.push(tok);
            tok = this.Readc();
        }
        return stat;
    }
}


