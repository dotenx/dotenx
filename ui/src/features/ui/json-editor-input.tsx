/* eslint-disable no-mixed-spaces-and-tabs */
import { ActionIcon, JsonInput } from '@mantine/core'
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
import { FieldError } from './field'
import { GroupData, InputOrSelectKind } from './input-or-select'
import { Object } from './json-editor'

export interface JsonEditorInputProps<
	TFieldValues extends FieldValues,
	TName extends FieldPath<TFieldValues>
> extends UseControllerProps<TFieldValues, TName> {
	label?: string
	errors?: FieldErrors<TFieldValues>
	groups?: GroupData[]
	onlySimple?: boolean
}

export function JsonEditorInput<
	TFieldValues extends FieldValues,
	TName extends FieldPath<TFieldValues>
>({
	label,
	errors,
	control,
	groups = [],
	onlySimple,
	...rest
}: JsonEditorInputProps<TFieldValues, TName>) {
	const {
		field: { onChange, value },
	} = useController({ control, name: rest.name })
	const defaultMode = onlySimple
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
					{!onlySimple && (
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
					const valueData = (value as any)?.data ?? '' 
					const jsonInputValue = _.isString(valueData) ? valueData : JSON.stringify(valueData) 
					if (mode === 'input')
						return (
							<JsonInput
								onChange={(value) =>
									onChange({ type: InputOrSelectKind.Text, data: value })
								}
								value={jsonInputValue}
								validationError={!onlySimple && 'Invalid json'}
								formatOnBlur
								autosize
								minRows={4}
								styles={(theme) => ({
									input: { backgroundColor: theme.colors.gray[0] },
								})}
							/>
						)

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
