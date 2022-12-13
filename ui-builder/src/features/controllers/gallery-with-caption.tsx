import { Slider } from '@mantine/core'
import produce from 'immer'
import { useAtomValue } from 'jotai'
import { ReactNode, useMemo, useState } from 'react'
import imageUrl from '../../assets/components/gelly-with-caption.png'
import { deserializeElement } from '../../utils/deserialize'
import { BoxElement } from '../elements/extensions/box'
import { ImageElement } from '../elements/extensions/image'
import { TextElement } from '../elements/extensions/text'
import { ImageDrop } from '../ui/image-drop'
import { Intelinput, inteliText } from '../ui/intelinput'
import { viewportAtom } from '../viewport/viewport-store'
import ColorOptions from './basic-components/color-options'
import { Controller, ElementOptions } from './controller'
import { ComponentName, extractUrl, SimpleComponentOptionsProps } from './helpers'
import { DraggableTab, DraggableTabs } from './helpers/draggable-tabs'

export class GalleryWithCaptions extends Controller {
	name = 'Gallery with image captions'
	image = imageUrl
	defaultData = deserializeElement(defaultData)

	renderOptions(options: ElementOptions): ReactNode {
		return <GalleryWithCaptionsOptions options={options} />
	}
}

// =============  renderOptions =============

function GalleryWithCaptionsOptions({ options }: SimpleComponentOptionsProps) {
	const containerDiv = options.element.children?.[0].children?.[0] as BoxElement
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

	const tabsList: DraggableTab[] | null[] = useMemo(() => {
		return containerDiv.children?.map((tile, index) => {
			const selectedTileImage = tile.children?.[0] as ImageElement
			return {
				id: tile.id,
				content: (
					<div key={index}>
						<Intelinput
							label="Image caption"
							name="title"
							size="xs"
							value={(tile.children?.[1] as TextElement).data.text}
							onChange={(value) =>
								options.set(
									produce(tile.children?.[1] as TextElement, (draft) => {
										draft.data.text = value
									})
								)
							}
						/>
						{ColorOptions.getTextColorOption({
							options,
							wrapperDiv: tile.children?.[1] as TextElement,
							title: 'Color',
						})}

						<ImageDrop
							onChange={(src) =>
								options.set(
									produce(selectedTileImage, (draft) => {
										draft.style.desktop!.default!.backgroundImage = `url(${src})`
									})
								)
							}
							src={extractUrl(
								selectedTileImage.style.desktop!.default!.backgroundImage as string
							)}
						/>
					</div>
				),
				onTabDelete: () => {
					options.set(
						produce(containerDiv, (draft) => {
							draft.children.splice(index, 1)
						})
					)
				},
			}
		})
	}, [containerDiv.children])
	return (
		<div className="space-y-6">
			<ComponentName name="Gallery with image captions" />
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

			{ColorOptions.getBackgroundOption({ options, wrapperDiv: options.element })}
			<DraggableTabs
				onDragEnd={(event) => {
					const { active, over } = event
					if (active.id !== over?.id) {
						const oldIndex = tabsList.findIndex((tab) => tab.id === active?.id)
						const newIndex = tabsList.findIndex((tab) => tab.id === over?.id)
						options.set(
							produce(containerDiv, (draft) => {
								const temp = draft.children![oldIndex]
								draft.children![oldIndex] = draft.children![newIndex]
								draft.children![newIndex] = temp
							})
						)
					}
				}}
				onAddNewTab={() => {
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
				tabs={tabsList}
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

const tileTitle = produce(new TextElement(), (draft) => {
	draft.style.desktop = {
		default: {
			fontSize: '18px',
			fontWeight: '400',
			marginTop: '10px',
			color: 'black',
		},
	}
	draft.data.text = inteliText('Caption')
})

const tileImage = produce(new BoxElement(), (draft) => {
	// prettier-ignore
	draft.style.desktop = {
		default: {
			width: '100%',
			maxHeight: '400px',
			height: '100%',
			minHeight:'300px',
			objectFit: 'cover',
			objectPosition: 'center center',
			backgroundImage:'url(https://img.freepik.com/free-vector/pink-purple-shades-wavy-background_23-2148897830.jpg?w=740&t=st=1667653845~exp=1667654445~hmac=16b4314931be627c9c54ac2fc0ea554a9ee1b5d74458608932743cc34ac5cc56)'
		},
	}
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
	draft.children = [tileImage, tileTitle]
})

function createTile({ src, title }: { src: string; title: string }) {
	return produce(tile, (draft) => {
		const iconElement = draft.children[0] as BoxElement
		iconElement.style.desktop!.default!.backgroundImage = `url(${src})`
		;(draft.children?.[1] as TextElement).data.text = inteliText(title)
	})
}
const tiles = [
	createTile({
		src: 'https://img.freepik.com/free-vector/green-shades-wavy-background_23-2148897829.jpg?w=740&t=st=1667653664~exp=1667654264~hmac=9526cd24b0865b9b6ed785cf3cfb27993f80343136cfb88551550d143f5b6b44',
		title: 'Customizable',
	}),
	createTile({
		src: 'https://img.freepik.com/free-vector/abstract-wallpaper-with-halftone_23-2148585152.jpg?t=st=1667653639~exp=1667654239~hmac=da2ff3def2e5cb24eeab3a1979b8701238081a3ed82ef3f58dd6216e8381fdae',
		title: 'Fast',
	}),
	createTile({
		src: 'https://img.freepik.com/free-vector/abstract-halftone-background-concept_23-2148605018.jpg?t=st=1667653639~exp=1667654239~hmac=00369d4f05fcda0c7131e9487f27e583f7a557ab648e593326d9fe9c86b10293',
		title: 'Made with Love',
	}),
	createTile({
		src: 'https://img.freepik.com/free-vector/halftone-effect-gradient-background_23-2148593366.jpg?w=740&t=st=1667653718~exp=1667654318~hmac=f661bfe1fc3b108ae80e4178f12893c7b2c9364f818de2ceb276edb9004cbfef',
		title: 'Easy to Use',
	}),
	createTile({
		src: 'https://img.freepik.com/free-vector/abstract-backgroud-concept_52683-43706.jpg?t=st=1667653639~exp=1667654239~hmac=45b124f9def8278922834cc158986cfaf6b3fc10f1a0f5a0d54e9c30b385800b',
		title: 'Cloud Storage',
	}),
	createTile({
		src: 'https://img.freepik.com/free-vector/abstract-neon-lights-background_52683-45117.jpg?t=st=1667653639~exp=1667654239~hmac=44d9c26a7c8f22bd2752f6785556945db7e7cb42b65987a534bfc28ec962ccdd',
		title: 'Instant Setup',
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
