/* eslint-disable no-mixed-spaces-and-tabs */
import { ActionIcon, JsonInput } from '@mantine/core'
import { useInputState } from '@mantine/hooks'
import _ from 'lodash'
import { nanoid } from 'nanoid'
import { useState } from 'react'
import {
	Controller,
	FieldErrors,
	FieldPath,
	FieldValues,
	useController,
	UseControllerProps,
} from 'react-hook-form'
import { IoSwapHorizontal } from 'react-icons/io5'
import { AnyJson } from '../../api'
import { FieldError } from './field'
import { GroupData, InputOrSelectKind, InputOrSelectValue } from './input-or-select'
import { Object } from './json-editor'

export interface JsonEditorInputProps<
	TFieldValues extends FieldValues,
	TName extends FieldPath<TFieldValues>
> extends UseControllerProps<TFieldValues, TName> {
	label?: string
	errors?: FieldErrors<TFieldValues>
	groups?: GroupData[]
	onlySimple?: boolean
	simpleInput?: boolean
}

export function JsonEditorInput<
	TFieldValues extends FieldValues,
	TName extends FieldPath<TFieldValues>
>({
	label,
	control,
	groups = [],
	onlySimple,
	errors,
	simpleInput,
	...rest
}: JsonEditorInputProps<TFieldValues, TName>) {
	const {
		field: { onChange, value },
	} = useController({ control, name: rest.name })
	const defaultMode =
		onlySimple || simpleInput
			? 'input'
			: _.isObject(value) && 'type' in value && value.type === InputOrSelectKind.Text
			? 'input'
			: 'editor'
	const [mode, setMode] = useState<'editor' | 'input'>(defaultMode)
	return (
		<div className="flex flex-col gap-1">
			{label && (
				<div className="flex items-center justify-between">
					<label htmlFor={rest.name} className="text-sm font-medium">
						{label}
					</label>
					{!onlySimple && !simpleInput && (
						<ActionIcon
							size="sm"
							onClick={() => {
								setMode((mode) => (mode === 'editor' ? 'input' : 'editor'))
								onChange('')
							}}
						>
							<IoSwapHorizontal
								size={14}
								title={mode === 'editor' ? 'Swap to input' : 'Swap to editor'}
							/>
						</ActionIcon>
					)}
				</div>
			)}
			<Controller
				control={control}
				name={rest.name}
				render={({ field: { onChange, value } }) => {
					if (mode === 'input') {
						const valueData = (value as InputOrSelectValue)?.data ?? undefined
						return (
							<JsonInputReal
								onChange={(value) => {
									onChange({ type: InputOrSelectKind.Text, data: value })
								}}
								value={valueData}
							/>
						)
					}

					return (
						<div className="p-2 font-mono text-xs font-medium border border-gray-300 rounded cursor-default bg-gray-50">
							<Object
								properties={
									!_.isArray(value)
										? [
												{
													id: nanoid(),
													name: '',
													value: {
														type: InputOrSelectKind.Text,
														data: '',
													},
												},
										  ]
										: value
								}
								changeProperties={onChange}
								outputGroups={groups}
							/>
						</div>
					)
				}}
			/>
			{rest.name && errors && <FieldError errors={errors} name={rest.name} />}
		</div>
	)
}

function JsonInputReal({
	value,
	onChange,
}: {
	value: AnyJson
	onChange: (value?: AnyJson) => void
}) {
	return (
		<JsonInput
			onChange={(value) => onChange(safeParseJson(value))}
			value={_.isString(value) ? value : JSON.stringify(value, null, 2)}
			validationError="Invalid json"
			formatOnBlur
			autosize
			minRows={4}
			styles={(theme) => ({
				input: { backgroundColor: theme.colors.gray[0] },
			})}
		/>
	)
}

const safeParseJson = (value: string): AnyJson | undefined => {
	try {
		return JSON.parse(value)
	} catch (error) {
		return value
	}
}
