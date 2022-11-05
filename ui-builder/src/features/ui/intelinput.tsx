import { CloseButton } from '@mantine/core'
import { useInputState } from '@mantine/hooks'
import produce from 'immer'
import _ from 'lodash'
import { useRef } from 'react'
import { Expression, ExpressionKind, Value } from '../states/expression'

export function Intelinput({
	label,
	options = [],
	value: expression,
	onChange,
}: {
	label?: string
	options?: string[]
	value: Expression
	onChange: (value: Expression) => void
	name?: string
	size?: 'xs'
	placeholder?: string
	autosize?: boolean
	maxRows?: number
}) {
	const [newValue, setNewValue] = useInputState('')
	const lastInputRef = useRef<HTMLInputElement>(null)

	return (
		<div
			className="text-xs space-y-0.5"
			tabIndex={0}
			onFocus={() => lastInputRef.current?.focus()}
		>
			{label && <label className="font-medium">{label}</label>}
			<div
				className="relative border border-gray-300 min-w-0 w-full rounded px-2.5 py-1  
                focus-within:border-rose-500 group font-mono"
			>
				<div className="flex gap-1 flex-wrap">
					{expression.value.map((inteliValue, index) => {
						switch (inteliValue.kind) {
							case ExpressionKind.Text:
								return (
									<input
										key={index}
										onFocus={(event) => {
											event.stopPropagation()
										}}
										ref={
											index === expression.value.length - 1
												? lastInputRef
												: undefined
										}
										className="outline-none w-full py-1 font-mono"
										style={{ maxWidth: `${inteliValue.value.length || 1}ch` }}
										value={inteliValue.value}
										onChange={(event) =>
											onChange(
												produce(expression, (draft) => {
													draft.value[index].value = event.target.value
												})
											)
										}
									/>
								)
							case ExpressionKind.State:
								return (
									<div
										key={index}
										className="whitespace-nowrap bg-gray-50 rounded px-1 flex gap-0.5 items-center border"
									>
										{inteliValue.value.name}
										<CloseButton
											size="xs"
											onClick={() =>
												onChange(
													produce(expression, (draft) => {
														draft.value.splice(index, 1)
													})
												)
											}
										/>
									</div>
								)
						}
					})}
					{_.last(expression.value)?.kind !== ExpressionKind.Text && (
						<input
							ref={lastInputRef}
							className="outline-none w-full py-1 font-mono"
							style={{ maxWidth: `${expression.value.length || 1}ch` }}
							value={newValue}
							onChange={setNewValue}
							onBlur={() => {
								if (!newValue) return
								onChange(
									produce(expression, (draft) => {
										draft.value.push({
											value: newValue,
											kind: ExpressionKind.Text,
										})
									})
								)
								setNewValue('')
							}}
						/>
					)}
				</div>
				{options.length !== 0 && (
					<div
						className="flex-col group-focus-within:flex hidden font-medium absolute top-full
                left-0 border mt-1 w-full rounded shadow-sm overflow-hidden p-1 bg-white z-10"
					>
						{options.map((option) => (
							<button
								type="button"
								key={option}
								className="hover:bg-gray-200 p-2 rounded text-left font-mono"
								onClick={() =>
									onChange(
										produce(expression, (draft) => {
											draft.value.push({
												kind: ExpressionKind.State,
												value: { name: option },
											})
										})
									)
								}
							>
								{option}
							</button>
						))}
					</div>
				)}
			</div>
		</div>
	)
}

export function inteliText(value: string) {
	return Expression.fromString(value)
}

export function inteliState(state: string) {
	return Expression.fromValue({ kind: ExpressionKind.State, value: { name: state } })
}

export function inteliToString(value: Value[]) {
	return value.map((v) => v.value).join('')
}

export function InteliState({
	label,
	value,
	onChange,
	options,
}: {
	label: string
	value?: InteliStateValue
	onChange: (value: InteliStateValue) => void
	options: string[]
}) {
	const inputValue: Value = value?.isState
		? {
				kind: ExpressionKind.State,
				value: { name: value.value },
		  }
		: {
				kind: ExpressionKind.Text,
				value: value?.value ?? '',
		  }

	return (
		<Intelinput
			label={label}
			value={Expression.fromValue(inputValue)}
			onChange={(newValue) => {
				if (_.isEmpty(newValue.value)) onChange(defaultInteliState())
				else {
					const last = _.last(newValue.value)!
					const value = _.isString(last.value) ? last.value : last.value.name
					onChange({
						value: value,
						isState: last.kind === ExpressionKind.State,
						mode: getMode(value),
					})
				}
			}}
			options={options}
		/>
	)
}

function getMode(value: string): InteliStateMode {
	if (value.startsWith('$store.page.')) return 'page'
	if (value.startsWith('$store.global.')) return 'global'
	if (value.startsWith('$store.url.')) return 'url'
	if (value.startsWith('$store.response.')) return 'response'
	if (value.startsWith('$store.source.')) return 'source'
	return 'page'
}

type InteliStateMode = 'page' | 'url' | 'global' | 'response' | 'source'

export type InteliStateValue = {
	value: string
	isState: boolean
	mode: InteliStateMode
}

export function defaultInteliState(): InteliStateValue {
	return { value: '', isState: false, mode: 'page' }
}

export function serializeInteliState(data: InteliStateValue): InteliStateValue | undefined {
	if (!_.isObject(data)) return undefined
	return {
		...data,
		value: data.value
			.replace('$store.page.', '')
			.replace('$store.global.', '')
			.replace('$store.url.', '')
			.replace('$store.response.', '')
			.replace('$store.source.', ''),
	}
}
