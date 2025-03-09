import { CursorContext, CursorContextForCompletion } from '../mmp/CursorContext';
import { IMmpParserParams, MmpParser } from '../mmp/MmpParser';
import { WorkingVars } from '../mmp/WorkingVars';
import { impbiiMmParser, kindToPrefixMap } from './GlobalForTest.test';

test('CursorContext 1', () => {
	const mmpSource = `\
$theorem impbii
h50::impbii.1       |- ( ph -> ps )
SearchSymbols: x y   SearchComment:  
52::           |- ( ( ph -> ps ) ->
                       ( ( ps -> ph ) -> ( ph <-> ps ) ) )
qed:50,51,52:mp2   |- ( ph <->   )`;
	const mmpParserParams : IMmpParserParams = {
		textToParse: mmpSource,
		mmParser: impbiiMmParser,
		workingVars: new WorkingVars(kindToPrefixMap)
	};
	const mmpParser: MmpParser = new MmpParser(mmpParserParams);
	// const mmpParser: MmpParser = new MmpParser(mmpSource, impbiiMmParser, new WorkingVars(kindToPrefixMap));
	mmpParser.parse();
	const cursorContextSearch: CursorContext = new CursorContext(2, 5, mmpParser);
	cursorContextSearch.buildContext();
	expect(cursorContextSearch.contextForCompletion).toBe(CursorContextForCompletion.searchStatement);
	const cursorContextFormula: CursorContext = new CursorContext(4, 31, mmpParser);
	cursorContextFormula.buildContext();
	expect(cursorContextFormula.contextForCompletion).toBe(CursorContextForCompletion.stepFormula);
	const cursorContextFormula2: CursorContext = new CursorContext(5, 31, mmpParser);
	cursorContextFormula2.buildContext();
	expect(cursorContextFormula2.contextForCompletion).toBe(CursorContextForCompletion.stepFormula);
	const cursorContextLabel: CursorContext = new CursorContext(3, 4, mmpParser);
	cursorContextLabel.buildContext();
	expect(cursorContextLabel.contextForCompletion).toBe(CursorContextForCompletion.stepLabel);
});