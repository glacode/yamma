
import { ParseNode } from '../grammar/ParseNode';
import { MmParser } from '../mm/MmParser';
import { SyntaxTreeClassifierFull } from './SyntaxTreeClassifierFull';
import { SyntaxTreeClassifierImp } from './SyntaxTreeClassifierImp';

/** classes that implement this interface, create clusters of
 * 'similar' formulas
 */
export interface IFormulaClassifier {
	/** a unique identifier to distinguish among different classifiers */
	id: string,

	// /** the MmParser to be used to classify formulas */
	// setMmParser( mmParser: MmParser ): void,

	/** given a formula and a MmParser, returns a string that
	 * classifies the formula; undefined if the classifier doesn't
	 * want to classify the given formula (for instance, the classifier might
	 * be ment to classifiy only the implications)
	 */
	classify(formula: ParseNode, mmParser: MmParser): string | undefined
	//  classify(formula: string[] | ParseNode, mmParser: MmParser): string

	//TODO may be this property should be moved to another interface: for instance,
	// it is used only when reading the model, not when creating the model
	/** the CompletionItemKind for the suggestions of this classifier */
	// completionItemKind: CompletionItemKind
}

/** an example of classifiers */
export function formulaClassifiersExample() : IFormulaClassifier[] {
	//TODO1 FEB 3 add new SyntaxTreeClassifierFull(1) and maybe new SyntaxTreeClassifierFull(2)
	const syntaxTreeClassifierFull: SyntaxTreeClassifierFull = new SyntaxTreeClassifierFull(3);
	const syntaxTreeClassifierImp: SyntaxTreeClassifierImp = new SyntaxTreeClassifierImp(2);
	const classifiers: IFormulaClassifier[] = [syntaxTreeClassifierFull,syntaxTreeClassifierImp];
	return classifiers;
}