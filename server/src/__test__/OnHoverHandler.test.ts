import { OnHoverHandler } from '../languageServerHandlers/OnHoverHandler';

test("C should return [3]", () => {
	const line = "qed:3,2:dummy |- ( ph -> ch )";
	// let position = Position.create(1,16);
	let token : string = OnHoverHandler.getTokenGivenTheColumn(line,1);
    expect(token).toEqual("qed");

	token = OnHoverHandler.getTokenGivenTheColumn(line,4);
	expect(token).toEqual("3");

	token = OnHoverHandler.getTokenGivenTheColumn(line,8);
	expect(token).toEqual("dummy");

	token = OnHoverHandler.getTokenGivenTheColumn(line,17);
	expect(token).toEqual("(");

	// position = Position.create(1,13);
	// token = OnHoverHandler.getTokenFromPosition(textDocument,position);
	// expect(token).toEqual("(");
	// position = Position.create(1,0);
	// token = OnHoverHandler.getTokenFromPosition(textDocument,position);
	// expect(token).toEqual("3,2:dummy");
	// position = Position.create(1,24);
	// token = OnHoverHandler.getTokenFromPosition(textDocument,position);
	// expect(token).toEqual(")");
	// position = Position.create(0,7);
	// token = OnHoverHandler.getTokenFromPosition(textDocument,position);
	// expect(token).toEqual("line");
});