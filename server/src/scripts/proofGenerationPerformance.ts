// this script builds a model for step suggestions (that is, label completion lists)
// for every proof in every step, computes the most significative theorem
import * as fs from 'fs';
import { ProofMode } from '../mm/ConfigurationManager';
import { MmParser } from '../mm/MmParser';
import { consoleLogWithTimestamp } from '../mm/Utils';
import { MmpCompressedProofCreatorFromPackedProof } from '../mmp/MmpCompressedProofCreator';
import { MmpParser } from '../mmp/MmpParser';
import { MmpUnifier } from '../mmp/MmpUnifier';
import { WorkingVars } from '../mmp/WorkingVars';
import { GlobalState } from '../general/GlobalState';

// const mmFilePath = __dirname.concat('/../../src/mmTestFiles/impbii.mm');
// const mmFilePath = '/mnt/mmt/impbii.mm';
// const mmFilePath = '/mnt/mmt/set.mm';
// const mmFilePath = '/mnt/mmt/dmsnop.mm';
// const mmFilePath = '/mnt/mmt/opelcn.mm';


consoleLogWithTimestamp('proof generation performance start');

// const mmpSource =
// 	'\n* test comment\n\n' +
// 	'h1::opth.1                    |- A e. _V\n' +
// 	'h2::opth.2                    |- B e. _V\n' +
// 	'3:1,2:opth1                |- ( <. A , B >. = <. C , D >. -> A = C )\n' +
// 	'4:1,2:opi1                   |- { A } e. <. A , B >.\n' +
// 	'5::id                        |- ( <. A , B >. = <. C , D >. -> <. A , B >. = <. C , D >. )\n' +
// 	'6:4,5:syl5eleq              |- ( <. A , B >. = <. C , D >. -> { A } e. <. C , D >. )\n' +
// 	'7::oprcl                    |- ( { A } e. <. C , D >. -> ( C e. _V /\\ D e. _V ) )\n' +
// 	'8:6,7:syl                  |- ( <. A , B >. = <. C , D >. -> ( C e. _V /\\ D e. _V ) )\n' +
// 	'9:8:simprd            |- ( <. A , B >. = <. C , D >. -> D e. _V )\n' +
// 	'10:3:opeq1d               |- ( <. A , B >. = <. C , D >. -> <. A , B >. = <. C , B >. )\n' +
// 	'11:10,5:eqtr3d           |- ( <. A , B >. = <. C , D >. -> <. C , B >. = <. C , D >. )\n' +
// 	'12:8:simpld               |- ( <. A , B >. = <. C , D >. -> C e. _V )\n' +
// 	'13::dfopg                 |- ( ( C e. _V /\\ B e. _V ) -> <. C , B >. = { { C } , { C , B } } )\n' +
// 	'14:12,2,13:sylancl       |- ( <. A , B >. = <. C , D >. -> <. C , B >. = { { C } , { C , B } } )\n' +
// 	'15:11,14:eqtr3d         |- ( <. A , B >. = <. C , D >. -> <. C , D >. = { { C } , { C , B } } )\n' +
// 	'16::dfopg                |- ( ( C e. _V /\\ D e. _V ) -> <. C , D >. = { { C } , { C , D } } )\n' +
// 	'17:8,16:syl             |- ( <. A , B >. = <. C , D >. -> <. C , D >. = { { C } , { C , D } } )\n' +
// 	'18:15,17:eqtr3d        |- ( <. A , B >. = <. C , D >. -> { { C } , { C , B } } = { { C } , { C , D } } )\n' +
// 	'19::prex                |- { C , B } e. _V\n' +
// 	'20::prex                |- { C , D } e. _V\n' +
// 	'21:19,20:preqr2        |- ( { { C } , { C , B } } = { { C } , { C , D } } -> { C , B } = { C , D } )\n' +
// 	'22:18,21:syl          |- ( <. A , B >. = <. C , D >. -> { C , B } = { C , D } )\n' +  // ok
// 	'23::preq2                |- ( x = D -> { C , x } = { C , D } )\n' +
// 	'24:23:eqeq2d            |- ( x = D -> ( { C , B } = { C , x } <-> { C , B } = { C , D } ) )\n' +
// 	'25::eqeq2               |- ( x = D -> ( B = x <-> B = D ) )\n' +
// 	'26:24,25:imbi12d       |- ( x = D -> ( ( { C , B } = { C , x } -> B = x ) <-> ( { C , B } = { C , D } -> B = D ) ) )\n' +   // ok
// 	'27::vex                 |- x e. _V\n' +
// 	'28:2,27:preqr2         |- ( { C , B } = { C , x } -> B = x )\n' +   // ok
// 	'29:26,28:vtoclg       |- ( D e. _V -> ( { C , B } = { C , D } -> B = D ) )\n' +  // KO!!!!
// 	'30:9,22,29:sylc      |- ( <. A , B >. = <. C , D >. -> B = D )\n' +
// 	'31:3,30:jca         |- ( <. A , B >. = <. C , D >. -> ( A = C /\\ B = D ) )\n' +   // KO!!!!
// 	'32::opeq12          |- ( ( A = C /\\ B = D ) -> <. A , B >. = <. C , D >. )\n' +
// 	'qed:31,32:impbii   |- ( <. A , B >. = <. C , D >. <-> ( A = C /\\ B = D ) )\n' +
// 	'$d B x\n' +
// 	'$d C x\n' +
// 	'$d D x';

const mmpSource: string = readFile('/mnt/mmt/test.mmp');

const mmFilePath = '/mnt/mmt/set.mm';
// const mmFilePath = '/mnt/mmt/opelcn.mm';
consoleLogWithTimestamp('mmParse begin');
const opelcnMmParser: MmParser = createMmParser(mmFilePath);
consoleLogWithTimestamp('mmParse end');

const kindToPrefixMap: Map<string, string> = new Map<string, string>();
kindToPrefixMap.set('wff', 'W');
kindToPrefixMap.set('class', 'C');
kindToPrefixMap.set('setvar', 'S');
const mmpParser: MmpParser = new MmpParser(mmpSource, opelcnMmParser, new WorkingVars(kindToPrefixMap));

consoleLogWithTimestamp('mmpParser begin');
mmpParser.parse();
consoleLogWithTimestamp('mmpParser end');


// const compressedProofCreator: IMmpCompressedProofCreator =
// 	new MmpCompressedProofCreatorFromUncompressedProof(labelSequenceCreator);
const mmpUnifier: MmpUnifier = new MmpUnifier(mmpParser, ProofMode.compressed, 0,
	undefined, undefined, undefined, undefined, new MmpCompressedProofCreatorFromPackedProof());

consoleLogWithTimestamp('mmpUnifier begin');
mmpUnifier.unify();
consoleLogWithTimestamp('mmpUnifier end');


consoleLogWithTimestamp('proof generation performance end');



function readFile(fileName: string): string {
	const mmFilePath = fileName;
	const theory: string = fs.readFileSync(mmFilePath, 'utf-8');
	return theory;
}
function createMmParser(fileName: string): MmParser {
	const theoryText: string = readFile(fileName);
	const globalState: GlobalState = new GlobalState();
	const mmParser: MmParser = new MmParser(globalState);
	mmParser.ParseText(theoryText);
	return mmParser;
}