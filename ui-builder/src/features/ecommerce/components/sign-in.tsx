import { TextInput } from '@mantine/core'
import { useAtomValue } from 'jotai'
import _ from 'lodash'
import { useState } from 'react'
import imageUrl from '../../../assets/themes/ecommerce/sign-in.png'
import { Component, OnCreateOptions } from '../../components/component'
import { ComponentWrapper } from '../../components/helpers/component-wrapper'
import { box, flex, link, txt } from '../../elements/constructor'
import { Element } from '../../elements/element'
import { setElement } from '../../elements/elements-store'
import { BoxElement } from '../../elements/extensions/box'
import { ButtonElement } from '../../elements/extensions/button'
import { LinkElement } from '../../elements/extensions/link'
import { TextElement } from '../../elements/extensions/text'
import { projectTagAtom } from '../../page/top-bar'
import signInScript from '../../scripts/sign-in.js?raw'
import { useSelectedElement } from '../../selection/use-selected-component'
import { ButtonStyler } from '../../simple/stylers/button-styler'
import { LinkStyler } from '../../simple/stylers/link-styler'
import { TextStyler } from '../../simple/stylers/text-styler'
import { shared } from '../shared'

type DataType = {
	redirect: string
}

export class SignIn extends Component {
	name = 'Sign in'
	image = imageUrl
	defaultData = component()
	data: DataType = { redirect: '/index' }

	renderOptions = () => (
		<SignInOptions data={this.data} changeData={(value) => (this.data = value)} />
	)

	onCreate(root: Element, options: OnCreateOptions) {
		const compiled = _.template(signInScript)
		const script = compiled({
			id: root.id,
			projectTag: options.projectTag,
			redirect: this.data.redirect,
		})
		setElement(root, (draft) => (draft.script = script))
	}
}

function SignInOptions({
	data,
	changeData,
}: {
	data: DataType
	changeData: (value: DataType) => void
}) {
	const wrapper = useSelectedElement<BoxElement>()!
	const title = wrapper.find<TextElement>(tags.title)!
	const button = wrapper.find<ButtonElement>(tags.button)!
	const signUpLink = wrapper.find<LinkElement>(tags.signUpLink)!
	const [redirect, setRedirect] = useState(data.redirect)
	const projectTag = useAtomValue(projectTagAtom)

	return (
		<ComponentWrapper name="Sign in">
			<TextStyler element={title} label="Title" />
			<ButtonStyler element={button} label="Button" />
			<LinkStyler element={signUpLink} label="Sign up link" />
			<TextInput
				size="xs"
				label="Redirect after sign in"
				value={redirect}
				onChange={(event) => {
					const value = event.target.value
					setRedirect(value)
					changeData({ redirect: value })
					const compiled = _.template(signInScript)
					const script = compiled({ id: wrapper.id, projectTag, redirect: value })
					setElement(wrapper, (draft) => (draft.script = script))
				}}
			/>
		</ComponentWrapper>
	)
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
						color: 'inherit',
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
