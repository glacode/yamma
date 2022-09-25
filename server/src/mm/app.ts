
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