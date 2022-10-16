// this script builds a model for step suggestions (that is, label completion lists)
// for every proof in every step, computes the most significative theorem

import { consoleLogWithTimestamp } from '../mm/Utils';
import { formulaClassifiersExample, IFormulaClassifier } from './IFormulaClassifier';
import { ModelBuilder } from './ModelBuilder';

// const mmFilePath = __dirname.concat('/../../src/mmTestFiles/impbii.mm');
// const mmFilePath = '/mnt/mmt/impbii.mm';
// const mmFilePath = '/mnt/mmt/set.mm';
// const mmFilePath = '/mnt/mmt/dmsnop.mm';
const mmFilePath = '/mnt/mmt/opelcn.mm';


consoleLogWithTimestamp('model builder start');

// const rpnSyntaxTreeBuilder: RpnSyntaxTreeBuilder = new RpnSyntaxTreeBuilder();
//TODO1 the code below is repeated: use a single place and export it
const formulaClassifiers: IFormulaClassifier[] = formulaClassifiersExample();
const modelBuilder: ModelBuilder = new ModelBuilder(mmFilePath, formulaClassifiers);
modelBuilder.buildModel();

consoleLogWithTimestamp('model builder end');

