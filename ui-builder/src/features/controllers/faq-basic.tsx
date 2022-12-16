import { Slider } from '@mantine/core'
import produce from 'immer'
import { useAtomValue } from 'jotai'
import { ReactNode, useMemo } from 'react'
import imageUrl from '../../assets/components/faq-basic.png'
import { deserializeElement } from '../../utils/deserialize'
import { BoxElement } from '../elements/extensions/box'
import { TextElement } from '../elements/extensions/text'
import { Intelinput, inteliText } from '../ui/intelinput'
import { viewportAtom } from '../viewport/viewport-store'
import ColorOptions from './basic-components/color-options'
import { Controller, ElementOptions } from './controller'
import { ComponentName, DividerCollapsible, SimpleComponentOptionsProps } from './helpers'
import { DraggableTab, DraggableTabs } from './helpers/draggable-tabs'

export class FaqBasic extends Controller {
	name = 'Basic FAQ'
	image = imageUrl
	defaultData = deserializeElement(defaultData)
	renderOptions(options: ElementOptions): ReactNode {
		return <FaqBasicBasicOptions options={options} />
	}
}

// =============  renderOptions =============

function FaqBasicBasicOptions({ options }: SimpleComponentOptionsProps) {
	const wrapper = options.element as BoxElement

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
							label="Title"
							name="title"
							size="xs"
							value={(tile.children?.[0] as TextElement).data.text}
							onChange={(value) =>
								options.set(
									produce(tile.children?.[0] as TextElement, (draft) => {
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
							value={(tile.children?.[1] as TextElement).data.text}
							onChange={(value) =>
								options.set(
									produce(tile.children?.[1] as TextElement, (draft) => {
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
							draft.children.splice(index, 1)
						})
					)
				},
			}
		})
	}, [containerDiv.children])
	return (
		<div className="space-y-6">
			<ComponentName name="Basic FAQ" />
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

			<DividerCollapsible closed title="Color">
				{ColorOptions.getBackgroundOption({ options, wrapperDiv: options.element })}
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
			marginBottom: '38px',
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
			fontWeight: '700',
		},
	}
	draft.data.text = inteliText('Frequently asked questions')
}).serialize()

const tileTitle = produce(new TextElement(), (draft) => {
	draft.style.desktop = {
		default: {
			fontSize: '16px',
			marginBottom: '18px',
			fontWeight: '600',
		},
	}
	draft.data.text = inteliText('Question title goes here')
})

const tileDetails = produce(new TextElement(), (draft) => {
	draft.style.desktop = {
		default: {
			wordBreak: 'break-all',
			fontWeight: '400',
			fontSize: '14px',
		},
	}
	draft.data.text = inteliText(
		'You can add a description here. This is a great place to add more information about your product.'
	)
})
const tile = produce(new BoxElement(), (draft) => {
	draft.style.desktop = {
		default: {
			height: 'max-content',
			display: 'flex',
			flexDirection: 'column',
			justifyContent: 'center',
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
