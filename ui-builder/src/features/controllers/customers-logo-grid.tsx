import { Slider } from '@mantine/core'
import produce from 'immer'
import { useAtomValue } from 'jotai'
import { viewportAtom } from '../viewport/viewport-store'
import { ReactNode, useMemo } from 'react'
import imageUrl from '../../assets/components/customer-logo-grid.png'
import { deserializeElement } from '../../utils/deserialize'
import { BoxElement } from '../elements/extensions/box'
import { TextElement } from '../elements/extensions/text'
import { ImageDrop } from '../ui/image-drop'
import { Controller, ElementOptions } from './controller'
import { inteliText } from '../ui/intelinput'
import { ComponentName, Divider, SimpleComponentOptionsProps } from './helpers'
import ColorOptions from './basic-components/color-options'
import { DraggableTab, DraggableTabs } from './helpers/draggable-tabs'

export class CustomersLogoGrid extends Controller {
	name = 'Customers logo grid'
	image = imageUrl
	defaultData = deserializeElement(defaultData)

	renderOptions(options: ElementOptions): ReactNode {
		return <CustomersLogoGridOptions options={options} />
	}
}

// =============  renderOptions =============

function CustomersLogoGridOptions({ options }: SimpleComponentOptionsProps) {
	const viewport = useAtomValue(viewportAtom)

	const containerDiv = options.element.children?.[0].children?.[0] as BoxElement
	const logos = containerDiv.children

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
		return logos.map((logo, index) => {
			return {
				id: logo.id,
				content: (
					<div key={index}>
						<ImageDrop
							onChange={(src) => {
								options.set(
									produce(logo, (draft) => {
										draft.style.desktop = {
											default: {
												...draft.style.desktop?.default,
												...{ backgroundImage: `url(${src})` },
											},
										}
									})
								)
							}}
							src={
								// remove the url() part
								logo?.style.desktop?.default?.backgroundImage?.trim().length === 5 // This means that the url is empty
									? ''
									: logo?.style.desktop?.default?.backgroundImage?.substring(
											4,
											(logo?.style.desktop?.default?.backgroundImage?.trim()
												.length ?? 0) - 1 // Remove the trailing )
									  ) ?? ''
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
	}, [logos])

	return (
		<div className="space-y-6">
			<ComponentName name="Customers logo grid" />

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
			<Divider title="Color" />
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
							draft.children.push(
								createTile({
									image: 'https://cdn4.iconfinder.com/data/icons/social-media-logos-6/512/88-kik-256.png',
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

const subTitle = produce(new TextElement(), (draft) => {
	draft.style.desktop = {
		default: {
			fontSize: '24px',
			marginBottom: '12px',
		},
	}
	draft.data.text = inteliText('We’re proud to work with the world’s best brands')
}).serialize()

const tile = produce(new BoxElement(), (draft) => {
	draft.style.desktop = {
		default: {
			display: 'flex',
			flexDirection: 'column',
			justifyContent: 'center',
			alignItems: 'center',
			aspectRatio: '1',
			backgroundImage: `url(https://cdn4.iconfinder.com/data/icons/logos-and-brands/512/87_Diaspora_logo_logos-256.png)`, //NOTE: inside url() do not use single quotes.
			backgroundSize: 'cover',
			backgroundPosition: 'center center',
		},
	}
})

function createTile({ image }: { image: string }) {
	return produce(tile, (draft) => {
		draft.style.desktop = {
			default: {
				...draft.style.desktop?.default,
				backgroundImage: `url(${image})`,
			},
		}
	})
}

const tiles = [
	createTile({
		image: 'https://cdn4.iconfinder.com/data/icons/social-media-logos-6/512/117-Evernote-256.png',
	}),

	createTile({
		image: 'https://cdn4.iconfinder.com/data/icons/logos-and-brands/512/11_Airbnb_logo_logos-256.png',
	}),
	createTile({
		image: 'https://cdn4.iconfinder.com/data/icons/social-media-logos-6/512/53-pandora-256.png',
	}),
	createTile({
		image: 'https://cdn4.iconfinder.com/data/icons/social-media-logos-6/512/50-picasa-256.png',
	}),
	createTile({
		image: 'https://cdn0.iconfinder.com/data/icons/brands-flat-2/187/vimeo-social-network-brand-logo-256.png',
	}),
	createTile({
		image: 'https://cdn4.iconfinder.com/data/icons/social-media-logos-6/512/88-kik-256.png',
	}),
]

const grid = produce(new BoxElement(), (draft) => {
	draft.style.desktop = {
		default: {
			display: 'grid',
			gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr 1fr',
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
