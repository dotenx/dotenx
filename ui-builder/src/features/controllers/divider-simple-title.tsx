import { TextInput } from '@mantine/core'
import produce from 'immer'
import { ReactNode } from 'react'
import imageUrl from '../../assets/components/divider-simple-title.png'
import { deserializeElement } from '../../utils/deserialize'
import { BoxElement } from '../elements/extensions/box'
import { TextElement } from '../elements/extensions/text'
import { Controller, ElementOptions } from './controller'
import { ComponentName, Divider, SimpleComponentOptionsProps } from './helpers'

export class DividerSimpleTitle extends Controller {
	name = 'Divider simple title'
	image = imageUrl
	defaultData = deserializeElement(defaultData)

	renderOptions(options: ElementOptions): ReactNode {
		return <DividerSimpleTitleOptions options={options} />
	}
}

// =============  renderOptions =============

function DividerSimpleTitleOptions({ options }: SimpleComponentOptionsProps) {
	const titleText = options.element.children?.[0].children?.[0] as TextElement
	const subtitleText = options.element.children?.[0].children?.[1] as TextElement

	return (
		<div className="space-y-6">
			<ComponentName name="Divider simple title" />
			<Divider title="Text" />
			<TextInput
				label="Title"
				name="title"
				size="xs"
				value={titleText.data.text}
				onChange={(event) =>
					options.set(
						produce(titleText, (draft) => {
							draft.data.text = event.target.value
						})
					)
				}
			/>
			<TextInput
				label="Subtitle"
				name="title"
				size="xs"
				value={subtitleText.data.text}
				onChange={(event) =>
					options.set(
						produce(subtitleText, (draft) => {
							draft.data.text = event.target.value
						})
					)
				}
			/>
		</div>
	)
}

// =============  defaultData =============

const wrapperDiv = produce(new BoxElement(), (draft) => {
	draft.style.desktop = {
		default: {
			display: 'flex',
			flexDirection: 'column',
			justifyContent: 'center',
			alignItems: 'center',
			width: '100%',
			paddingTop: '40px',
			paddingBottom: '40px',
		},
	}
}).serialize()

const topDiv = produce(new BoxElement(), (draft) => {
	draft.style.desktop = {
		default: {
			textAlign: 'center',
		},
	}
}).serialize()

const title = produce(new TextElement(), (draft) => {
	draft.style.desktop = {
		default: {
			fontSize: '32px',
			marginBottom: '8px',
		},
	}
	draft.data.text = 'Trusted by the world’s best'
}).serialize()

const subTitle = produce(new TextElement(), (draft) => {
	draft.style.desktop = {
		default: {
			fontWeight: '300',
			fontSize: '24px',
			marginBottom: '12px',
		},
	}
	draft.data.text = 'We’re proud to work with the world’s best brands'
}).serialize()

const defaultData = {
	...wrapperDiv,
	components: [
		{
			...topDiv,
			components: [title, subTitle],
		},
	],
}
