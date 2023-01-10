import { IconName, IconPrefix } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
	Button,
	ColorInput,
	Select,
	SelectItem,
	Slider,
	Tabs,
	TextInput,
	Tooltip,
} from '@mantine/core'
import produce from 'immer'
import { useAtomValue } from 'jotai'
import { memo, ReactNode, useState } from 'react'
import { areEqual, FixedSizeGrid as Grid } from 'react-window'
import imageUrl from '../../assets/components/feature-center-cards.jpg'
import { deserializeElement } from '../../utils/deserialize'
import { BoxElement } from '../elements/extensions/box'
import { IconElement } from '../elements/extensions/icon'
import { TextElement } from '../elements/extensions/text'
import { brandIconNames, regularIconNames, solidIconNames } from '../elements/fa-import'
import { Intelinput, inteliText } from '../ui/intelinput'
import { viewportAtom } from '../viewport/viewport-store'
import ColorOptions from './basic-components/color-options'
import { Controller, ElementOptions } from './controller'
import { ComponentName, Divider, DividerCollapsible, SimpleComponentOptionsProps } from './helpers'

export class FeatureCenterCards extends Controller {
	name = 'Feature Center Cards'
	image = imageUrl
	defaultData = deserializeElement(defaultData)

	renderOptions(options: ElementOptions): ReactNode {
		return <FeatureCenterOptions options={options} />
	}
}

// =============  renderOptions =============

function FeatureCenterOptions({ options }: SimpleComponentOptionsProps) {
	const [selectedTile, setSelectedTile] = useState(0)
	const wrapper = options.element as BoxElement

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
	const [iconColor, setIconColor] = useState('hsla(0, 80%, 51%, 1)')
	const [iconType, setIconType] = useState('far')
	const Row = memo((r: any) => {
		const { data: iconNames, columnIndex, rowIndex, style } = r
		const singleColumnIndex = columnIndex + rowIndex * 3
		const icon = iconNames[singleColumnIndex]
		if (!icon) return null
		return (
			<Tooltip openDelay={700} withinPortal withArrow label={icon} key={singleColumnIndex}>
				<div style={style}>
					<button
						onClick={() =>
							// eslint-disable-next-line react/prop-types
							options.set(
								produce(
									getSelectedTileDiv().children?.[0] as IconElement,
									(draft) => {
										draft.data.type = iconType
										draft.data.name = icon
										draft.style.desktop!.default!.color = iconColor
										draft.style.desktop!.default!.color = iconColor
									}
								)
							)
						}
						className="w-16 p-1 text-xl transition-all border rounded active:animate-pulse active:scale-100 hover:z-50 active:bg-gray-100 bg-gray-50 hover:bg-white hover:scale-125"
					>
						<FontAwesomeIcon
							className="text-xl "
							icon={[iconType as IconPrefix, icon as IconName]}
						/>
					</button>
				</div>
			</Tooltip>
		)
	}, areEqual)
	Row.displayName = 'Row'
	return (
		<div className="space-y-6">
			<ComponentName name="Feature Center Cards" />
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
			<DividerCollapsible closed title="Color">
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

			<Tabs
				onTabChange={(name) => setIconType(name as string)}
				variant="pills"
				defaultValue="far"
			>
				<Divider title="Icon" />
				<TextInput
					placeholder="Search"
					name="search"
					size="xs"
					value={searchValue}
					onChange={(e) => setSearchValue(e.target.value)}
				/>
				<ColorInput
					label="Color"
					value={iconColor}
					onChange={(value) => setIconColor(value)}
					className="col-span-9"
					size="xs"
					format="hsla"
				/>
				<Tabs.List className="mt-5">
					<Tabs.Tab className="active:animate-ping " value="far">
						Regular
					</Tabs.Tab>
					<Tabs.Tab className="active:animate-ping " value="fas">
						Solid
					</Tabs.Tab>
					<Tabs.Tab className="active:animate-ping " value="fab">
						Brand
					</Tabs.Tab>
				</Tabs.List>

				<Tabs.Panel value="far" pt="xs">
					<Grid
						className="items-center content-center py-1 my-2 text-center border rounded place-content-center"
						columnCount={3}
						columnWidth={75}
						height={300}
						rowCount={handleSearch(regularIconNames, searchValue).length / 3}
						rowHeight={35}
						width={260}
						itemData={handleSearch(regularIconNames, searchValue)}
					>
						{Row}
					</Grid>
				</Tabs.Panel>

				<Tabs.Panel value="fas" pt="xs">
					<Grid
						className="items-center content-center py-1 my-2 text-center border rounded place-content-center"
						columnCount={3}
						columnWidth={75}
						height={300}
						rowCount={handleSearch(solidIconNames, searchValue).length / 3}
						rowHeight={35}
						width={260}
						itemData={handleSearch(solidIconNames, searchValue)}
					>
						{Row}
					</Grid>
				</Tabs.Panel>

				<Tabs.Panel value="fab" pt="xs">
					<Grid
						className="items-center content-center py-1 my-2 text-center border rounded place-content-center"
						columnCount={3}
						columnWidth={75}
						height={300}
						rowCount={handleSearch(brandIconNames, searchValue).length / 3}
						rowHeight={35}
						width={260}
						itemData={handleSearch(brandIconNames, searchValue)}
					>
						{Row}
					</Grid>
				</Tabs.Panel>
			</Tabs>
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
			fontWeight: '300',
			fontSize: '24px',
			marginBottom: '12px',
		},
	}
	draft.data.text = inteliText('With our platform you can do this and that')
}).serialize()

const tileTitle = produce(new TextElement(), (draft) => {
	draft.style.desktop = {
		default: {
			color: 'rgb(41 37 36 )',
			fontWeight: '600',
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
			fontWeight: '300',
		},
	}
	draft.data.text = inteliText('Feature description goes here')
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
			padding: '10px',
			backgroundColor: 'rgb(248 250 252)',
			textAlign: 'center',
			boxShadow: 'rgba(0, 0, 0, 0.16) 0px 1px 4px',
			borderRadius: '8px',
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
		;(draft.children?.[1] as TextElement).data.text = inteliText(title)
		;(draft.children?.[2] as TextElement).data.text = inteliText(description)
	})
}
const tiles = [
	createTile({
		icon: { name: 'code', type: 'fas', color: 'rgb(225 29 72)' },
		title: 'Customizable',
		description: 'Change the content and style and make it your own.',
	}),
	createTile({
		icon: { name: 'rocket', type: 'fas', color: 'rgb(225 29 72)' },
		title: 'Fast',
		description: 'Fast load times and lag free interaction, my highest priority.',
	}),
	createTile({
		icon: { name: 'heart', type: 'fas', color: 'rgb(225 29 72)' },
		title: 'Made with Love',
		description: 'Increase sales by showing true dedication to your customers.',
	}),
	createTile({
		icon: { name: 'cog', type: 'fas', color: 'rgb(225 29 72)' },
		title: 'Easy to Use',
		description: 'Ready to use with your own content, or customize the source files!',
	}),
	createTile({
		icon: { name: 'bolt', type: 'fas', color: ' rgb(225 29 72)' },
		title: 'Instant Setup',
		description: 'Get your projects up and running in no time using the theme documentation.',
	}),
	createTile({
		icon: { name: 'cloud', type: 'fas', color: 'rgb(225 29 72)' },
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
				},
			],
		},
	],
}
const handleSearch = (IconNames: string[], searchValue: string) => {
	return IconNames.filter((name) => name.includes(searchValue)).length > 0
		? IconNames.filter((name) => name.includes(searchValue))
		: IconNames
}
