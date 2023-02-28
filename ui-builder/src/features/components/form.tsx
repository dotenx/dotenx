import { Select } from '@mantine/core'
import produce from 'immer'
import _ from 'lodash'
import { ReactNode } from 'react'
import imageUrl from '../../assets/components/gallery-basic-rounded.png'
import { deserializeElement } from '../../utils/deserialize'
import { txt } from '../elements/constructor'
import { Element } from '../elements/element'
import { setElement, useSetElement } from '../elements/elements-store'
import { BoxElement } from '../elements/extensions/box'
import { FormElement } from '../elements/extensions/form'
import { InputElement } from '../elements/extensions/input'
import { SubmitElement } from '../elements/extensions/submit'
import { TextElement } from '../elements/extensions/text'
import formScript from '../scripts/form.js?raw'
import { useSelectedElement } from '../selection/use-selected-component'
import { BoxStyler } from '../simple/stylers/box-styler'
import { TextStyler } from '../simple/stylers/text-styler'
import { Component } from './component'
import { ComponentWrapper } from './helpers/component-wrapper'
import { DndTabs } from './helpers/dnd-tabs'
import { OptionsWrapper } from './helpers/options-wrapper'

export class Form extends Component {
	name = 'Form'
	image = imageUrl
	defaultData = deserializeElement(defaultData)

	renderOptions(): ReactNode {
		return <FormOptions />
	}

	onCreate(root: Element) {
		const compiled = _.template(formScript)
		const script = compiled({ id: root.id })
		setElement(root, (draft) => (draft.script = script))
	}
}

// =============  renderOptions =============

function FormOptions() {
	const component = useSelectedElement<BoxElement>()!
	const form = component.find<FormElement>(tagIds.form)!
	const inputsWrapper = component.find<BoxElement>(tagIds.inputs)!

	return (
		<ComponentWrapper name="Form" stylers={['alignment', 'backgrounds', 'borders', 'spacing']}>
			<BoxStyler
				label="Form"
				element={form}
				stylers={['backgrounds', 'borders', 'spacing']}
			/>
			<DndTabs
				containerElement={inputsWrapper}
				renderItemOptions={(item) => <InputOptions item={item} />}
				insertElement={insertInput}
			/>
		</ComponentWrapper>
	)
}

function InputOptions({ item }: { item: Element }) {
	const label = item.children?.[0] as TextElement
	const input = item.children?.[1] as InputElement
	const set = useSetElement()

	return (
		<OptionsWrapper>
			<TextStyler
				label="Label"
				element={label}
				onChange={(text) => set(input, (draft) => (draft.data.name = text))}
			/>
			<Select
				size="xs"
				data={[
					{ label: 'Text', value: 'text' },
					{ label: 'Email', value: 'email' },
					{ label: 'Password', value: 'password' },
					{ label: 'Phone', value: 'tel' },
					{ label: 'Date', value: 'date' },
					{ label: 'Checkbox', value: 'checkbox' },
				]}
				label="Type"
				defaultValue={input.data.type}
				onChange={(value) => {
					set(input, (draft) => {
						draft.data.type = value ?? 'text'
						if (value === 'checkbox') {
							draft.style.desktop!.default!.width = 'auto'
						} else {
							draft.style.desktop!.default!.width = '100%'
						}
					})
				}}
			/>
		</OptionsWrapper>
	)
}

const insertInput = () => createInput('New Field', 'text')

// =============  defaultData =============

const tagIds = {
	form: 'form',
	inputs: 'inputs',
}

const divFlex = produce(new BoxElement(), (draft) => {
	draft.style.desktop = {
		default: {
			display: 'flex',
			justifyContent: 'center',
			alignItems: 'center',
			width: '100%',
			paddingTop: '5%',
			paddingBottom: '5%',
			paddingLeft: '20%',
			paddingRight: '20%',
		},
	}

	draft.style.tablet = {
		default: {
			paddingTop: '3%',
			paddingBottom: '3%',
			paddingLeft: '10%',
			paddingRight: '10%',
		},
	}

	draft.style.mobile = {
		default: {
			paddingTop: '2%',
			paddingBottom: '2%',
			paddingLeft: '5%',
			paddingRight: '5%',
		},
	}
}).serialize()

const form = produce(new FormElement(), (draft) => {
	draft.style.desktop = {
		default: {
			width: '60%',
			display: 'flex',
			flexDirection: 'column',
			justifyContent: 'space-between',
			alignItems: 'stretch',
		},
	}

	draft.tagId = tagIds.form
}).serialize()

const inputsWrapper = produce(new BoxElement(), (draft) => {
	draft.tagId = tagIds.inputs
}).serialize()

const submit = produce(new SubmitElement(), (draft) => {
	draft.data.text = 'Submit'

	draft.style.desktop = {
		default: {
			backgroundColor: 'hsla(210, 0%, 0%, 1)',
			color: 'hsla(0, 0%, 100%, 1)',
			borderRadius: '10px',
			paddingLeft: '20px',
			paddingRight: '20px',
			paddingTop: '8px',
			paddingBottom: '8px',
			alignSelf: 'self-end',
		},
		hover: {
			backgroundColor: 'hsla(100, 0%, 39%, 1)',
		},
	}

	draft.style.tablet = {
		default: {
			paddingLeft: '15px',
			paddingRight: '15px',
			paddingTop: '5px',
			paddingBottom: '5px',
		},
	}

	draft.style.mobile = {
		default: {
			paddingLeft: '10px',
			paddingRight: '10px',
			paddingTop: '3px',
			paddingBottom: '3px',
		},
	}
}).serialize()

const createInput = (
	label: string,
	inputType:
		| 'text'
		| 'number'
		| 'email'
		| 'url'
		| 'checkbox'
		| 'radio'
		| 'range'
		| 'date'
		| 'datetime-local'
		| 'search'
		| 'tel'
		| 'time'
		| 'file'
		| 'month'
		| 'week'
		| 'password'
		| 'color'
		| 'hidden' = 'text'
) => {
	const container = new BoxElement().css({
		display: 'grid',
		gridTemplateColumns: '1fr 2fr',
		justifyItems: 'self-start',
		paddingTop: '10px',
		paddingBottom: '10px',
	})

	container.cssTablet({
		gridTemplateColumns: '1fr',
	})

	const labelElement = txt(label).css({
		fontSize: '16px',
	})

	const inputElement = produce(new InputElement(), (draft) => {
		draft.data.type = inputType
		draft.data.placeholder = label
		draft.data.name = label
		draft.style.desktop = {
			default: {
				width: '100%',
				border: '1px solid #e0e0e0',
				borderRadius: '5px',
				height: '40px',
				paddingLeft: '5px',
				paddingRight: '5px',
				paddingTop: '3px',
				paddingBottom: '3px',
			},
		}
	})

	container.populate([labelElement, inputElement])

	return container
}

const inputs = [
	createInput('First Name', 'text'),
	createInput('Last Name', 'text'),
	createInput('Email', 'email'),
]

const defaultData = {
	...divFlex,
	components: [
		{
			...form,
			components: [
				{
					...inputsWrapper,
					components: [...inputs.map((input) => input.serialize())],
				},
				{ ...submit },
			],
		},
	],
}
