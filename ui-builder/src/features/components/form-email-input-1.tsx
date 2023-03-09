import _ from 'lodash'
import { ReactNode } from 'react'
import imageUrl from '../../assets/components/form-email-input-1.png'
import { deserializeElement } from '../../utils/deserialize'
import { box, form, input, submit, txt } from '../elements/constructor'
import { Element } from '../elements/element'
import { setElement } from '../elements/elements-store'
import { BoxElement } from '../elements/extensions/box'
import { SubmitElement } from '../elements/extensions/submit'
import { TextElement } from '../elements/extensions/text'
import formScript from '../scripts/form.js?raw'
import { useSelectedElement } from '../selection/use-selected-component'
import { ButtonStyler } from '../simple/stylers/button-styler'
import { TextStyler } from '../simple/stylers/text-styler'
import { Component, OnCreateOptions } from './component'
import { ComponentWrapper } from './helpers/component-wrapper'

export class FormEmailInput1 extends Component {
	name = 'Email input form 1'
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
		})
		setElement(root, (draft) => (draft.script = script))
	}
}

// =============  renderOptions =============

function FormOptions() {
	const component = useSelectedElement<BoxElement>()!
	const h1 = component.find<TextElement>(tagIds.h1)!
	const h2 = component.find<TextElement>(tagIds.h2)!
	const submit = component.find<SubmitElement>(tagIds.submit)!

	return (
		<ComponentWrapper name="Email input form 1" stylers={['alignment', 'backgrounds', 'borders', 'spacing']}>
			<TextStyler label="Title" element={h1} />
			<TextStyler label="Subtitle" element={h2} />
			<ButtonStyler label="Submit button" element={submit} />
		</ComponentWrapper>
	)
}

// =============  defaultData =============

const tagIds = {
	form: 'form',
	h1: 'h1',
	h2: 'h2',
	submit: 'submit',
}

const defaultData = box([
	box([
		txt('Join Us and Get Access to the Latest News and Updates')
			.tag(tagIds.h1)
			.as('h1')
			.css({
				fontSize: '38px',
				fontWeight: 'bold',
				textAlign: 'center',
			})
			.cssTablet({
				fontSize: '32px',
			})
			.cssMobile({
				fontSize: '26px',
			}),
		txt(
			'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Ducimus culpa necessitatibus ipsum nobis voluptates animi, optio vel. Quis, hic cum. Quod, dolor deserunt?'
		)
			.tag(tagIds.h2)
			.as('h2')
			.css({
				fontSize: '18px',
				color: '#6B7280',
				maxWidth: '50%',
				textAlign: 'center',
			})
			.cssTablet({
				maxWidth: '60%',
				fontSize: '14px',
			})
			.cssMobile({
				maxWidth: '70%',
				fontSize: '12px',
			}),
		form([
			input().type('text').placeholder('Enter your email address').setName('email').css({
				border: 'none',
				padding: '10px',
				width: '100%',
				borderRadius: '5px 0px 0px 5px',
				fontSize: '16px',
				fontWeight: '500',
				color: '#6B7280',
				outline: 'none',
			}),
			submit('Subscribe')
				.tag(tagIds.submit)
				.css({
					backgroundColor: '#000',
					color: '#fff',
					border: 'none',
					padding: '10px',
					borderRadius: '0px 5px 5px 0px',
					fontSize: '16px',
					fontWeight: '500',
					outline: 'none',
				})
				.class('submit'),
		])
			.tag(tagIds.form)
			.css({
				display: 'flex',
				borderWidth: '1px',
				borderColor: '#000',
				borderStyle: 'solid',
				borderRadius: '5px',
				minWidth: '400px',
			})
			.cssTablet({
				minWidth: '300px',
			})
			.cssMobile({
				minWidth: '200px',
			}),
	]).css({
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'space-between',
		alignItems: 'center',
		height: '250px',
	}),
])
	.css({
		display: 'flex',
		paddingLeft: '15%',
		paddingRight: '15%',
		paddingTop: '50px',
		paddingBottom: '50px',
	})
	.cssTablet({
		paddingLeft: '10%',
		paddingRight: '10%',
	})
	.cssMobile({
		paddingLeft: '5%',
		paddingRight: '5%',
	})
	.serialize()
