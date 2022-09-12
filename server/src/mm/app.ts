
//import { AssertionError } from 'assert/strict';
//import { assert } from 'console'

import { MmParser } from './MmParser';

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
    // mm.ParseFile(fullPath);
}

// function parse(readLines: Array<string>) {
//     const toks = new TokenReader(readLines);
//     const mm = new MmParser();
//     //currentBlock: BlockStatement, labelToStatementMap: Map<string, LabeledStatement>) {
//     const outermostBlock: BlockStatement = new BlockStatement();
//     // const labelToStatementMap: Map<string, LabeledStatement> =
//     //     new Map<string, LabeledStatement>();

//     mm.Parse(toks, outermostBlock);
// }

// function loadTest(localFileName: string) {
//     (async function processLineByLine() {
//         try {
//             const rl = readline.createInterface({
//                 input: fs.createReadStream(localFileName),
//                 crlfDelay: Infinity
//             });

//             const fileLines: string[] = [];

//             rl.on('line', (line) => {
//                 fileLines.push(line);
//                 //console.log(`Line from file: ${line}`);
//             });

//             await events.EventEmitter.once(rl, 'close');

//             console.log('Reading file line by line with readline done.');
//             const used = process.memoryUsage().heapUsed / 1024 / 1024;
//             console.log(`The script uses approximately ${Math.round(used * 100) / 100} MB`);

//             parse(fileLines);


//         } catch (err) {
//             console.error(err);
//         }
//     })();
// }


// function loadTestOld(localFileName: string) {


//     let mm = new Parser()

//     const file = fs.readFileSync('./' + localFileName, 'utf-8')
//     const fileSplit = file.split("\n")
//     // let toks = new Toks(file)
//     console.log("letto3")
//     // mm.read(toks)
// }
