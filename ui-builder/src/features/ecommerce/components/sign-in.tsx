import _ from 'lodash'
import imageUrl from '../../../assets/themes/ecommerce/sign-in.png'
import { Controller, ElementOptions, OnCreateOptions } from '../../controllers/controller'
import { ControllerWrapper } from '../../controllers/helpers/controller-wrapper'
import { box, flex, link, txt } from '../../elements/constructor'
import { Element } from '../../elements/element'
import { setElement } from '../../elements/elements-store'
import { ButtonElement } from '../../elements/extensions/button'
import { LinkElement } from '../../elements/extensions/link'
import { TextElement } from '../../elements/extensions/text'
import signInScript from '../../scripts/sign-in.js?raw'
import { ButtonStyler } from '../../simple/stylers/button-styler'
import { LinkStyler } from '../../simple/stylers/link-styler'
import { TextStyler } from '../../simple/stylers/text-styler'
import { shared } from '../shared'

export class SignIn extends Controller {
	name = 'Sign in'
	image = imageUrl
	defaultData = component()
	renderOptions = ({ element: wrapper }: ElementOptions) => {
		const title = wrapper.find<TextElement>(tags.title)!
		const button = wrapper.find<ButtonElement>(tags.button)!
		const signUpLink = wrapper.find<LinkElement>(tags.signUpLink)!

		return (
			<ControllerWrapper name={this.name}>
				<TextStyler element={title} label="Title" />
				<ButtonStyler element={button} label="Button" />
				<LinkStyler element={signUpLink} label="Sign up link" />
			</ControllerWrapper>
		)
	}

	onCreate(root: Element, options: OnCreateOptions) {
		const compiled = _.template(signInScript)
		const script = compiled({ projectTag: options.projectTag })
		setElement(root, (draft) => (draft.script = script))
	}
}

const tags = {
	title: 'title',
	button: 'button',
	signUpLink: 'sign-up-link',
}

const component = () =>
	box([
		shared
			.paper()
			.populate([
				shared.title().txt('Sign in').tag(tags.title),
				shared.input('Email').class('email'),
				shared.input('Password', 'password').class('password'),
				shared.button().txt('Sign in').tag(tags.button).class('submit'),
				flex([
					txt("Don't have an account?"),
					link().txt('Sign up').tag(tags.signUpLink).css({
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
