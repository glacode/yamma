// this script builds a model for step suggestions (that is, label completion lists)
// for every proof in every step, computes the most significative theorem

import { consoleLogWithTimestamp } from '../mm/Utils';
import { ModelBuilder } from './ModelBuilder';

// const mmFilePath = __dirname.concat('/../../src/mmTestFiles/impbii.mm');
// const mmFilePath = '/mnt/mmt/impbii.mm';
// const mmFilePath = '/home/mionome/Desktop/provashare/mmp/set.mm';
const mmFilePath = '/mnt/mmt/set.mm';
// const mmFilePath = '/mnt/mmt/dmsnop.mm';

consoleLogWithTimestamp('model builder start');

const modelBuilder: ModelBuilder = new ModelBuilder(mmFilePath);
modelBuilder.buildModel();

consoleLogWithTimestamp('model builder end');

