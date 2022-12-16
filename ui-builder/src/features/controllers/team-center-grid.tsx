import { Slider } from '@mantine/core'
import produce from 'immer'
import { ReactNode, useMemo } from 'react'
import profile1Url from '../../assets/components/profile1.jpg'
import profile2Url from '../../assets/components/profile2.jpg'
import profile3Url from '../../assets/components/profile3.jpg'
import profile4Url from '../../assets/components/profile4.jpg'
import imageUrl from '../../assets/components/team-center-grid.png'
import { deserializeElement } from '../../utils/deserialize'
import { BoxElement } from '../elements/extensions/box'
import { ImageElement } from '../elements/extensions/image'
import { TextElement } from '../elements/extensions/text'
import { Controller, ElementOptions } from './controller'
import { ComponentName, DividerCollapsible, SimpleComponentOptionsProps } from './helpers'

import { useAtomValue } from 'jotai'
import { Expression } from '../states/expression'
import { Intelinput, inteliText } from '../ui/intelinput'
import { viewportAtom } from '../viewport/viewport-store'
import ColorOptions from './basic-components/color-options'
import { DraggableTab, DraggableTabs } from './helpers/draggable-tabs'

export class TeamCenterGrid extends Controller {
	name = 'Team Center Grid'
	image = imageUrl
	defaultData = deserializeElement(defaultData)

	renderOptions(options: ElementOptions): ReactNode {
		return <GalleryBasicOptions options={options} />
	}
}

// =============  renderOptions =============

function GalleryBasicOptions({ options }: SimpleComponentOptionsProps) {
	const titleText = options.element.children?.[0].children?.[0] as TextElement
	const subtitleText = options.element.children?.[0].children?.[1] as TextElement

	const containerDiv = options.element.children?.[1].children?.[0] as BoxElement
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
			return {
				id: tile.id,
				content: (
					<div key={index} className="space-y-6">
						<Intelinput
							label="Feature title"
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
						<Intelinput
							label="Feature description"
							name="description"
							size="xs"
							autosize
							maxRows={10}
							value={(tile.children?.[2] as TextElement).data.text}
							onChange={(value) =>
								options.set(
									produce(tile.children?.[2] as TextElement, (draft) => {
										draft.data.text = value
									})
								)
							}
						/>
					</div>
				),
				onTabDelete: () => {
					options.set(
						produce(containerDiv, (draft) => {
							draft.children?.splice(index, 1)
						})
					)
				},
			}
		})
	}, [containerDiv.children])
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
			<DividerCollapsible closed title="color">
				{ColorOptions.getBackgroundOption({
					options,
					wrapperDiv: options.element,
				})}
				{ColorOptions.getTextColorOption({
					options,
					wrapperDiv: titleText,
					title: 'Title',
				})}

				{ColorOptions.getTextColorOption({
					options,
					wrapperDiv: subtitleText,
					title: 'Subtitle',
				})}
			</DividerCollapsible>

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

			<DividerCollapsible closed title="Tiles color">
				{ColorOptions.getBackgroundOption({
					options,
					wrapperDiv: containerDiv.children?.[0],
					title: 'Background color',
					mapDiv: containerDiv.children,
				})}
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
	draft.data.text = inteliText('Our team')
}).serialize()

const subTitle = produce(new TextElement(), (draft) => {
	draft.style.desktop = {
		default: {
			fontSize: '24px',
			marginBottom: '12px',
			color: '#666',
		},
	}
	draft.data.text = inteliText('Meet the team of people who make it all happen')
}).serialize()

const tileTitle = produce(new TextElement(), (draft) => {
	draft.style.desktop = {
		default: {
			fontSize: '24px',
			fontWeight: 'bold',
			marginBottom: '14px',
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

const tileIcon = produce(new ImageElement(), (draft) => {
	draft.style.desktop = {
		default: {
			width: '50%',
			borderRadius: '50%',
			marginBottom: '10px',
			transform: 'translateY(-10px)',
		},
	}
	draft.data.src = Expression.fromString(
		'https://cdn.iconscout.com/icon/free/png-256/like-1648810-1401300.png'
	)
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
			backgroundColor: 'white',
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
		ImageElement.data.src = Expression.fromString(image)
		;(draft.children?.[1] as TextElement).data.text = inteliText(title)
		;(draft.children?.[2] as TextElement).data.text = inteliText(description)
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
