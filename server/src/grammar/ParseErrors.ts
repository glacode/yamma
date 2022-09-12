export interface ParseError {
	description: string
}

export interface StackUnderflow extends ParseError {
	numFHyps: number
	numEHyps: number
	stackLength: number
}

export interface AssertionProvenDoesntMatch extends ParseError {
	expected: string
	proven: string
}