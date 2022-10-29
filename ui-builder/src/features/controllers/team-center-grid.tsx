import { Button, Select, SelectItem, Slider, Textarea, TextInput } from '@mantine/core'
import produce from 'immer'
import { ReactNode, useState } from 'react'
import imageUrl from '../../assets/components/team-center-grid.png'
import profile1Url from '../../assets/components/profile1.jpg'
import profile2Url from '../../assets/components/profile2.jpg'
import profile3Url from '../../assets/components/profile3.jpg'
import profile4Url from '../../assets/components/profile4.jpg'
import { deserializeElement } from '../../utils/deserialize'
import { BoxElement } from '../elements/extensions/box'
import { TextElement } from '../elements/extensions/text'
import { ImageElement } from '../elements/extensions/image'
import { Controller, ElementOptions } from './controller'
import { ComponentName, SimpleComponentOptionsProps } from './helpers'

import { useAtomValue } from 'jotai'
import { viewportAtom } from '../viewport/viewport-store'

export class TeamCenterGrid extends Controller {
	name = 'Team Center Grid'
	image = imageUrl
	defaultData = deserializeElement(defaultData)

	renderOptions(options: ElementOptions): ReactNode {
		return <GalleryBasicOptions options={options} />
		// return <div></div>
	}
}

// =============  renderOptions =============

function GalleryBasicOptions({ options }: SimpleComponentOptionsProps) {
	const [selectedTile, setSelectedTile] = useState(0)

	const titleText = options.element.children?.[0].children?.[0] as TextElement
	const subtitleText = options.element.children?.[0].children?.[1] as TextElement

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
	const [searchValue, setSearchValue] = useState('')
	const [iconColor, setIconColor] = useState('hsla(181, 75%, 52%, 1)')
	const [iconType, setIconType] = useState('far')

	return (
		<div className="space-y-6">
			<ComponentName name="Team Center Grid" />
			{viewport === 'desktop' && (
				<>
					<p>Desktop mode columns</p>
					<Slider
						step={1}
						min={2}
						max={5}
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
						min={2}
						max={5}
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
						min={2}
						max={5}
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
			<TextInput
				label="Feature title"
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
				label="Feature description"
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
			marginBottom: '20px',
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
	draft.data.text = 'Our team'
}).serialize()

const subTitle = produce(new TextElement(), (draft) => {
	draft.style.desktop = {
		default: {
			fontSize: '24px',
			marginBottom: '12px',
			color: '#666',
		},
	}
	draft.data.text = 'Meet the team of people who make it all happen'
}).serialize()

const tileTitle = produce(new TextElement(), (draft) => {
	draft.style.desktop = {
		default: {
			fontSize: '24px',
			fontWeight: 'bold',
			marginBottom: '14px',
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
	draft.data.text = 'Feature description goes here'
})

const tileIcon = produce(new ImageElement(), (draft) => {
	draft.style.desktop = {
		default: {
			width: '50%',
			borderRadius: '50%',
			marginBottom: '10px',
			transform: 'translateY(-10px)',
		},
	}
	draft.data.src = 'https://cdn.iconscout.com/icon/free/png-256/like-1648810-1401300.png'
})

const tile = produce(new BoxElement(), (draft) => {
	draft.style.desktop = {
		default: {
			display: 'flex',
			flexDirection: 'column',
			justifyContent: 'center',
			alignItems: 'center',
			boxShadow: '0px 0px 10px 0px rgba(0,0,0,0.2)',
			borderRadius: '10px',
			paddingBottom: '30px',
		},
	}
	draft.children = [tileIcon, tileTitle, tileDetails]
})

function createTile({
	image,
	title,
	description,
}: {
	image: string
	title: string
	description: string
}) {
	return produce(tile, (draft) => {
		const ImageElement = draft.children?.[0] as ImageElement
		ImageElement.data.src = image
		;(draft.children?.[1] as TextElement).data.text = title
		;(draft.children?.[2] as TextElement).data.text = description
	})
}

const tiles = [
	createTile({
		image: profile1Url,
		title: 'John Doe',
		description: 'No-code developer',
	}),
	createTile({
		image: profile2Url,
		title: 'Jane Doe',
		description: 'Senior UX designer',
	}),
	createTile({
		image: profile3Url,
		title: 'Jack Doe',
		description: 'CEO',
	}),
	createTile({
		image: profile4Url,
		title: 'Sam Doe',
		description: 'Marketing manager',
	}),
]

const grid = produce(new BoxElement(), (draft) => {
	draft.style.desktop = {
		default: {
			display: 'grid',
			gridTemplateColumns: '1fr 1fr 1fr 1fr',
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
