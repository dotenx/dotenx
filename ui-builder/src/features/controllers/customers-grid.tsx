import { Button, Select, SelectItem, Slider, TextInput } from '@mantine/core'
import produce from 'immer'
import { useAtomValue } from 'jotai'
import { viewportAtom } from '../viewport/viewport-store'
import { ReactNode, useState } from 'react'
import imageUrl from '../../assets/components/customer-grid.png'
import logoBag from '../../assets/components/logo-bag-small.jpg'
import logoBird from '../../assets/components/logo-bird-small.jpg'
import logoC from '../../assets/components/logo-c-small.jpg'
import logoCamera from '../../assets/components/logo-camera-small.jpg'
import logoCart from '../../assets/components/logo-cart-small.jpg'
import logoGift from '../../assets/components/logo-gift-small.jpg'
import { deserializeElement } from '../../utils/deserialize'
import { BoxElement } from '../elements/extensions/box'
import { TextElement } from '../elements/extensions/text'
import { ImageDrop } from '../ui/image-drop'
import { Controller, ElementOptions } from './controller'
import { Intelinput, inteliText } from '../ui/intelinput'
import { ComponentName, DividerCollapsable, SimpleComponentOptionsProps } from './helpers'
import ColorOptions from './basic-components/color-options'

export class CustomersGrid extends Controller {
	name = 'Customers grid'
	image = imageUrl
	defaultData = deserializeElement(defaultData)

	renderOptions(options: ElementOptions): ReactNode {
		return <CustomersGridOptions options={options} />
	}
}

// =============  renderOptions =============

function CustomersGridOptions({ options }: SimpleComponentOptionsProps) {
	const viewport = useAtomValue(viewportAtom)
	const [selectedTile, setSelectedTile] = useState(0)
	const titleText = options.element.children?.[0].children?.[0] as TextElement
	const subtitleText = options.element.children?.[0].children?.[1] as TextElement

	const containerDiv = options.element.children?.[1].children?.[0] as BoxElement
	const getSelectedTileDiv = () => containerDiv.children?.[selectedTile] as BoxElement

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
			<ComponentName name="Customers grid" />
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

			<DividerCollapsable title="Color">
				{ColorOptions.getBackgroundOption({ options, wrapperDiv: options.element })}
				{ColorOptions.getTextColorOption({
					options,
					wrapperDiv: titleText,
					title: 'Title color',
				})}
				{ColorOptions.getTextColorOption({
					options,
					wrapperDiv: subtitleText,
					title: 'Subitle color',
				})}
			</DividerCollapsable>
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
			<Button
				size="xs"
				fullWidth
				variant="outline"
				onClick={() => {
					options.set(
						produce(containerDiv, (draft) => {
							draft.children?.push(deserializeElement(tile.serialize()))
						})
					)
				}}
			>
				+ Add customer
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
			<ImageDrop
				onChange={(src) => {
					options.set(
						produce(getSelectedTileDiv(), (draft) => {
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
					getSelectedTileDiv()?.style.desktop?.default?.backgroundImage?.trim().length ===
					5 // This means that the url is empty
						? ''
						: getSelectedTileDiv()?.style.desktop?.default?.backgroundImage?.substring(
								4,
								(getSelectedTileDiv()?.style.desktop?.default?.backgroundImage?.trim()
									.length ?? 0) - 1 // Remove the trailing )
						  ) ?? ''
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
				+ Delete customer
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
	draft.data.text = inteliText('Trusted by the world’s best')
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
