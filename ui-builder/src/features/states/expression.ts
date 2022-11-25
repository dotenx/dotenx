import { immerable } from 'immer'

export class Expression {
	[immerable] = true

	constructor(public value: Value[] = []) {
		this.value = value
	}

	static fromValue(value: Value) {
		const expression = new Expression()
		expression.value = [value]
		return expression
	}

	static fromString(str: string) {
		const expression = new Expression()
		expression.value = [{ kind: ExpressionKind.Text, value: str }]
		return expression
	}

	static fromState(state: string) {
		const expression = new Expression()
		expression.value = [{ kind: ExpressionKind.State, value: state }]
		return expression
	}

	toString() {
		return this.value
			.map((part) => (part.kind === ExpressionKind.State ? part.value : part.value))
			.join('')
	}

	exists() {
		return this.value.filter((part) => !!part.value).length > 0
	}

	isSingleState() {
		return this.value.length === 1 && this.value[0].kind === ExpressionKind.State
	}
}

export enum ExpressionKind {
	Text = 'text',
	State = 'state',
}

export type TextValue = {
	kind: ExpressionKind.Text
	value: string
}

export type StateValue = {
	kind: ExpressionKind.State
	value: string
}

export type Value = TextValue | StateValue
