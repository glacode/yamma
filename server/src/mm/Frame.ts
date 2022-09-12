import { BlockStatement } from "./BlockStatement";
import { DisjointVarMap } from './DisjointVarMap';
import { AssertionStatement, EHyp, FHyp } from "./Statements";

// this class represents a Frame, as defined in section 4.2.7 of the Metamath book
export class Frame {
    // disjVars: DisjVars
    disjVars: DisjointVarMap
    eHyps: EHyp[]
    fHyps: FHyp[]
    assertionStatement: AssertionStatement
    constructor(assertionStatement: AssertionStatement) {
        const currentBlock: BlockStatement = <BlockStatement>assertionStatement.ParentBlock;
        this.eHyps = currentBlock.mandatoryEHyps();
        // const contentForMandVars = (assertionStatement instanceof AxiomStatement ? assertionStatement.Content :
        //     (<ProvableStatement>assertionStatement).ContentBeforeTheProof);
        const contentForMandVars = assertionStatement.formula;
        const mand_vars: string[] = currentBlock.get_mand_vars(contentForMandVars, this.eHyps);
        // this.disjVars = currentBlock.getDisjointVars(mand_vars);
        this.disjVars = currentBlock.getDisjointVars();
        this.fHyps = currentBlock.mandatoryFHyps(mand_vars);
        this.assertionStatement = assertionStatement;
    }
    static createFrame(assertionStatement: AssertionStatement) {
        const frame: Frame = new Frame(assertionStatement);
        assertionStatement.frame = frame;
    }
}