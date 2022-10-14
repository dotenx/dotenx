import { Button, Select, SelectItem, Slider, Textarea, TextInput } from '@mantine/core'
import produce from 'immer'
import { ReactNode, useState } from 'react'
import imageUrl from '../../assets/components/gallery-basic.png'
import { deserializeElement } from '../../utils/deserialize'
import { BoxElement } from '../elements/extensions/box'
import { TextElement } from '../elements/extensions/text'
import { IconElement } from '../elements/extensions/icon'
import { ImageDrop } from '../ui/image-drop'
import { Controller, ElementOptions } from './controller'
import { repeatObject } from './helpers'

export class FeatureCenterGrid extends Controller {
	name = 'Feature Center Grid'
	image = imageUrl
	defaultData = deserializeElement(defaultData)

	renderOptions(options: ElementOptions): ReactNode {
		return <GalleryBasicOptions options={options} />
		// return <div></div>
	}
}

// =============  renderOptions =============

type GalleryBasicOptionsProps = {
	options: ElementOptions
}

function GalleryBasicOptions({ options }: GalleryBasicOptionsProps) {
	const [selectedTile, setSelectedTile] = useState(0)

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
				return ((containerDiv.style.desktop?.default?.gridTemplateColumns?.toString() || '').split('1fr').length - 2) * 25
			case 'tablet':
				// prettier-ignore
				return ((containerDiv.style.tablet?.default?.gridTemplateColumns?.toString() || '').split('1fr').length - 2) * 25
			default:
				// prettier-ignore
				return ((containerDiv.style.mobile?.default?.gridTemplateColumns?.toString() || '').split('1fr').length - 2) * 25
		}
	}
	return (
		<div className="space-y-6">
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
				+ Add feature
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
			{/* todo: add icon picker for getSelectedTileDiv().children?.[0] */}
			<TextInput
				label="Title"
				name="title"
				size="xs"
				value={(getSelectedTileDiv().children?.[1] as TextElement).data.text}
				onChange={(event) =>
					options.set(
						produce(getSelectedTileDiv().children?.[1] as TextElement, (draft) => {
							draft.data.text = event.target.value
						})
					)
				}
			/>
			<Textarea
				label="Description"
				name="description"
				size="xs"
				autosize
				maxRows={10}
				value={(getSelectedTileDiv().children?.[2] as TextElement).data.text}
				onChange={(event) =>
					options.set(
						produce(getSelectedTileDiv().children?.[2] as TextElement, (draft) => {
							draft.data.text = event.target.value
						})
					)
				}
			/>
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
				+ Delete feature
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
			textAlign: 'center',
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
			fontSize: '32px',
			marginBottom: '8px',
		},
	}
	draft.data.text = 'Title'
}).serialize()

const subTitle = produce(new TextElement(), (draft) => {
	draft.style.desktop = {
		default: {
			fontSize: '24px',
			marginBottom: '12px',
		},
	}
	draft.data.text = 'Sub-title'
}).serialize()

const tileTitle = produce(new TextElement(), (draft) => {
	draft.style.desktop = {
		default: {
			fontSize: '16px',
			marginBottom: '18px',
		},
	}
	draft.data.text = 'Feature'
})

const tileDetails = produce(new TextElement(), (draft) => {
	draft.style.desktop = {
		default: {
			fontSize: '14px',
		},
	}
	draft.data.text = 'Details'
})

const tileIcon = produce(new IconElement(), (draft) => {
	draft.style.desktop = {
		default: {
			width: '20px',
			height: '20px',
			color: '#ff0000',
			marginBottom: '10px',
		},
	}
	draft.data.name = 'bell'
	draft.data.type = 'fas'
})

const tile = produce(new BoxElement(), (draft) => {
	draft.style.desktop = {
		default: {
			display: 'flex',
			flexDirection: 'column',
			justifyContent: 'center',
			alignItems: 'center',
		},
	}
	draft.children = [tileIcon, tileTitle, tileDetails]
})

function createTile({
	icon,
	title,
	description,
}: {
	icon: { color: string; name: string; type: string }
	title: string
	description: string
}) {
	return produce(tile, (draft) => {
		const iconElement = draft.children?.[0] as IconElement
		iconElement.data.name = icon.name
		iconElement.data.type = icon.type
		iconElement.style.desktop!.default!.color = icon.color
		;(draft.children?.[1] as TextElement).data.text = title
		;(draft.children?.[2] as TextElement).data.text = description
	})
}

const tiles = [
	createTile({
		icon: { name: 'code', type: 'fas', color: '#ff0000' },
		title: 'Customizable',
		description: 'Change the content and style and make it your own.',
	}),
	createTile({
		icon: { name: 'rocket', type: 'fas', color: '#a8a8a8' },
		title: 'Fast',
		description: 'Fast load times and lag free interaction, my highest priority.',
	}),
	createTile({
		icon: { name: 'heart', type: 'fas', color: '#ff0000' },
		title: 'Made with Love',
		description: 'Increase sales by showing true dedication to your customers.',
	}),
	createTile({
		icon: { name: 'cog', type: 'fas', color: '#e6e6e6' },
		title: 'Easy to Use',
		description: 'Ready to use with your own content, or customize the source files!',
	}),
	createTile({
		icon: { name: 'bolt', type: 'fas', color: '#01a9b4' },
		title: 'Instant Setup',
		description: 'Get your projects up and running in no time using the theme documentation.',
	}),
	createTile({
		icon: { name: 'cloud', type: 'fas', color: '#1c7430' },
		title: 'Cloud Storage',
		description: 'Access your documents anywhere and share them with others.',
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
			components: [title, subTitle],
		},
		{
			...divFlex,
			components: [
				{
					...grid,
					components: tiles.map((tile) => tile.serialize()),
					// [
					// 	...repeatObject(
					// 		{
					// 			...tile,
					// 		},
					// 		6
					// 	),
					// ],
				},
			],
		},
	],
}
