import { CompletionItem, CompletionItemKind, InsertReplaceEdit } from 'vscode-languageserver';
import { MmParser } from '../mm/MmParser';
import { CursorContext, CursorContextForCompletion } from "../mmp/CursorContext";
import { MmpParser } from '../mmp/MmpParser';
import { MmpProofStep } from "../mmp/MmpProofStep";
import { WorkingVars } from '../mmp/WorkingVars';
import { formulaClassifiersExample, IFormulaClassifier } from '../stepSuggestion/IFormulaClassifier';
import { StepSuggestion } from '../stepSuggestion/StepSuggestion';
import { StepSuggestionMap } from '../stepSuggestion/StepSuggestionMap';
import { impbiiMmParser, kindToPrefixMap, opelcnMmParser } from './GlobalForTest.test';

test("test 1 SyntaxTreeClassifierFull", () => {
	// 	50::df-c             |- CC = ( R. X. R. )
	// 51:50:eleq2i        |- ( <. A , B >. e. CC <-> <. A , B >. e. ( R. X. R. ) )
	// 52::opelxp          |- ( <. A , B >. e. ( R. X. R. ) <-> ( A e. R. /\ B e. R. ) )
	// qed:51,52:bitri    |- ( <. A , B >. e. CC <-> ( A e. R. /\ B e. R. ) )
	const mmpSource =
		'50::df-c             |- CC = ( R. X. R. )\n' +
		'51:50:eleq2i        |- ( <. A , B >. e. CC <-> <. A , B >. e. ( R. X. R. ) )\n' +
		'52::          |- ( <. A , B >. e. ( R. X. R. ) <-> ( A e. R. /\\ B e. R. ) )\n' +
		'qed:51,52:bitri    |- ( <. A , B >. e. CC <-> ( A e. R. /\\ B e. R. ) )';
	// opthg2 $p | - ((C e.V /\ D e.W ) ->
	// 	(<.A , B >. = <.C , D >. <-> (A = C /\ B = D ) ) ) $ =
	const mmpParser: MmpParser = new MmpParser(mmpSource, opelcnMmParser, new WorkingVars(kindToPrefixMap));
	// const outermostBlock: BlockStatement = new BlockStatement(null);
	mmpParser.parse();
	const cursorContext: CursorContext = new CursorContext(2, 4, mmpParser);
	cursorContext.buildContext();
	const stepSuggestionMap: StepSuggestionMap = new StepSuggestionMap();
	//full3,cop cxp wcel wcel wcel wa wb TOP,opelxp,1

	const fomulaClassifiers: IFormulaClassifier[] = formulaClassifiersExample();
	stepSuggestionMap.add('full3', CompletionItemKind.Event,
		'cop cxp wcel wcel wcel wa wb TOP', 'bitri', 1);
	stepSuggestionMap.add('full3', CompletionItemKind.Event,
		'cop cxp wcel wcel wcel wa wb TOP', 'opelxp', 1);
	// this below is a fake suggestion: it should not be returned because
	// it doesn't unify
	stepSuggestionMap.add('full3', CompletionItemKind.Event,
		'cop cxp wcel wcel wcel wa wb TOP', 'imp', 1);
	const mmpProofStep: MmpProofStep = <MmpProofStep>mmpParser.mmpProof?.mmpStatements[2];
	const stepSuggestion: StepSuggestion = new StepSuggestion(cursorContext, stepSuggestionMap,
		fomulaClassifiers, mmpProofStep, opelcnMmParser);
	const completionItems: CompletionItem[] = stepSuggestion.completionItems();
	expect(completionItems.length).toBe(2);
	const completionItem0: CompletionItem = completionItems[0];
	expect(completionItem0.label).toEqual('bitri');
	const completionItem1: CompletionItem = completionItems[1];
	expect(completionItem1.label).toEqual('opelxp');
});

test("test 2 SyntaxTreeClassifierFull and SyntaxTreeClassifierImp", () => {

	const mmpSource =
		'50::df-c |- CC = ( R. X. R. )\n' +
		'52:: |- ( -. &W1 -> -. &W3 )\n' +
		'qed: |- ( <. A , B >. e. CC <-> ( A e. R. /\\ B e. R. ) )';
	const mmpParser: MmpParser = new MmpParser(mmpSource, opelcnMmParser, new WorkingVars(kindToPrefixMap));
	// const outermostBlock: BlockStatement = new BlockStatement(null);
	mmpParser.parse();
	const cursorContext: CursorContext = new CursorContext(1, 4, mmpParser);
	cursorContext.buildContext();
	const stepSuggestionMap: StepSuggestionMap = new StepSuggestionMap();
	//full3,cop cxp wcel wcel wcel wa wb TOP,opelxp,1

	const fomulaClassifiers: IFormulaClassifier[] = formulaClassifiersExample();
	// full3,wff wn wff wn wi TOP,id,5
	// full3,wff wn wff wn wi TOP,con3i,3
	// full3,wff wn wff wn wi TOP,a1i,1
	// full3,wff wn wff wn wi TOP,nsyl,1
	stepSuggestionMap.add('full3', CompletionItemKind.Event, 'wff wn wff wn wi TOP', 'id', 5);
	stepSuggestionMap.add('full3', CompletionItemKind.Event, 'wff wn wff wn wi TOP', 'con3i', 3);
	stepSuggestionMap.add('full3', CompletionItemKind.Event, 'wff wn wff wn wi TOP', 'a1i', 1);
	stepSuggestionMap.add('full3', CompletionItemKind.Event, 'wff wn wff wn wi TOP', 'nsyl', 1);
	// imp2,wff wn,id,5
	// imp2,wff wn,a1i,3
	// imp2,wff wn,con3i,3
	// imp2,wff wn,nsyl3,2
	// imp2,wff wn,con2i,2
	// imp2,wff wn,mpd,1
	// imp2,wff wn,mt2d,1
	// imp2,wff wn,nsyl,1
	// imp2,wff wn,pm2.61d1,1
	// imp2,wff wn,pm2.01d,1
	// imp2,wff wn,pm2.65d,1
	// imp2,wff wn,mtod,1
	// imp2,wff wn,mtoi,1
	stepSuggestionMap.add('imp2', CompletionItemKind.Interface, 'wff wn', 'id', 5);
	stepSuggestionMap.add('imp2', CompletionItemKind.Interface, 'wff wn', 'a1i', 3);
	stepSuggestionMap.add('imp2', CompletionItemKind.Interface, 'wff wn', 'con3i', 3);
	stepSuggestionMap.add('imp2', CompletionItemKind.Interface, 'wff wn', 'nsyl3', 2);
	stepSuggestionMap.add('imp2', CompletionItemKind.Interface, 'wff wn', 'con2i', 2);
	stepSuggestionMap.add('imp2', CompletionItemKind.Interface, 'wff wn', 'mpd', 1);
	stepSuggestionMap.add('imp2', CompletionItemKind.Interface, 'wff wn', 'mt2d', 1);
	stepSuggestionMap.add('imp2', CompletionItemKind.Interface, 'wff wn', 'nsyl', 1);
	stepSuggestionMap.add('imp2', CompletionItemKind.Interface, 'wff wn', 'pm2.61d1', 1);
	stepSuggestionMap.add('imp2', CompletionItemKind.Interface, 'wff wn', 'pm2.01d', 1);
	stepSuggestionMap.add('imp2', CompletionItemKind.Interface, 'wff wn', 'pm2.65d', 1);
	stepSuggestionMap.add('imp2', CompletionItemKind.Interface, 'wff wn', 'mtod', 1);
	stepSuggestionMap.add('imp2', CompletionItemKind.Interface, 'wff wn', 'mtoi', 1);

	// this below is a fake suggestion: it should not be returned because
	// it doesn't unify
	stepSuggestionMap.add('full3', CompletionItemKind.Event, 'wff wn wff wn wi TOP', 'bitri', 6);
	const mmpProofStep: MmpProofStep = <MmpProofStep>mmpParser.mmpProof?.mmpStatements[1];
	const stepSuggestion: StepSuggestion = new StepSuggestion(cursorContext, stepSuggestionMap,
		fomulaClassifiers, mmpProofStep, opelcnMmParser);
	const completionItems: CompletionItem[] = stepSuggestion.completionItems();
	expect(completionItems.length).toBe(17);
	expect(completionItems[0].label).toEqual('id');
	expect(completionItems[0].kind).toBe(CompletionItemKind.Event);
	expect(completionItems[0].detail).toEqual('0.50 relative weight   -    5  total');
	expect(completionItems[1].label).toEqual('con3i');
	expect(completionItems[1].kind).toBe(CompletionItemKind.Event);
	expect(completionItems[1].detail).toEqual('0.30 relative weight   -    3  total');
	expect(completionItems[5].label).toEqual('a1i');
	expect(completionItems[5].kind).toBe(CompletionItemKind.Interface);
	expect(completionItems[5].detail).toEqual('0.13 relative weight   -    3  total');
});

test("test completion items from partial label", () => {

	const mmpSource =
		'50::df-c |- CC = ( R. X. R. )\n' +
		'52::coi |- ( -. &W1 -> -. &W3 )\n' +
		'qed: |- ( <. A , B >. e. CC <-> ( A e. R. /\\ B e. R. ) )';
	const mmpParser: MmpParser = new MmpParser(mmpSource, opelcnMmParser, new WorkingVars(kindToPrefixMap));
	// const outermostBlock: BlockStatement = new BlockStatement(null);
	mmpParser.parse();
	const cursorContext: CursorContext = new CursorContext(1, 4, mmpParser);
	cursorContext.buildContext();
	const stepSuggestionMap: StepSuggestionMap = new StepSuggestionMap();
	//full3,cop cxp wcel wcel wcel wa wb TOP,opelxp,1

	const fomulaClassifiers: IFormulaClassifier[] = formulaClassifiersExample();

	stepSuggestionMap.add('full3', CompletionItemKind.Event, 'wff wn wff wn wi TOP', 'id', 5);
	stepSuggestionMap.add('full3', CompletionItemKind.Event, 'wff wn wff wn wi TOP', 'con3i', 3);
	stepSuggestionMap.add('full3', CompletionItemKind.Event, 'wff wn wff wn wi TOP', 'a1i', 1);
	stepSuggestionMap.add('full3', CompletionItemKind.Event, 'wff wn wff wn wi TOP', 'nsyl', 1);

	stepSuggestionMap.add('imp2', CompletionItemKind.Interface, 'wff wn', 'id', 5);
	stepSuggestionMap.add('imp2', CompletionItemKind.Interface, 'wff wn', 'a1i', 3);
	stepSuggestionMap.add('imp2', CompletionItemKind.Interface, 'wff wn', 'con3i', 3);
	stepSuggestionMap.add('imp2', CompletionItemKind.Interface, 'wff wn', 'nsyl3', 2);
	stepSuggestionMap.add('imp2', CompletionItemKind.Interface, 'wff wn', 'con2i', 2);
	stepSuggestionMap.add('imp2', CompletionItemKind.Interface, 'wff wn', 'mpd', 1);
	stepSuggestionMap.add('imp2', CompletionItemKind.Interface, 'wff wn', 'mt2d', 1);
	stepSuggestionMap.add('imp2', CompletionItemKind.Interface, 'wff wn', 'nsyl', 1);
	stepSuggestionMap.add('imp2', CompletionItemKind.Interface, 'wff wn', 'pm2.61d1', 1);
	stepSuggestionMap.add('imp2', CompletionItemKind.Interface, 'wff wn', 'pm2.01d', 1);
	stepSuggestionMap.add('imp2', CompletionItemKind.Interface, 'wff wn', 'pm2.65d', 1);
	stepSuggestionMap.add('imp2', CompletionItemKind.Interface, 'wff wn', 'mtod', 1);
	stepSuggestionMap.add('imp2', CompletionItemKind.Interface, 'wff wn', 'mtoi', 1);

	// this below is a fake suggestion: it should not be returned because
	// it doesn't unify
	stepSuggestionMap.add('full3', CompletionItemKind.Event, 'wff wn wff wn wi TOP', 'bitri', 6);
	const mmpProofStep: MmpProofStep = <MmpProofStep>mmpParser.mmpProof?.mmpStatements[1];
	const stepSuggestion: StepSuggestion = new StepSuggestion(cursorContext, stepSuggestionMap,
		fomulaClassifiers, mmpProofStep, opelcnMmParser);
	const completionItems: CompletionItem[] = stepSuggestion.completionItems();
	// I've not checked that the results below are correct (it would be too time consuming to do),
	// but they are returned by a test 'on the field' and are coherent with what I would expect.
	// I've inclueded these tests to get an alert if things are unwittingly changed.
	expect(completionItems.length).toBe(21);
	expect(completionItems[17].label).toEqual('con4i');
	expect(completionItems[17].kind).toBe(CompletionItemKind.Text);
	expect(completionItems[17].command).toBeDefined();
	expect(completionItems[17].detail).toBeUndefined();
	expect(completionItems[18].label).toEqual('con2i');
	expect(completionItems[18].kind).toBe(CompletionItemKind.Text);
	expect(completionItems[18].detail).toBeUndefined();
	expect(completionItems[19].label).toEqual('con1i');
	expect(completionItems[19].kind).toBe(CompletionItemKind.Text);
	expect(completionItems[19].detail).toBeUndefined();
	expect(completionItems[20].label).toEqual('con3i');
	expect(completionItems[20].kind).toBe(CompletionItemKind.Text);
	expect(completionItems[20].detail).toBeUndefined();

});

test("step suggestion for empty parse node from partial label", () => {

	const mmParser: MmParser = impbiiMmParser;

	const mmpSource =
		'ax-\n' +
		'qed: |- ps';
	const mmpParser: MmpParser = new MmpParser(mmpSource, mmParser, new WorkingVars(kindToPrefixMap));
	// const outermostBlock: BlockStatement = new BlockStatement(null);
	mmpParser.parse();
	expect(mmpParser.mmpProof?.mmpStatements.length).toBe(2);
	const cursorContext: CursorContext = new CursorContext(0, 3, mmpParser);
	cursorContext.buildContext();
	expect(cursorContext.contextForCompletion).toBe(CursorContextForCompletion.stepLabel);
	const stepSuggestionMap: StepSuggestionMap = new StepSuggestionMap();
	//full3,cop cxp wcel wcel wcel wa wb TOP,opelxp,1

	const fomulaClassifiers: IFormulaClassifier[] = formulaClassifiersExample();

	const mmpProofStep: MmpProofStep = <MmpProofStep>mmpParser.mmpProof?.mmpStatements[0];
	const stepSuggestion: StepSuggestion = new StepSuggestion(cursorContext, stepSuggestionMap,
		fomulaClassifiers, mmpProofStep, mmParser);
	const completionItems: CompletionItem[] = stepSuggestion.completionItems();
	expect(completionItems.length).toBe(4);
	expect(completionItems[0].label).toEqual('ax-mp');
	expect(completionItems[0].kind).toBe(CompletionItemKind.Text);
	expect(completionItems[0].command).toBeDefined();
	const textEdit: InsertReplaceEdit = <InsertReplaceEdit>completionItems[0].textEdit;
	expect(textEdit.insert.start.character).toBe(0);
	expect(textEdit.insert.end.character).toBe(3);
});