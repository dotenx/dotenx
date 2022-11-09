import { TextInput } from '@mantine/core'
import produce from 'immer'
import { ReactNode } from 'react'
import imageUrl from '../../assets/components/sc-sign-in-basic.png'
import { deserializeElement } from '../../utils/deserialize'
import { BoxElement } from '../elements/extensions/box'
import { ButtonElement } from '../elements/extensions/button'
import { TextElement } from '../elements/extensions/text'
import { ImageDrop } from '../ui/image-drop'
import { Controller, ElementOptions } from './controller'

import { uuid } from '../../utils'
import { NavigateAction } from '../actions/navigate'
import { HttpMethod, useDataSourceStore } from '../data-source/data-source-store'
import { Element } from '../elements/element'
import { FormElement } from '../elements/extensions/form'
import { LinkElement } from '../elements/extensions/link'
import { useProjectStore } from '../page/project-store'
import { Expression } from '../states/expression'
import { Intelinput, inteliText } from '../ui/intelinput'
import { elementBase } from './basic-components/base'
import roundButton from './basic-components/round-button'
import roundInputWithLabel from './basic-components/round-input-with-label'
import { ComponentName } from './helpers'

export class SignUpBasic extends Controller {
	name = 'Basic Sign-up '
	image = imageUrl
	defaultData = deserializeElement(defaultData)
	data = { dataSourceName: '' }

	renderOptions(options: ElementOptions): ReactNode {
		const title = options.element.children?.[0].children?.[0].children?.[0] as TextElement
		const mainBox = options.element as BoxElement
		const mainButton = options.element.children?.[0].children?.[0].children?.[5]
			.children?.[0] as ButtonElement
		const tcLink = options.element.children?.[0].children?.[0].children?.[6]
			.children?.[1] as LinkElement
		const ppLink = options.element.children?.[0].children?.[0].children?.[6]
			.children?.[3] as LinkElement
		const signInLink = options.element.children?.[0].children?.[0].children?.[7]
			.children?.[1] as LinkElement

		return (
			<div className="space-y-6">
				<ComponentName name="Sign Up Basic" />
				<Intelinput
					label="Title"
					name="title"
					size="xs"
					value={title.data.text}
					onChange={(value) =>
						options.set(
							produce(title, (draft) => {
								draft.data.text = value
							})
						)
					}
				/>
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
				<TextInput
					label="Terms of service link"
					name="tcLink"
					size="xs"
					value={tcLink.data.href}
					onChange={(event) =>
						options.set(
							produce(tcLink, (draft) => {
								draft.data.href = event.target.value
							})
						)
					}
				/>
				<TextInput
					label="Privacy policy link"
					name="ppLink"
					size="xs"
					value={ppLink.data.href}
					onChange={(event) =>
						options.set(
							produce(ppLink, (draft) => {
								draft.data.href = event.target.value
							})
						)
					}
				/>
				<TextInput
					label="Sign-in link"
					name="signInLink"
					size="xs"
					value={signInLink.data.href}
					onChange={(event) =>
						options.set(
							produce(signInLink, (draft) => {
								draft.data.href = event.target.value
							})
						)
					}
				/>
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
		const url = inteliText(
			`https://api.dotenx.com/user/management/project/${projectTag}/register`
		)
		const dataSourceName = `signup_${id}` // State name cannot contain space
		const navigateAction = new NavigateAction()
		navigateAction.to = '/login.html'
		addDataSource({
			id,
			stateName: dataSourceName,
			method: HttpMethod.Post,
			url,
			fetchOnload: false,
			body: '',
			headers: '',
			properties: [],
			onSuccess: [navigateAction],
		})
		this.data.dataSourceName = dataSourceName
		const formElement = root.children?.[0].children?.[0] as FormElement
		formElement.data.dataSourceName = dataSourceName
	}
}

const defaultData = {
	kind: 'Box',
	...elementBase,
	data: {
		style: {
			desktop: {
				default: {
					alignItems: 'center',
					backgroundColor: 'rgb(188, 213, 235)',
					backgroundImage:
						'url(https://images.unsplash.com/photo-1579546929518-9e396f3cc809?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MXxhbGx8fHx8fHx8fHwxNjY0Nzg0NzQz&auto=format&fit=crop&w=2400&q=80)',
					backgroundPosition: '50% 50%',
					backgroundRepeat: 'no-repeat',
					backgroundSize: 'cover',
					display: 'flex',
					flexFlow: 'row wrap',
					flexWrap: 'wrap',
					fontFamily: 'Roboto',
					height: '1000px',
					justifyContent: 'center',
					minHeight: '1000px',
					padding: '0px',
					width: '100%',
				},
			},
			tablet: {},
			mobile: {},
		},
	},
	components: [
		{
			kind: 'Box',
			...elementBase,
			data: {
				style: {
					desktop: {
						default: {
							backgroundColor: 'rgb(255, 255, 255)',
							borderRadius: '10px',
							bottom: '0px',
							display: 'block',
							minHeight: '584.797px',
							inlineSize: '680px',
							inset: '0px',
							paddingBottom: '33px',
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
							padding: '0px',
							paddingTop: '30px',
							paddingLeft: '5%',
							paddingRight: '5%',
						},
					},
					mobile: {
						default: {
							width: '90%',
						},
					},
				},
			},
			components: [
				{
					kind: 'Form',
					...elementBase,
					data: {
						style: {
							desktop: {},
							tablet: {},
							mobile: {},
						},
						dataSourceName: '',
					},
					components: [
						produce(new TextElement(), (draft) => {
							draft.style = {
								desktop: {
									default: {
										blockSize: '99.7969px',
										border: '0px none rgb(85, 85, 85)',
										color: 'rgb(85, 85, 85)',
										columnRule: '0px none rgb(85, 85, 85)',
										columnRuleColor: 'rgb(85, 85, 85)',
										display: 'block',
										fontSize: '39px',
										height: '99.7969px',
										inlineSize: '460px',
										lineHeight: '46.8px',
										minBlockSize: 'auto',
										minHeight: 'auto',
										minInlineSize: 'auto',
										minWidth: 'auto',
										outline: 'rgb(85, 85, 85) none 0px',
										outlineColor: 'rgb(85, 85, 85)',
										padding: '0px 0px 53px',
										textAlign: 'center',
										textDecoration: 'none solid rgb(85, 85, 85)',
										width: 'auto',
									},
								},
								tablet: {},
								mobile: {},
							}
							draft.data.text = Expression.fromString('Sign Up')
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
							label: 'Sign Up',
							buttonStyle: {
								desktop: {
									default: {
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
											display: 'flex',
											alignItems: 'center',
											justifyContent: 'center',
											height: '79px',
											padding: '55px 0px 0px',
											textAlign: 'center',
											transformOrigin: '230px 39.5px',
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
												textDecoration: 'none solid rgb(153, 153, 153)',
											},
										},
										tablet: {},
										mobile: {},
									}
									draft.data.text = Expression.fromString('I agree with&nbsp;')
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
										href: '/terms-of-service',
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
														textDecoration:
															'none solid rgb(153, 153, 153)',
													},
												},
												tablet: {},
												mobile: {},
											}
											draft.data.text =
												Expression.fromString('terms of service')
										}).serialize(),
									],
								},
								produce(new TextElement(), (draft) => {
									draft.style = {
										desktop: {
											default: {
												lineHeight: '21px',
												textAlign: 'center',
												textDecoration: 'none solid rgb(153, 153, 153)',
											},
										},
										tablet: {},
										mobile: {},
									}
									draft.data.text = Expression.fromString('&nbsp;and&nbsp;')
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
										href: '/privacy-policy',
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
														textDecoration:
															'none solid rgb(153, 153, 153)',
													},
												},
												tablet: {},
												mobile: {},
											}
											draft.data.text =
												Expression.fromString('privacy policy')
										}).serialize(),
									],
								},
							],
						},
						{
							kind: 'Box',
							...elementBase,
							data: {
								style: {
									desktop: {
										default: {
											display: 'flex',
											alignItems: 'center',
											justifyContent: 'center',
											height: '79px',
											padding: '55px 0px 30px',
											textAlign: 'center',
											transformOrigin: '230px 39.5px',
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
												textDecoration: 'none solid rgb(153, 153, 153)',
											},
										},
										tablet: {},
										mobile: {},
									}
									draft.data.text =
										Expression.fromString('Already a member?&nbsp')
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
										href: '/signin',
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
														textDecoration:
															'none solid rgb(153, 153, 153)',
													},
												},
												tablet: {},
												mobile: {},
											}
											draft.data.text = Expression.fromString('Sign in')
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
