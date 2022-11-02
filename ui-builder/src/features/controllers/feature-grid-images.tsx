import { Button, Select, SelectItem, Slider } from '@mantine/core'
import produce from 'immer'
import { useAtomValue } from 'jotai'
import { ReactNode, useState } from 'react'
import imageUrl from '../../assets/components/feature-grid-images.png'
import { deserializeElement } from '../../utils/deserialize'
import { BoxElement } from '../elements/extensions/box'
import { ImageElement } from '../elements/extensions/image'
import { TextElement } from '../elements/extensions/text'
import { ImageDrop } from '../ui/image-drop'
import { Intelinput, inteliText } from '../ui/intelinput'
import { viewportAtom } from '../viewport/viewport-store'
import ColorOptions from './basic-components/color-options'
import { Controller, ElementOptions } from './controller'
import { ComponentName, Divider, DividerCollapsible, SimpleComponentOptionsProps } from './helpers'

export class FeatureGridImages extends Controller {
	name = 'Feature Grid with images'
	image = imageUrl
	defaultData = deserializeElement(defaultData)

	renderOptions(options: ElementOptions): ReactNode {
		return <FeatureGridImagesOptions options={options} />
	}
}

// =============  renderOptions =============

function FeatureGridImagesOptions({ options }: SimpleComponentOptionsProps) {
	const [selectedTile, setSelectedTile] = useState(0)

	const titleText = options.element.children?.[0].children?.[0] as TextElement
	const subtitleText = options.element.children?.[0].children?.[1] as TextElement
	const wrapper = options.element
	const containerDiv = options.element.children?.[1].children?.[0] as BoxElement
	const getSelectedTileDiv = () => containerDiv.children?.[selectedTile] as BoxElement
	const viewport = useAtomValue(viewportAtom)

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
	const selectedTileImage = getSelectedTileDiv().children?.[0] as ImageElement
	return (
		<div className="space-y-6">
			<ComponentName name="Feature Grid with images" />
			{viewport === 'desktop' && (
				<>
					<p>Desktop mode columns</p>
					<Slider
						step={1}
						min={1}
						max={10}
						styles={{ markLabel: { display: 'none' } }}
						defaultValue={countGridTemplateColumns('desktop')}
						onChange={(val) => {
							options.set(
								produce(containerDiv, (draft) => {
									draft.style.desktop = {
										default: {
											...draft.style.desktop?.default,
											// prettier-ignore
											...{ gridTemplateColumns: '1fr '.repeat(val).trimEnd() },
										},
									}
								})
							)
						}}
					/>
					<p>Gap</p>
					<Slider
						label={(val) => val + 'px'}
						max={20}
						step={1}
						styles={{ markLabel: { display: 'none' } }}
						onChange={(val) => {
							options.set(
								produce(containerDiv, (draft) => {
									draft.style.desktop = {
										default: {
											...draft.style.desktop?.default,
											// prettier-ignore
											...{ gap: `${val}px`},
										},
									}
								})
							)
						}}
					/>
				</>
			)}
			{viewport === 'tablet' && (
				<>
					<p>Tablet mode columns</p>
					<Slider
						step={1}
						min={1}
						max={10}
						styles={{ markLabel: { display: 'none' } }}
						defaultValue={countGridTemplateColumns('tablet')}
						onChange={(val) => {
							options.set(
								produce(containerDiv, (draft) => {
									draft.style.tablet = {
										default: {
											...draft.style.tablet?.default,
											// prettier-ignore
											...{ gridTemplateColumns: '1fr '.repeat(val).trimEnd() },
										},
									}
								})
							)
						}}
					/>
					<p>Gap</p>
					<Slider
						label={(val) => val + 'px'}
						max={20}
						step={1}
						styles={{ markLabel: { display: 'none' } }}
						onChange={(val) => {
							options.set(
								produce(containerDiv, (draft) => {
									draft.style.tablet = {
										default: {
											...draft.style.tablet?.default,
											// prettier-ignore
											...{ gap: `${val}px`},
										},
									}
								})
							)
						}}
					/>
				</>
			)}
			{viewport === 'mobile' && (
				<>
					<p>Mobile mode columns</p>
					<Slider
						step={1}
						min={1}
						max={10}
						styles={{ markLabel: { display: 'none' } }}
						defaultValue={countGridTemplateColumns('mobile')}
						onChange={(val) => {
							options.set(
								produce(containerDiv, (draft) => {
									draft.style.mobile = {
										default: {
											...draft.style.mobile?.default,
											// prettier-ignore
											...{ gridTemplateColumns: '1fr '.repeat(val).trimEnd() },
										},
									}
								})
							)
						}}
					/>
					<p>Gap</p>
					<Slider
						label={(val) => val + 'px'}
						max={20}
						step={1}
						styles={{ markLabel: { display: 'none' } }}
						defaultValue={1}
						onChange={(val) => {
							options.set(
								produce(containerDiv, (draft) => {
									draft.style.mobile = {
										default: {
											...draft.style.mobile?.default,
											// prettier-ignore
											...{ gap: `${val}px`},
										},
									}
								})
							)
						}}
					/>
				</>
			)}

			<Divider title="Text" />
			<Intelinput
				label="Title"
				name="title"
				size="xs"
				value={titleText.data.text}
				onChange={(value) =>
					options.set(
						produce(titleText, (draft) => {
							draft.data.text = value
						})
					)
				}
			/>
			<Intelinput
				label="Subtitle"
				name="title"
				size="xs"
				value={subtitleText.data.text}
				onChange={(value) =>
					options.set(
						produce(subtitleText, (draft) => {
							draft.data.text = value
						})
					)
				}
			/>
			<DividerCollapsible title="Color">
				{ColorOptions.getBackgroundOption({ options, wrapperDiv: wrapper })}
				{ColorOptions.getTextColorOption({
					options,
					wrapperDiv: titleText,
					title: 'Title color',
				})}
				{ColorOptions.getTextColorOption({
					options,
					wrapperDiv: subtitleText,
					title: 'Subtitle color',
				})}
			</DividerCollapsible>

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
			<Intelinput
				label="Feature title"
				name="title"
				size="xs"
				value={(getSelectedTileDiv().children?.[1] as TextElement).data.text}
				onChange={(value) =>
					options.set(
						produce(getSelectedTileDiv().children?.[1] as TextElement, (draft) => {
							draft.data.text = value
						})
					)
				}
			/>
			<Intelinput
				label="Feature description"
				name="description"
				size="xs"
				autosize
				maxRows={10}
				value={(getSelectedTileDiv().children?.[2] as TextElement).data.text}
				onChange={(value) =>
					options.set(
						produce(getSelectedTileDiv().children?.[2] as TextElement, (draft) => {
							draft.data.text = value
						})
					)
				}
			/>
			<DividerCollapsible title="Tiles color">
				{ColorOptions.getTextColorOption({
					options,
					wrapperDiv: containerDiv.children?.[0].children?.[1],
					title: 'Title color',
					mapDiv: containerDiv.children,
					childIndex: 1,
				})}
				{ColorOptions.getTextColorOption({
					options,
					wrapperDiv: containerDiv.children?.[0].children?.[2],
					title: 'Description color',
					mapDiv: containerDiv.children,
					childIndex: 2,
				})}
			</DividerCollapsible>
			<ImageDrop
				onChange={(src) =>
					options.set(
						produce(selectedTileImage as ImageElement, (draft) => {
							draft.data.src = src
						})
					)
				}
				src={selectedTileImage.data.src as string}
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
	draft.data.text = inteliText('Features')
}).serialize()

const subTitle = produce(new TextElement(), (draft) => {
	draft.style.desktop = {
		default: {
			fontSize: '24px',
			marginBottom: '12px',
		},
	}
	draft.data.text = inteliText('With our platform you can do this and that')
}).serialize()

const tileTitle = produce(new TextElement(), (draft) => {
	draft.style.desktop = {
		default: {
			fontSize: '16px',
			marginBottom: '18px',
		},
	}
	draft.data.text = inteliText('Feature')
})

const tileDetails = produce(new TextElement(), (draft) => {
	draft.style.desktop = {
		default: {
			fontSize: '14px',
		},
	}
	draft.data.text = inteliText('Feature description goes here')
})

const tileImage = produce(new ImageElement(), (draft) => {
	draft.style.desktop = {
		default: {
			width: '100%',
			maxHeight: '400px',
			height: 'auto',
			objectFit: 'cover',
			objectPosition: 'center center',
		},
	}

	draft.data.src = 'https://i.ibb.co/GHCF717/Marketing-bro.png'
})

const tile = produce(new BoxElement(), (draft) => {
	draft.style.desktop = {
		default: {
			padding: '10px',
			textAlign: 'center',
			borderRadius: '8px',
			display: 'flex',
			flexDirection: 'column',
			justifyContent: 'center',
			alignItems: 'center',
		},
	}
	draft.children = [tileImage, tileTitle, tileDetails]
})

function createTile({
	src,
	title,
	description,
}: {
	src: string
	title: string
	description: string
}) {
	return produce(tile, (draft) => {
		const iconElement = draft.children?.[0] as ImageElement
		iconElement.data.src = src
		;(draft.children?.[1] as TextElement).data.text = inteliText(title)
		;(draft.children?.[2] as TextElement).data.text = inteliText(description)
	})
}
const tiles = [
	createTile({
		src: 'https://i.ibb.co/GHCF717/Marketing-bro.png',
		title: 'Customizable',
		description: 'Change the content and style and make it your own.',
	}),
	createTile({
		src: 'https://i.ibb.co/Jmrc06m/Construction-costs-amico.png',
		title: 'Fast',
		description: 'Fast load times and lag free interaction, my highest priority.',
	}),
	createTile({
		src: 'https://i.ibb.co/CWRLMwY/Marketing-cuate.png',
		title: 'Made with Love',
		description: 'Increase sales by showing true dedication to your customers.',
	}),
	createTile({
		src: 'https://i.ibb.co/Jmrc06m/Construction-costs-amico.png',
		title: 'Easy to Use',
		description: 'Ready to use with your own content, or customize the source files!',
	}),
	createTile({
		src: 'https://i.ibb.co/CWRLMwY/Marketing-cuate.png',
		title: 'Cloud Storage',
		description: 'Access your documents anywhere and share them with others.',
	}),
	createTile({
		src: 'https://i.ibb.co/GHCF717/Marketing-bro.png',
		title: 'Instant Setup',
		description: 'Get your projects up and running in no time using the theme documentation.',
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
				},
			],
		},
	],
}
