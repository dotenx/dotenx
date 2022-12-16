import { Switch, TextInput } from '@mantine/core'
import produce from 'immer'
import { ReactNode } from 'react'
import { TbFileText } from 'react-icons/tb'
import { Element } from '../element'
import { useElementsStore } from '../elements-store'

export class TextareaElement extends Element {
	name = 'Textarea'
	icon = (<TbFileText />)
	data = { placeholder: '', defaultValue: '', required: false, name: '' }

	render(): ReactNode {
		return (
			<textarea
				className={this.generateClasses()}
				placeholder={this.data.placeholder}
				defaultValue={this.data.defaultValue}
				name={this.data.name}
			/>
		)
	}

	renderOptions(): ReactNode {
		return <TextareaOptions element={this} />
	}
}

function TextareaOptions({ element }: { element: TextareaElement }) {
	const set = useElementsStore((store) => store.set)
	const changeRequired = (required: boolean) => {
		set(
			produce(element, (draft) => {
				draft.data.required = required
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
	const changePlaceholder = (placeholder: string) => {
		set(
			produce(element, (draft) => {
				draft.data.placeholder = placeholder
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

	return (
		<div className="space-y-6">
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
			<TextInput
				size="xs"
				label="Default value"
				value={element.data.defaultValue}
				onChange={(event) => changeDefaultValue(event.target.value)}
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
