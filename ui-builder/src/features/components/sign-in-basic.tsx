import { TextInput } from '@mantine/core'
import produce from 'immer'
import { ReactNode } from 'react'
import { API_URL } from '../../api'
import imageUrl from '../../assets/components/sc-sign-in-basic.png'
import { uuid } from '../../utils'
import { deserializeElement } from '../../utils/deserialize'
import { NavigateAction } from '../actions/navigate'
import { SetStateAction } from '../actions/set-state'
import { HttpMethod, useDataSourceStore } from '../data-source/data-source-store'
import { Element } from '../elements/element'
import { BoxElement } from '../elements/extensions/box'
import { ButtonElement } from '../elements/extensions/button'
import { FormElement } from '../elements/extensions/form'
import { LinkElement } from '../elements/extensions/link'
import { TextElement } from '../elements/extensions/text'
import { useProjectStore } from '../page/project-store'
import { LinkStyler } from '../simple/stylers/link-styler'
import { TextStyler } from '../simple/stylers/text-styler'
import { Expression } from '../states/expression'
import { ImageDrop } from '../ui/image-drop'
import { elementBase } from './basic-components/base'
import roundButton from './basic-components/round-button'
import roundInputWithLabel from './basic-components/round-input-with-label'
import { Component, ElementOptions } from './controller'
import { ComponentName } from './helpers'

export class SignInBasic extends Component {
	name = 'Basic Sign-in'
	image = imageUrl
	defaultData = deserializeElement(defaultData)
	data = { dataSourceName: '' }

	renderOptions(options: ElementOptions): ReactNode {
		const title = options.element.children?.[0].children?.[0].children?.[0] as TextElement
		const mainBox = options.element as BoxElement
		const mainButton = options.element.children?.[0].children?.[0].children?.[5]
			.children?.[0] as ButtonElement
		const signUpLink = options.element.children?.[0].children?.[0].children?.[6]
			.children?.[1] as LinkElement

		return (
			<div className="space-y-6">
				<ComponentName name="Sign In Basic" />
				<TextStyler label="Title" element={title} />
				<TextInput
					label="Button Text"
					name="buttonText"
					size="xs"
					value={mainButton.data.text}
					onChange={(event) =>
						options.set(
							produce(mainButton, (draft) => {
								draft.data.text = event.target.value
							})
						)
					}
				/>
				<ImageDrop
					onChange={(src) =>
						options.set(
							produce(mainBox, (draft) => {
								draft.style.desktop = {
									default: {
										...draft.style.desktop?.default,
										backgroundImage: `url(${src})`,
									},
								}
							})
						)
					}
					src={
						mainBox.style.desktop?.default?.backgroundImage
							? mainBox.style.desktop?.default?.backgroundImage.substring(
									4,
									mainBox.style.desktop?.default?.backgroundImage.length - 1
							  )
							: ''
					}
				/>
				<LinkStyler label="Sign-up link" element={signUpLink} />
			</div>
		)
	}

	onDelete() {
		const removeDataSource = useDataSourceStore.getState().removeByName
		removeDataSource(this.data.dataSourceName)
	}

	onCreate(root: Element) {
		const projectTag = useProjectStore.getState().tag
		const addDataSource = useDataSourceStore.getState().add
		const id = uuid()
		const url = Expression.fromString(`${API_URL}/user/management/project/${projectTag}/login`)
		const dataSourceName = `signin_${id}` // State name cannot contain space
		const navigateAction = new NavigateAction()
		navigateAction.to = Expression.fromString('/index.html')
		const setTokenAction = new SetStateAction()
		setTokenAction.stateName = {
			isState: true,
			mode: 'global',
			value: 'token',
		}
		setTokenAction.value = {
			isState: true,
			mode: 'response',
			value: 'accessToken',
		}
		addDataSource({
			id,
			stateName: dataSourceName,
			method: HttpMethod.Post,
			url,
			fetchOnload: false,
			body: new Expression(),
			headers: '',
			properties: [],
			onSuccess: [setTokenAction, navigateAction],
		})
		this.data.dataSourceName = dataSourceName
		const formElement = root.children?.[0].children?.[0] as FormElement
		formElement.data.dataSourceName = dataSourceName
	}
}

const wrapper = produce(new BoxElement(), (draft) => {
	draft.style.desktop = {
		default: {
			alignItems: 'center',
			backgroundColor: 'rgb(188, 213, 235)',
			backgroundImage:
				'url(https://images.unsplash.com/photo-1579546929518-9e396f3cc809?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MXxhbGx8fHx8fHx8fHwxNjY0Nzg0NzQz&auto=format&fit=crop&w=2400&q=80)',
			backgroundPosition: '50% 50%',
			backgroundRepeat: 'no-repeat',
			backgroundSize: 'cover',
			display: 'flex',
			fontFamily: 'Roboto',
			height: '100%',
			justifyContent: 'center',
			minHeight: '1000px',
			width: '100%',
		},
	}
}).serialize()

const formWrapper = produce(new BoxElement(), (draft) => {
	draft.style = {
		desktop: {
			default: {
				backgroundColor: 'rgb(255, 255, 255)',
				borderRadius: '10px',
				bottom: '0px',
				display: 'block',
				paddingBottom: '40px',
				paddingLeft: '110px',
				paddingRight: '110px',
				paddingTop: '62px',
				position: 'relative',
				width: '680px',
			},
		},
		tablet: {
			default: {
				width: '90%',
				paddingTop: '30px',
				paddingLeft: '5%',
				paddingRight: '5%',
			},
		},
		mobile: {},
	}
}).serialize()

const form = produce(new FormElement(), (draft) => {
	draft.data.dataSourceName = 'login'
}).serialize()

const defaultData = {
	...wrapper,
	components: [
		{
			...formWrapper,
			components: [
				{
					...form,
					components: [
						produce(new TextElement(), (draft) => {
							draft.style = {
								desktop: {
									default: {
										color: 'rgb(85, 85, 85)',
										display: 'block',
										fontSize: '39px',
										textAlign: 'center',
									},
								},
								tablet: {},
								mobile: {},
							}
							draft.data.text = Expression.fromString('Sign In')
						}).serialize(),
						...roundInputWithLabel({
							label: 'Email',
							inputName: 'email',
							inputType: 'text',
						}),
						...roundInputWithLabel({
							label: 'Password',
							inputName: 'password',
							inputType: 'password',
						}),
						...roundButton({
							label: 'Sign In',
							buttonStyle: {
								desktop: {
									default: {
										marginTop: '10px',
										color: 'white',
									},
								},
							},
							submit: true,
						}),
						{
							kind: 'Box',
							...elementBase,
							data: {
								style: {
									desktop: {
										default: {
											display: 'block',
											height: '79px',
											padding: '55px 0px 30px',
											textAlign: 'center',
											width: '100%',
											color: 'rgb(153, 153, 153)',
											font: '14px / 21px',
										},
									},
									tablet: {},
									mobile: {},
								},
							},
							components: [
								produce(new TextElement(), (draft) => {
									draft.style = {
										desktop: {
											default: {
												lineHeight: '21px',
												textAlign: 'center',
											},
										},
										tablet: {},
										mobile: {},
									}
									draft.data.text =
										Expression.fromString("Don't have an account?")
								}).serialize(),
								{
									kind: 'Link',
									...elementBase,
									data: {
										style: {
											desktop: {},
											tablet: {},
											mobile: {},
										},
										href: '/signup',
										openInNewTab: false,
									},
									components: [
										produce(new TextElement(), (draft) => {
											draft.style = {
												desktop: {
													default: {
														display: 'inline',
														color: 'rgb(153, 153, 153)',
														textAlign: 'center',
													},
												},
												tablet: {},
												mobile: {},
											}
											draft.data.text = Expression.fromString('Sign up now')
										}).serialize(),
									],
								},
							],
						},
					],
				},
			],
		},
	],
}
