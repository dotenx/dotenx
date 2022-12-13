import { Button, Select, SelectItem, Slider } from '@mantine/core'
import produce from 'immer'
import { ReactNode, useState } from 'react'
import imageUrl from '../../assets/components/faq-basic-styled.png'
import { deserializeElement } from '../../utils/deserialize'
import { BoxElement } from '../elements/extensions/box'
import { TextElement } from '../elements/extensions/text'
import { Intelinput, inteliText } from '../ui/intelinput'
import ColorOptions from './basic-components/color-options'
import { Controller, ElementOptions } from './controller'
import { ComponentName, DividerCollapsible, SimpleComponentOptionsProps } from './helpers'

export class FaqBasicStyled extends Controller {
	name = 'Basic styled FAQ'
	image = imageUrl
	defaultData = deserializeElement(defaultData)

	renderOptions(options: ElementOptions): ReactNode {
		return <FaqBasicStyledOptions options={options} />
	}
}

// =============  renderOptions =============

function FaqBasicStyledOptions({ options }: SimpleComponentOptionsProps) {
	const [selectedTile, setSelectedTile] = useState(0)
	const wrapper = options.element as BoxElement

	const containerDiv = options.element.children?.[1].children?.[0] as BoxElement
	const getSelectedTileDiv = () => containerDiv.children?.[selectedTile] as BoxElement

	const MARKS = [
		{ value: 0, label: '1' },
		{ value: 25, label: '2' },
		{ value: 50, label: '3' },
		{ value: 75, label: '4' },
		{ value: 100, label: '5' },
	]

	const countGridTemplateColumns = (mode: string) => {
		switch (mode) {
			case 'desktop':
				// prettier-ignore
				return ((containerDiv.style.desktop?.default?.gridTemplateColumns?.toString() || '').split('1fr').length - 1)
			case 'tablet':
				// prettier-ignore
				return ((containerDiv.style.tablet?.default?.gridTemplateColumns?.toString() || '').split('1fr').length - 1)
			default:
				// prettier-ignore
				return ((containerDiv.style.mobile?.default?.gridTemplateColumns?.toString() || '').split('1fr').length - 1)
		}
	}
	return (
		<div className="space-y-6">
			<ComponentName name="Basic styled FAQ" />
			<p>Desktop mode columns</p>
			<Slider
				label={(val) => MARKS.find((mark) => mark.value == val)?.label}
				step={25}
				marks={MARKS}
				styles={{ markLabel: { display: 'none' } }}
				value={countGridTemplateColumns('desktop')}
				onChange={(val) => {
					options.set(
						produce(containerDiv, (draft) => {
							draft.style.desktop = {
								default: {
									...draft.style.desktop?.default,
									// prettier-ignore
									...{ gridTemplateColumns: '1fr '.repeat((val/25) + 1).trimEnd() },
								},
							}
						})
					)
				}}
			/>
			<p>Tablet mode columns</p>
			<Slider
				label={(val) => MARKS.find((mark) => mark.value == val)?.label}
				step={25}
				marks={MARKS}
				styles={{ markLabel: { display: 'none' } }}
				value={countGridTemplateColumns('tablet')}
				onChange={(val) => {
					options.set(
						produce(containerDiv, (draft) => {
							draft.style.tablet = {
								default: {
									...draft.style.tablet?.default,
									// prettier-ignore
									...{ gridTemplateColumns: '1fr '.repeat((val/25) + 1).trimEnd() },
								},
							}
						})
					)
				}}
			/>
			<p>Mobile mode columns</p>
			<Slider
				label={(val) => MARKS.find((mark) => mark.value == val)?.label}
				step={25}
				marks={MARKS}
				styles={{ markLabel: { display: 'none' } }}
				value={countGridTemplateColumns('mobile')}
				onChange={(val) => {
					options.set(
						produce(containerDiv, (draft) => {
							draft.style.mobile = {
								default: {
									...draft.style.mobile?.default,
									// prettier-ignore
									...{ gridTemplateColumns: '1fr '.repeat((val/25) + 1).trimEnd() },
								},
							}
						})
					)
				}}
			/>
			<Button
				size="xs"
				fullWidth
				variant="outline"
				onClick={() => {
					options.set(
						produce(containerDiv, (draft) => {
							draft.children?.push(
								deserializeElement({
									...tile.serialize(),
								})
							)
						})
					)
				}}
			>
				+ Add Q&A
			</Button>
			<Select
				label="Tiles"
				placeholder="Select a tile"
				data={containerDiv.children?.map(
					(child, index) =>
						({
							label: `Tile ${index + 1}`,
							value: index + '',
						} as SelectItem)
				)}
				onChange={(val) => {
					setSelectedTile(parseInt(val ?? '0'))
				}}
				value={selectedTile + ''}
			/>
			<Intelinput
				label="Title"
				name="title"
				size="xs"
				value={(getSelectedTileDiv().children?.[0] as TextElement).data.text}
				onChange={(value) =>
					options.set(
						produce(getSelectedTileDiv().children?.[0] as TextElement, (draft) => {
							draft.data.text = value
						})
					)
				}
			/>
			<Intelinput
				label="Description"
				name="description"
				size="xs"
				autosize
				maxRows={10}
				value={(getSelectedTileDiv().children?.[1] as TextElement).data.text}
				onChange={(value) =>
					options.set(
						produce(getSelectedTileDiv().children?.[1] as TextElement, (draft) => {
							draft.data.text = value
						})
					)
				}
			/>
			<DividerCollapsible title="Color">
				{ColorOptions.getBackgroundOption({ options, wrapperDiv: wrapper })}
				{ColorOptions.getTextColorOption({
					options,
					wrapperDiv: wrapper.children?.[0].children?.[0],
					title: 'FAQ color',
				})}
				{ColorOptions.getTextColorOption({
					options,
					wrapperDiv: containerDiv.children?.[0].children?.[0],
					title: 'Tiles title color',
					mapDiv: containerDiv.children,
					childIndex: 0,
				})}
				{ColorOptions.getTextColorOption({
					options,
					wrapperDiv: containerDiv.children?.[0].children?.[1],
					title: 'Tiles details color',
					mapDiv: containerDiv.children,
					childIndex: 1,
				})}
				{ColorOptions.getBackgroundOption({
					options,
					wrapperDiv: containerDiv.children?.[0],
					title: 'Tiles background color',
					mapDiv: containerDiv.children,
				})}
			</DividerCollapsible>
			<Button
				disabled={containerDiv.children?.length === 1}
				size="xs"
				fullWidth
				variant="outline"
				onClick={() => {
					options.set(
						produce(containerDiv, (draft) => {
							draft.children?.splice(selectedTile, 1)
						})
					)
					setSelectedTile(selectedTile > 0 ? selectedTile - 1 : 0)
				}}
			>
				+ Delete Q&A
			</Button>
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
			paddingLeft: '18%',
			width: '100%',
			textAlign: 'left',
			marginBottom: '25px',
		},
	}
}).serialize()

const divFlex = produce(new BoxElement(), (draft) => {
	draft.style.desktop = {
		default: {
			display: 'flex',
			justifyContent: 'center',
			alignItems: 'center',
			width: '100%',
		},
	}
}).serialize()

const title = produce(new TextElement(), (draft) => {
	draft.style.desktop = {
		default: {
			fontSize: '52px',
			fontWeight: '700',
		},
	}
	draft.data.text = inteliText("FAQ's")
}).serialize()

const tileTitle = produce(new TextElement(), (draft) => {
	draft.style.desktop = {
		default: {
			fontSize: '16px',
			marginBottom: '5px',
			fontWeight: '600',
			height: 'max-content',
			minHeight: '30px',
		},
	}
	draft.data.text = inteliText('Question title goes here')
})
{
	;<div className="whitespace-pre-line"></div>
}
const tileDetails = produce(new TextElement(), (draft) => {
	draft.style.desktop = {
		default: {
			wordBreak: 'break-all',
			fontWeight: '400',
			fontSize: '14px',
			height: 'max-content',
			minHeight: '50px',
		},
	}
	draft.data.text = inteliText(
		'You can add a description here. This is a great place to add more information about your product.'
	)
})

const tile = produce(new BoxElement(), (draft) => {
	draft.style.desktop = {
		default: {
			background: 'rgb(248 250 252)',
			borderRadius: '15px',
			padding: '20px',
			height: 'max-content',
			minHeight: '150px',
			display: 'flex',
			flexDirection: 'column',
			paddingTop: '20px',
			alignItems: 'start',
		},
	}
	draft.children = [tileTitle, tileDetails]
})

function createTile({ title, description }: { title: string; description: string }) {
	return produce(tile, (draft) => {
		;(draft.children?.[0] as TextElement).data.text = inteliText(title)
		;(draft.children?.[1] as TextElement).data.text = inteliText(description)
	})
}

const tiles = [
	createTile({
		title: 'Can I install it myself?',
		description:
			'Yes, you can install it yourself. We provide a detailed installation guide and video.',
	}),
	createTile({
		title: 'How long does it take to install?',
		description:
			'It takes about 2 hours to install. We provide a detailed installation guide and video.',
	}),
	createTile({
		title: 'Do you offer a warranty?',
		description:
			'Yes, we offer a 1-year warranty. You can read more about it in our warranty policy.',
	}),
	createTile({
		title: 'How can I pay?',
		description: 'You can pay with a credit card or PayPal. We also offer financing options.',
	}),
	createTile({
		title: 'How long does it take to ship?',
		description:
			'We ship within 1-2 business days. You can read more about it in our shipping policy.',
	}),
	createTile({
		title: 'Do you ship internationally?',
		description: 'Yes, we ship internationally. We also offer international financing options.',
	}),
]

const grid = produce(new BoxElement(), (draft) => {
	draft.style.desktop = {
		default: {
			display: 'grid',
			gridTemplateColumns: '1fr 1fr 1fr',
			gridGap: '20px',
			width: '70%',
		},
	}
	draft.style.tablet = {
		default: {
			gridTemplateColumns: '1fr 1fr',
		},
	}
	draft.style.mobile = {
		default: {
			gridTemplateColumns: '1fr',
		},
	}
}).serialize()

const defaultData = {
	...wrapperDiv,
	components: [
		{
			...topDiv,
			components: [title],
		},
		{
			...divFlex,
			components: [
				{
					...grid,
					components: tiles.map((tile) => tile.serialize()),
				},
			],
		},
	],
}
