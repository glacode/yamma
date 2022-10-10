// this script builds a model for step suggestions (that is, label completion lists)
// for every proof in every step, computes the most significative theorem

import { consoleLogWithTimestamp } from '../mm/Utils';
import { ModelBuilder } from './ModelBuilder';
import { SyntaxTreeClassifierFull } from './SyntaxTreeClassifierFull';

// const mmFilePath = __dirname.concat('/../../src/mmTestFiles/impbii.mm');
// const mmFilePath = '/mnt/mmt/impbii.mm';
// const mmFilePath = '/home/mionome/Desktop/provashare/mmp/set.mm';
// const mmFilePath = '/mnt/mmt/set.mm';
const mmFilePath = '/mnt/mmt/dmsnop.mm';
// const mmFilePath = '/home/mionome/Desktop/provashare/mmp/dmsnop.mm';


consoleLogWithTimestamp('model builder start');

// const rpnSyntaxTreeBuilder: RpnSyntaxTreeBuilder = new RpnSyntaxTreeBuilder();
const syntaxTreeClassifierFull: SyntaxTreeClassifierFull = new SyntaxTreeClassifierFull();
const modelBuilder: ModelBuilder = new ModelBuilder(mmFilePath,syntaxTreeClassifierFull);
modelBuilder.buildModel();

consoleLogWithTimestamp('model builder end');

