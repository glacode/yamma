import { MmpRule } from '../grammar/GrammarManager';

export interface IMmpRuleForThread {
	label: string
	name: string;
	symbols: any[];
}

export abstract class GrammarManagerForThread {

	//#region convertMmpRules
	static convertMmpRule(mmpRule: MmpRule): IMmpRuleForThread {
		const mmpRuleForThread: IMmpRuleForThread = {
			label: mmpRule.label,
			name: mmpRule.name,
			symbols: mmpRule.symbols
		};
		return mmpRuleForThread;
	}
	public static convertMmpRules(mmpRules: MmpRule[]): IMmpRuleForThread[] {
		const mmpRulesForThread: IMmpRuleForThread[] = [];
		mmpRules.forEach((mmpRule: MmpRule) => {
			const mmpRuleForThread: IMmpRuleForThread = GrammarManagerForThread.convertMmpRule(mmpRule);
			mmpRulesForThread.push(mmpRuleForThread);
		});
		return mmpRulesForThread;
	}
	//#endregion convertMmpRules

	//#region convertMmpRules
	public static convertMmpRuleForThread(mmpRuleForThread: IMmpRuleForThread): MmpRule {
		const mmpRule: MmpRule = new MmpRule(mmpRuleForThread.label, mmpRuleForThread.name,
			mmpRuleForThread.symbols);
		return mmpRule;
	}
	public static convertMmpRulesForThread(mmpRulesForThread: IMmpRuleForThread[]): MmpRule[] {
		const mmpRules: MmpRule[] = [];
		mmpRulesForThread.forEach((mmpRuleForThread: IMmpRuleForThread) => {
			const mmpRule: MmpRule = GrammarManagerForThread.convertMmpRuleForThread(mmpRuleForThread);
			mmpRules.push(mmpRule);
		});
		return mmpRules;
	}
	//#endregion convertMmpRules
}