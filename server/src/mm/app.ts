
//import { AssertionError } from 'assert/strict';
//import { assert } from 'console'

import { GrammarManager } from '../grammar/GrammarManager';
import { AssertionStatement } from './AssertionStatement';
import { EHyp } from './EHyp';
import { LabeledStatement } from './LabeledStatement';
import { MmParser } from './MmParser';
import { consoleLogWithTimestamp, notifyProgress } from './Utils';

const message = 'Hello, World!';
console.log(message);




// type Variable = {
//     name: string,
//     kind: string
// }




//loadTest( "set.mm")
const fullPath = __dirname.concat("/set.mm");
console.log(fullPath);
loadTestNew(fullPath);
//loadTest("setShort.mm")
//loadTest("setShorter.mm")


function loadTestNew(fullPath: string) {
    const mm = new MmParser();
    mm.ParseFileSync(fullPath);
    createParseNodes(mm);
    // mm.ParseFile(fullPath);
}

function createParseNodes(mmParser: MmParser): any {
    let i = 0;
    const totalNumberOfLabeledStatement: number = mmParser.labelToStatementMap.size;
    mmParser.labelToStatementMap.forEach((labeledStatement: LabeledStatement) => {
        if (labeledStatement instanceof EHyp ||
            labeledStatement instanceof AssertionStatement && !GrammarManager.isSyntaxAxiom2(labeledStatement)) {
            // if the parseNode is undefined, it will create it
            labeledStatement.parseNode;
            notifyProgress(i, totalNumberOfLabeledStatement);
            i++;
        }
    });
    consoleLogWithTimestamp('Complete!');
}