import { TheoryLoader } from '../mm/TheoryLoader';
import { MmDiagnostic } from '../mm/MmParser';
import * as url from 'url';

describe('TheoryLoader', () => {
    let theoryLoader: TheoryLoader;
    let mockConnection: any;
    let mockGlobalState: any;

    beforeEach(() => {
        mockConnection = {
            sendDiagnostics: jest.fn()
        };
        mockGlobalState = {
            mmFilePath: undefined,
            mmParser: undefined
        };
        theoryLoader = new TheoryLoader('main.mm',mockConnection, mockGlobalState);
    });

    test('sendDiagnostics should send diagnostics for each file', () => {
        const mmFilePath = '/path/to/file.mm';
        const diagnostics: MmDiagnostic[] = [
            { message: 'Error 1', mmFilePath: '/path/to/file1.mm', range: { start: { line: 0, character: 0 }, end: { line: 0, character: 1 } } },
            { message: 'Error 2', mmFilePath: '/path/to/file2.mm', range: { start: { line: 1, character: 0 }, end: { line: 1, character: 1 } } },
            { message: 'Error 3', range: { start: { line: 1, character: 0 }, end: { line: 1, character: 1 } } }
        ];

        theoryLoader.sendDiagnostics(mmFilePath, diagnostics);

        expect(mockConnection.sendDiagnostics).toHaveBeenCalledTimes(3);
        expect(mockConnection.sendDiagnostics).toHaveBeenCalledWith({
            uri: url.pathToFileURL('/path/to/file1.mm').href,
            diagnostics: [diagnostics[0]]
        });
        expect(mockConnection.sendDiagnostics).toHaveBeenCalledWith({
            uri: url.pathToFileURL('/path/to/file2.mm').href,
            diagnostics: [diagnostics[1]]
        });
		expect(mockConnection.sendDiagnostics).toHaveBeenCalledWith({
			uri: url.pathToFileURL(mmFilePath).href,
			diagnostics: [diagnostics[2]]
		});
    });
});