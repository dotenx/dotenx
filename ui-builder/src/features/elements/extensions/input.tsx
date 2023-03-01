import { Select, Switch, TextInput } from '@mantine/core'
import { ReactNode } from 'react'
import { TbFileImport } from 'react-icons/tb'
import { Expression } from '../../states/expression'
import { SingleIntelinput } from '../../ui/intelinput'
import { Element } from '../element'
import { useSetElement } from '../elements-store'

export class InputElement extends Element {
	name = 'Input'
	icon = (<TbFileImport />)
	data = {
		defaultValue: new Expression(),
		name: '',
		placeholder: '',
		required: false,
		type: 'text',
	}

	render(): ReactNode {
		return (
			<input
				defaultValue={this.data.defaultValue.toString()}
				name={this.data.name}
				placeholder={this.data.placeholder}
				type={this.data.type}
				className={this.generateClasses()}
			/>
		)
	}

	renderOptions(): ReactNode {
		return <InputOptions element={this} />
	}

	type(type: string) {
		this.data.type = type
		return this
	}
}

function InputOptions({ element }: { element: InputElement }) {
	const set = useSetElement()
	const changeType = (type: string) => {
		set(element, (draft) => (draft.data.type = type))
	}
	const changeRequired = (required: boolean) => {
		set(element, (draft) => (draft.data.required = required))
	}
	const changeName = (name: string) => {
		set(element, (draft) => (draft.data.name = name))
	}
	const changePlaceholder = (placeholder: string) => {
		set(element, (draft) => (draft.data.placeholder = placeholder))
	}
	const changeDefaultValue = (defaultValue: Expression) => {
		set(element, (draft) => (draft.data.defaultValue = defaultValue))
	}

	return (
		<div className="space-y-6">
			<Select
				size="xs"
				label="Type"
				data={[
					'text',
					'number',
					'email',
					'url',
					'checkbox',
					'radio',
					'range',
					'date',
					'datetime-local',
					'search',
					'tel',
					'time',
					'file',
					'month',
					'week',
					'password',
					'color',
					'hidden',
				]}
				value={element.data.type}
				onChange={(value) => changeType(value ?? 'text')}
			/>
			<TextInput
				size="xs"
				label="Name"
				value={element.data.name}
				onChange={(event) => changeName(event.target.value)}
			/>
			<TextInput
				size="xs"
				label="Placeholder"
				value={element.data.placeholder}
				onChange={(event) => changePlaceholder(event.target.value)}
			/>
			<SingleIntelinput
				label="Default value"
				value={element.data.defaultValue}
				onChange={(value) => changeDefaultValue(value)}
			/>
			<Switch
				size="xs"
				label="Required"
				checked={element.data.required}
				onChange={(event) => changeRequired(event.currentTarget.checked)}
			/>
		</div>
	)
}
