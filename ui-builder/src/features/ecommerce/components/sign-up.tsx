import _ from 'lodash'
import imageUrl from '../../../assets/themes/ecommerce/product-item.png'
import { Controller, ElementOptions, OnCreateOptions } from '../../controllers/controller'
import { ControllerWrapper } from '../../controllers/helpers/controller-wrapper'
import { box, flex, link, txt } from '../../elements/constructor'
import { Element } from '../../elements/element'
import { setElement } from '../../elements/elements-store'
import { ButtonElement } from '../../elements/extensions/button'
import { TextElement } from '../../elements/extensions/text'
import signUpScript from '../../scripts/sign-up.js?raw'
import { ButtonStyler } from '../../simple/stylers/button-styler'
import { TextStyler } from '../../simple/stylers/text-styler'
import { shared } from '../shared'

export class SignUp extends Controller {
	name = 'Sign up'
	image = imageUrl
	defaultData = component()
	renderOptions = ({ element: wrapper }: ElementOptions) => {
		const title = wrapper.find<TextElement>(tags.title)!
		const button = wrapper.find<ButtonElement>(tags.button)!

		return (
			<ControllerWrapper name={this.name}>
				<TextStyler element={title} label="Title" />
				<ButtonStyler element={button} label="Button" />
			</ControllerWrapper>
		)
	}

	onCreate(root: Element, options: OnCreateOptions) {
		const compiled = _.template(signUpScript)
		const script = compiled({ projectTag: options.projectTag })
		setElement(root, (draft) => (draft.script = script))
	}
}

const tags = {
	title: 'title',
	button: 'button',
}

const component = () =>
	box([
		shared
			.paper()
			.populate([
				shared.title().txt('Sign up').tag(tags.title),
				shared.input('Name').class('name'),
				shared.input('Email').class('email'),
				shared.input('Password', 'password').class('password'),
				shared.button().txt('Sign up').tag(tags.button).class('submit'),
				flex([
					txt('Already have an account?'),
					link().txt('Sign in').css({
						marginLeft: '5px',
						fontWeight: 'bold',
						cursor: 'pointer',
						textDecoration: 'none',
					}),
				]),
			])
			.css({
				padding: '0 30px',
				display: 'flex',
				justifyContent: 'center',
				gap: '20px',
				flexDirection: 'column',
				maxWidth: '400px',
				margin: '0 auto',
			}),
	]).css({
		minHeight: '100vh',
		paddingTop: '100px',
	})
