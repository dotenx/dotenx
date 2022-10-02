import { Button, CloseButton, Switch, TextInput } from '@mantine/core'
import produce from 'immer'
import { ReactNode } from 'react'
import { TbPlus, TbSelect } from 'react-icons/tb'
import { uuid } from '../../../utils'
import { Element } from '../element'
import { useElementsStore } from '../elements-store'

export class SelectElement extends Element {
	name = 'Select'
	icon = (<TbSelect />)
	data = { options: [] as Option[], defaultValue: '', name: '', required: false }

	render(): ReactNode {
		return (
			<select
				defaultValue={this.data.defaultValue}
				name={this.data.name}
				required={this.data.required}
				className={this.generateClasses()}
			>
				{this.data.options.map((option, index) => (
					<option key={index} value={option.value}>
						{option.label}
					</option>
				))}
			</select>
		)
	}

	renderOptions(): ReactNode {
		return <SelectOptions element={this} />
	}
}

type Option = {
	label: string
	value: string
	key: string
}

function SelectOptions({ element }: { element: SelectElement }) {
	const set = useElementsStore((store) => store.set)
	const { options, required } = element.data

	const changeOptions = (options: Option[]) => {
		set(
			produce(element, (draft) => {
				draft.data.options = options
			})
		)
	}
	const changeName = (name: string) => {
		set(
			produce(element, (draft) => {
				draft.data.name = name
			})
		)
	}
	const changeDefaultValue = (defaultValue: string) => {
		set(
			produce(element, (draft) => {
				draft.data.defaultValue = defaultValue
			})
		)
	}
	const changeRequired = (required: boolean) => {
		set(
			produce(element, (draft) => {
				draft.data.required = required
			})
		)
	}

	return (
		<div className="space-y-6">
			<form className="space-y-4">
				{options.map((item, index) => (
					<div className="px-4 py-2 border rounded" key={item.key}>
						<CloseButton
							ml="auto"
							size="xs"
							onClick={() =>
								changeOptions(options.filter((option) => item.key !== option.key))
							}
						/>
						<TextInput
							size="xs"
							label="Label"
							mb="xs"
							value={options[index].label}
							onChange={(event) =>
								changeOptions(
									options.map((option) =>
										option.key === item.key
											? { ...option, label: event.target.value }
											: option
									)
								)
							}
						/>
						<TextInput
							size="xs"
							label="Value"
							value={options[index].value}
							onChange={(event) =>
								changeOptions(
									options.map((option) =>
										option.key === item.key
											? { ...option, value: event.target.value }
											: option
									)
								)
							}
						/>
					</div>
				))}
				<Button
					leftIcon={<TbPlus />}
					onClick={() =>
						changeOptions([...options, { label: '', value: '', key: uuid() }])
					}
					size="xs"
				>
					Option
				</Button>
			</form>
			<TextInput
				size="xs"
				label="Name"
				value={element.data.name}
				onChange={(event) => changeName(event.target.value)}
			/>
			<TextInput
				size="xs"
				label="Default value"
				value={element.data.defaultValue}
				onChange={(event) => changeDefaultValue(event.target.value)}
			/>
			<Switch
				size="xs"
				label="Required"
				value={required.toString()}
				onChange={(event) => changeRequired(Boolean(event.target.value))}
			/>
		</div>
	)
}
