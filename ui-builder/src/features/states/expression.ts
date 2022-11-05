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
		expression.value = [{ kind: ExpressionKind.State, value: { name: state } }]
		return expression
	}
}

export type State = { name: string }

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
	value: State
}

export type Value = TextValue | StateValue
