import { MmToken } from '../grammar/MmLexer';
import { AreArrayTheSame, splitToTokens, splitToTokensAllowingForEmptyValues, splitWithPosition } from "../mm/Utils";

test("arrays should be equal",
    () => {
        expect(AreArrayTheSame([5, 3], [5, 3])).toBe(true);
    }
);

test("arrays should be different",
    () => {
        expect(AreArrayTheSame([5, 3], [5, "3"])).toBe(false);
    }
);

test("arrays should be different",
    () => {
        expect(AreArrayTheSame([5, 3], [5, 3, 2])).toBe(false);
    }
);

test("split with position",
    () => {
        const splitResult: { subStrings: string[], positions: number[] } =
            splitWithPosition(" a .   bb3  ", /[^\s]+/g);
        expect(splitResult.subStrings[2]).toEqual("bb3");
        expect(splitResult.positions[2]).toEqual(7);
    }
);

test("split to tokens for blanks",
    () => {
        const tokens: MmToken[] = splitToTokens("* a bbb cd", /[^\s]+/g, 3, 0);
        expect(tokens.length).toBe(4);
        expect(tokens[2].value).toEqual("bbb");
        expect(tokens[2].line).toBe(3);
        expect(tokens[3].column).toBe(8);
    }
);

test("split to tokens for semicolon",
    () => {
        const tokens: MmToken[] = splitToTokens("h50::mp2.1", /[^:]+/g, 6, 2);
        expect(tokens.length).toBe(2);
        expect(tokens[1].value).toEqual("mp2.1");
        expect(tokens[1].line).toBe(6);
        expect(tokens[1].column).toBe(7);
    }
);

test("splitToTokensAllowingForEmptyValues", () => {
    let tokens: MmToken[] = splitToTokensAllowingForEmptyValues("a55,b", ",", 6, 4);
    expect(tokens.length).toBe(2);
    expect(tokens[0].value).toEqual("a55");
    expect(tokens[0].line).toBe(6);
    expect(tokens[0].column).toBe(4);
    expect(tokens[1].value).toEqual("b");
    expect(tokens[1].line).toBe(6);
    expect(tokens[1].column).toBe(8);

    tokens = splitToTokensAllowingForEmptyValues(",50", ",", 6, 4);
    expect(tokens.length).toBe(2);
    expect(tokens[0].value).toEqual("");
    expect(tokens[0].line).toBe(6);
    expect(tokens[0].column).toBe(4);
    expect(tokens[1].value).toEqual("50");
    expect(tokens[1].line).toBe(6);
    expect(tokens[1].column).toBe(5);

    tokens = splitToTokensAllowingForEmptyValues("55,", ",", 6, 3);
    expect(tokens.length).toBe(2);
    expect(tokens[0].value).toEqual("55");
    expect(tokens[0].line).toBe(6);
    expect(tokens[0].column).toBe(3);
    expect(tokens[1].value).toEqual("");
    expect(tokens[1].line).toBe(6);
    expect(tokens[1].column).toBe(6);
    tokens = splitToTokensAllowingForEmptyValues(",", ",", 6, 3);

    expect(tokens.length).toBe(2);
    expect(tokens[0].value).toEqual("");
    expect(tokens[0].line).toBe(6);
    expect(tokens[0].column).toBe(3);
    expect(tokens[1].value).toEqual("");
    expect(tokens[1].line).toBe(6);
    expect(tokens[1].column).toBe(4);
}
);

test("Expect map to preserve order", () => {
    const map: Map<string,number> = new Map<string,number>();
    map.set("b",2);
    map.set("c",3);
    map.set("a",1);
    const numbers: number[] = [];
    for (const key of map.keys()) {
        numbers.push(<number>map.get(key));
    }
    expect(numbers[0]).toBe(2);
    expect(numbers[1]).toBe(3);
    expect(numbers[2]).toBe(1);
}
);