import _ from 'lodash'
import { ReactNode } from 'react'
import imageUrl from '../../assets/components/form-email-input-2.png'
import { deserializeElement } from '../../utils/deserialize'
import { form, frame, input, submit } from '../elements/constructor'
import { Element } from '../elements/element'
import { setElement } from '../elements/elements-store'
import { BoxElement } from '../elements/extensions/box'
import { SubmitElement } from '../elements/extensions/submit'
import formScript from '../scripts/form.js?raw'
import { useSelectedElement } from '../selection/use-selected-component'
import { ButtonStyler } from '../simple/stylers/button-styler'
import { Component, OnCreateOptions } from './component'
import { ComponentWrapper } from './helpers/component-wrapper'
import { InputElement } from '../elements/extensions/input'
import { InputStyler } from '../simple/stylers/input-styler'
import { color } from '../simple/palette'

export class FormEmailInput2 extends Component {
	name = 'Email input form 2'
	image = imageUrl
	defaultData = deserializeElement(defaultData)

	renderOptions(): ReactNode {
		return <FormOptions />
	}

	onCreate(root: Element, options: OnCreateOptions) {
		const compiled = _.template(formScript)
		const script = compiled({
			id: root.id,
			projectTag: options.projectTag,
			pageName: options.pageName,
			formName: 'Email form',
		})
		setElement(root, (draft) => (draft.script = script))
	}
}

// =============  renderOptions =============

function FormOptions() {
	const component = useSelectedElement<BoxElement>()!
	const input = component.find<InputElement>(tagIds.input)!
	const submit = component.find<SubmitElement>(tagIds.submit)!

	return (
		<ComponentWrapper
			name="Email input form 2"
			stylers={['alignment', 'backgrounds', 'borders', 'spacing']}
		>
			<InputStyler label="Email input" element={input} />
			<ButtonStyler label="Submit button" element={submit} />
		</ComponentWrapper>
	)
}

// =============  defaultData =============

const tagIds = {
	form: 'form',
	input: 'input',
	submit: 'submit',
}

const defaultData = frame([
	form([
		input()
			.type('text')
			.placeholder('Please enter your email address')
			.tag(tagIds.input)
			.setName('email')
			.css({
				border: 'none',
				backgroundColor: color('background'),
				borderColor: 'hsla(0, 0%, 0%, 0)',
				padding: '10px',
				borderRadius: '20px',
				fontSize: '16px',
				fontWeight: '500',
				color: '#fff',
				outline: 'none',
				flex: '1',
				minWidth: '400px'
			}).cssTablet({
				minWidth: '300px',
			}),
		submit('Subscribe')
			.tag(tagIds.submit)
			.css({
				backgroundColor: '#000',
				color: '#fff',
				border: 'none',
				padding: '10px',
				borderRadius: '20px',
				fontSize: '16px',
				fontWeight: '500',
				outline: 'none',
				flex: '1'
			})
			.class('submit'),
	])
		.tag(tagIds.form)
		.css({
			display: 'flex',
			border: 'none',
			columnGap: '8px',
		})
		.cssMobile({
			flexDirection: 'column',
			rowGap: '10px',
			alignItems: 'center',
			justifyContent: 'center',
		}),
])
	.serialize()
