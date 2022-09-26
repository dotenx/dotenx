import { TextInput } from '@mantine/core'
import produce from 'immer'
import { ReactNode } from 'react'
import imageUrl from '../../assets/components/cta.png'
import { ButtonComponent, Component, ComponentKind, TextComponent } from '../canvas-store'
import { ComponentOptions, Controller } from './controller'

export class Cta extends Controller {
	name = 'Call To Action'
	image = imageUrl
	defaultData = defaultData

	renderOptions(options: ComponentOptions): ReactNode {
		const titleComponent = options.component.components[0] as TextComponent
		const buttonComponent = options.component.components[1] as ButtonComponent

		return (
			<div className="space-y-6">
				<TextInput
					label="Title"
					name="title"
					size="xs"
					value={titleComponent.data.text}
					onChange={(event) =>
						options.set(
							titleComponent.id,
							produce(titleComponent, (draft) => {
								draft.data.text = event.target.value
							})
						)
					}
				/>
				<TextInput
					label="Title"
					name="title"
					size="xs"
					value={buttonComponent.data.text}
					onChange={(event) =>
						options.set(
							buttonComponent.id,
							produce(buttonComponent, (draft) => {
								draft.data.text = event.target.value
							})
						)
					}
				/>
			</div>
		)
	}
}

const defaultData: Component = {
	kind: ComponentKind.Box,
	components: [
		{
			kind: ComponentKind.Text,
			components: [],
			classNames: [],
			repeatFrom: { name: '', iterator: '' },
			bindings: {},
			events: [],
			id: 'pDgwMLPIeXVvEEMg',
			parentId: 'LcvEQLKydmVmyQID',
			data: {
				style: {
					desktop: {
						default: {
							fontSize: '3rem',
							textAlign: 'center',
							fontWeight: '100',
						},
					},
					tablet: {},
					mobile: {},
				},
				text: 'Call To Action',
			},
		},
		{
			kind: ComponentKind.Button,
			components: [],
			classNames: [],
			repeatFrom: { name: '', iterator: '' },
			bindings: {},
			events: [],
			id: 'JkoTmzGfVovQbAlY',
			parentId: 'LcvEQLKydmVmyQID',
			data: {
				style: {
					desktop: {
						default: {
							backgroundColor: 'hsla(217, 4%, 34%, 1)',
							color: 'white',
							border: '0',
							paddingTop: '10px',
							paddingBottom: '10px',
							paddingLeft: '20px',
							paddingRight: '20px',
							display: 'inline-block',
							textAlign: 'center',
							fontWeight: '500',
							width: 'auto',
							borderRadius: '10px',
						},
					},
					tablet: {},
					mobile: {},
				},
				text: 'Subscribe To Email',
			},
		},
	],
	classNames: [],
	repeatFrom: { name: '', iterator: '' },
	bindings: {},
	events: [],
	id: 'LcvEQLKydmVmyQID',
	parentId: 'CANVAS_ROOT',
	data: {
		style: {
			desktop: {
				default: {
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					columnGap: '0px',
					rowGap: '20px',
					paddingTop: '20px',
					paddingBottom: '20px',
				},
				hover: {},
				focus: {},
			},
			tablet: { default: {}, hover: {}, focus: {} },
			mobile: { default: {}, hover: {}, focus: {} },
		},
	},
}
