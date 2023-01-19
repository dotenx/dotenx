/* eslint-disable no-mixed-spaces-and-tabs */
import { ActionIcon, Menu } from "@mantine/core"
import clsx from "clsx"
import produce from "immer"
import _ from "lodash"
import { nanoid } from "nanoid"
import {
	Controller,
	FieldErrors,
	FieldPath,
	FieldValues,
	UseControllerProps,
} from "react-hook-form"
import { IoAdd, IoCode, IoEllipsisHorizontal, IoList, IoRemove, IoText } from "react-icons/io5"
import { FieldError, GroupData, InputOrSelectKind, InputOrSelectValue } from "."
import { ComplexFieldRaw, FormattedValue, NestedValue } from "./complex-field"

export interface JsonEditorProps<
	TFieldValues extends FieldValues,
	TName extends FieldPath<TFieldValues>
> extends UseControllerProps<TFieldValues, TName> {
	label?: string
	errors?: FieldErrors<TFieldValues>
	groups?: GroupData[]
}

export function JsonEditor<
	TFieldValues extends FieldValues,
	TName extends FieldPath<TFieldValues>
>({ label, errors, control, groups = [], ...rest }: JsonEditorProps<TFieldValues, TName>) {
	return (
		<div className="flex flex-col gap-1">
			{label && (
				<label htmlFor={rest.name} className="text-sm font-medium">
					{label}
				</label>
			)}
			<Controller
				control={control}
				name={rest.name}
				render={({ field: { onChange, value } }) => {
					return (
						<div className="p-2 mx-1 font-mono text-xs font-medium border border-gray-400 rounded cursor-default bg-gray-50">
							<Object
								properties={
									!_.isArray(value)
										? [
												{
													id: nanoid(),
													name: "",
													value: {
														type: InputOrSelectKind.Text,
														data: "",
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

export type EditorInput = InputOrSelectValue | FormattedValue | NestedValue

enum PropertyKind {
	String = "string",
	Object = "object",
	Array = "array",
}

export interface EditorObjectValue {
	id: string
	name: string
	value: JsonEditorFieldValue
}

export type JsonEditorFieldValue = EditorInput | EditorObjectValue[] | string[]

export function Object({
	properties,
	changeProperties,
	outputGroups,
}: {
	properties: EditorObjectValue[]
	changeProperties: (value: EditorObjectValue[]) => void
	outputGroups: GroupData[]
}) {
	const changeKind = (kind: PropertyKind, index: number) => {
		switch (kind) {
			case PropertyKind.String:
				changeProperties(
					produce(properties, (draft) => {
						draft[index].value = { type: InputOrSelectKind.Text, data: "" }
					})
				)
				break
			case PropertyKind.Object:
				changeProperties(
					produce(properties, (draft) => {
						draft[index].value = [
							{
								id: nanoid(),
								name: "",
								value: { type: InputOrSelectKind.Text, data: "" },
							},
						]
					})
				)
				break
			case PropertyKind.Array:
				changeProperties(
					produce(properties, (draft) => {
						draft[index].value = [""]
					})
				)
				break
		}
	}

	const handleInsert = (index: number) => {
		changeProperties(
			produce(properties, (draft) => {
				draft.splice(index + 1, 0, {
					id: nanoid(),
					name: "",
					value: { type: InputOrSelectKind.Text, data: "" },
				})
			})
		)
	}

	return (
		<div className="group">
			<div className="space-y-1">
				{properties.map((property, index) => (
					<Property
						key={property.id}
						onRemove={() => changeProperties(properties.filter((_, i) => i !== index))}
						disableRemove={properties.length === 1}
						changeKind={(kind) => changeKind(kind, index)}
						onAdd={() => handleInsert(index)}
						kind={_.isArray(property.value) ? PropertyKind.Object : PropertyKind.String}
						property={property}
						changeProperty={(property) =>
							changeProperties(
								produce(properties, (draft) => {
									draft[index] = property
								})
							)
						}
						outputGroups={outputGroups}
					/>
				))}
			</div>
		</div>
	)
}

function Property({
	onRemove,
	changeKind,
	kind,
	onAdd,
	disableRemove,
	property,
	changeProperty,
	outputGroups,
}: {
	onRemove: () => void
	changeKind: (kind: PropertyKind) => void
	kind: PropertyKind
	onAdd: () => void
	disableRemove: boolean
	property: EditorObjectValue
	changeProperty: (value: EditorObjectValue) => void
	outputGroups: GroupData[]
}) {
	return (
		<div className={clsx("flex group", kind === PropertyKind.Object && "flex-col")}>
			<div className="flex items-center">
				<Actions
					onClickText={() => changeKind(PropertyKind.String)}
					onClickObject={() => changeKind(PropertyKind.Object)}
					onClickArray={() => changeKind(PropertyKind.Array)}
					onInsert={onAdd}
					onRemove={onRemove}
					disableRemove={disableRemove}
				/>
				<AutoWidthInput
					value={property.name}
					onChange={(name) => changeProperty({ ...property, name })}
				/>
			</div>

			<div className="grow">
				{!_.isArray(property.value) && (
					<div className="flex items-center">
						<div>:</div>
						<div className="grow">
							<ComplexFieldRaw
								compact
								value={property.value}
								onChange={(value) =>
									changeProperty({ ...property, value: value as EditorInput })
								}
								groups={outputGroups}
								valueKinds={["input-or-select"]}
							/>
						</div>
					</div>
				)}
				{_.isArray(property.value) && typeof property.value[0] !== "string" && (
					<div className="pl-6 mt-1">
						<Object
							properties={property.value as EditorObjectValue[]}
							changeProperties={(values) =>
								changeProperty({ ...property, value: values })
							}
							outputGroups={outputGroups}
						/>
					</div>
				)}
				{_.isArray(property.value) && typeof property.value[0] === "string" && (
					<div className="pl-6 mt-1">
						{(property.value as string[]).map((value, index) => (
							<ArrayItem
								key={index}
								index={index}
								onAdd={() =>
									changeProperty(
										produce(property, (draft) => {
											const values = draft.value as string[]
											values.splice(index + 1, 0, "")
										})
									)
								}
								onRemove={() =>
									changeProperty({
										...property,
										value: (property.value as string[]).filter(
											(_, i) => i !== index
										),
									})
								}
								disableRemove={(property.value as string[]).length === 1}
								onChange={(value) =>
									changeProperty(
										produce(property, (draft) => {
											const values = draft.value as string[]
											values[index] = value
										})
									)
								}
								value={value}
							/>
						))}
					</div>
				)}
			</div>
		</div>
	)
}

function ArrayItem({
	onAdd,
	onRemove,
	disableRemove,
	onChange,
	index,
	value,
}: {
	onAdd: () => void
	index: number
	onRemove: () => void
	disableRemove: boolean
	value: string
	onChange: (value: string) => void
}) {
	return (
		<div className="flex items-center my-px">
			<Actions onInsert={onAdd} onRemove={onRemove} disableRemove={disableRemove} />
			<div className="mr-1 text-xs font-light text-gray-400">{index}</div>
			<AutoWidthInput value={value} onChange={onChange} />
		</div>
	)
}

function Actions({
	onClickText,
	onClickObject,
	onClickArray,
	onInsert,
	onRemove,
	disableRemove,
}: {
	onClickText?: () => void
	onClickObject?: () => void
	onClickArray?: () => void
	onInsert: () => void
	onRemove: () => void
	disableRemove: boolean
}) {
	const canChangeType = onClickText || onClickObject || onClickArray

	return (
		<Menu shadow="md" width={200}>
			<Menu.Target>
				<ActionIcon
					size="xs"
					type="button"
					mr="xs"
					className="opacity-0 group-hover:opacity-100"
				>
					<IoEllipsisHorizontal />
				</ActionIcon>
			</Menu.Target>
			<Menu.Dropdown>
				{canChangeType && <Menu.Label>Type</Menu.Label>}
				{onClickText && (
					<Menu.Item icon={<IoText />} onClick={onClickText}>
						Text
					</Menu.Item>
				)}
				{onClickObject && (
					<Menu.Item icon={<IoCode />} onClick={onClickObject}>
						Object
					</Menu.Item>
				)}
				{onClickArray && (
					<Menu.Item icon={<IoList />} onClick={onClickArray}>
						Array
					</Menu.Item>
				)}
				{canChangeType && <Menu.Divider />}
				<Menu.Item icon={<IoAdd />} onClick={onInsert}>
					Insert
				</Menu.Item>
				<Menu.Item icon={<IoRemove />} onClick={onRemove} disabled={disableRemove}>
					Remove
				</Menu.Item>
			</Menu.Dropdown>
		</Menu>
	)
}

function AutoWidthInput({
	minWidth = 1,
	value,
	onChange,
}: {
	minWidth?: number
	value: string
	onChange: (value: string) => void
}) {
	const inputWidth = `${(value.length > minWidth ? value.length : minWidth) + 3}ch`

	return (
		<input
			className={clsx(
				"px-[1ch] py-1 rounded border outline-none focus:ring-1 ring-rose-400 bg-inherit focus:bg-white hover:bg-white",
				value.length === 0 ? "border-dashed border-gray-400" : "border-gray-50"
			)}
			style={{ width: inputWidth }}
			value={value}
			onChange={(e) => onChange(e.target.value)}
		/>
	)
}
