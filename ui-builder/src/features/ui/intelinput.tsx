import { CloseButton } from '@mantine/core'
import { useInputState } from '@mantine/hooks'
import produce from 'immer'
import _ from 'lodash'
import { useRef } from 'react'
import { useGetStates } from '../data-bindings/use-get-states'

export function IntelinputText({
	value,
	onChange,
	label,
}: {
	value: string
	onChange: (value: string) => void
	label: string
}) {
	const states = useGetStates()

	return (
		<Intelinput
			label={label}
			options={states.map((state) => state.name)}
			value={value
				.split(' ')
				.map((word) =>
					word.startsWith('$store.')
						? { kind: IntelinputValueKind.Option, data: word }
						: { kind: IntelinputValueKind.Text, data: word }
				)
				.reduce<IntelinputValue[]>((acc, curr) => {
					if (
						_.last(acc)?.kind === IntelinputValueKind.Text &&
						curr.kind === IntelinputValueKind.Text
					) {
						return produce(acc, (draft) => {
							const last = _.last(draft)
							if (last) last.data = `${last.data} ${curr.data}`
						})
					}
					return [...acc, curr]
				}, [])}
			onChange={(value) => onChange(value.map((v) => v.data).join(' '))}
		/>
	)
}

export function Intelinput({
	label,
	options = [],
	value,
	onChange,
}: {
	label: string
	options?: string[]
	value: IntelinputValue[]
	onChange: (value: IntelinputValue[]) => void
}) {
	const [newValue, setNewValue] = useInputState('')
	const lastInputRef = useRef<HTMLInputElement>(null)

	return (
		<div
			className="text-xs space-y-0.5"
			tabIndex={0}
			onFocus={() => lastInputRef.current?.focus()}
		>
			<label className="font-medium">{label}</label>
			<div
				className="relative border border-gray-300 min-w-0 w-full rounded px-2.5 py-2 
                focus-within:border-rose-500 group font-mono"
			>
				<div className="flex gap-1 flex-wrap">
					{value.map((inteliValue, index) => {
						switch (inteliValue.kind) {
							case IntelinputValueKind.Text:
								return (
									<input
										key={index}
										onFocus={(event) => {
											event.stopPropagation()
										}}
										ref={index === value.length - 1 ? lastInputRef : undefined}
										className="outline-none w-full py-1 font-mono"
										style={{ width: `${inteliValue.data.length || 1}ch` }}
										value={inteliValue.data}
										onChange={(event) =>
											onChange(
												produce(value, (draft) => {
													draft[index].data = event.target.value
												})
											)
										}
									/>
								)
							case IntelinputValueKind.Option:
								return (
									<div
										key={index}
										className="whitespace-nowrap bg-gray-50 rounded px-1 flex gap-0.5 items-center border"
									>
										{inteliValue.data}
										<CloseButton
											size="xs"
											onClick={() =>
												onChange(
													produce(value, (draft) => {
														draft.splice(index, 1)
													})
												)
											}
										/>
									</div>
								)
						}
					})}
					{_.last(value)?.kind !== IntelinputValueKind.Text && (
						<input
							ref={lastInputRef}
							className="outline-none w-full py-1 font-mono"
							style={{ width: `${newValue.length || 1}ch` }}
							value={newValue}
							onChange={setNewValue}
							onBlur={() => {
								if (!newValue) return
								onChange(
									produce(value, (draft) => {
										draft.push({
											data: newValue,
											kind: IntelinputValueKind.Text,
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
										produce(value, (draft) => {
											draft.push({
												kind: IntelinputValueKind.Option,
												data: option,
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

export type IntelinputValue = {
	kind: IntelinputValueKind
	data: string
}

export enum IntelinputValueKind {
	Text = 'text',
	Option = 'option',
}

export function SingleIntelinput({
	label,
	value,
	onChange,
	options,
}: {
	label: string
	value?: IntelinputValue
	onChange: (value: IntelinputValue) => void
	options: string[]
}) {
	return (
		<Intelinput
			label={label}
			value={value ? [value] : []}
			onChange={(value) => {
				if (_.isEmpty(value)) onChange({ kind: IntelinputValueKind.Text, data: '' })
				else onChange(_.last(value)!)
			}}
			options={options}
		/>
	)
}
