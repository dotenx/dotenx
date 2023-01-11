import { IconName, IconPrefix } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Button, ColorInput, Select, Tabs, TextInput, Tooltip } from '@mantine/core'
import produce from 'immer'
import _ from 'lodash'
import { memo, ReactNode, useState } from 'react'
import { TbMinus, TbPlus } from 'react-icons/tb'
import { areEqual, FixedSizeGrid as Grid } from 'react-window'
import imageUrl from '../../assets/components/feature-center-cards.jpg'
import { deserializeElement } from '../../utils/deserialize'
import { regenElement } from '../clipboard/copy-paste'
import { useSetElement } from '../elements/elements-store'
import { BoxElement } from '../elements/extensions/box'
import { ColumnsElement } from '../elements/extensions/columns'
import { IconElement } from '../elements/extensions/icon'
import { TextElement } from '../elements/extensions/text'
import { brandIconNames, regularIconNames, solidIconNames } from '../elements/fa-import'
import { useSelectedElement } from '../selection/use-selected-component'
import { Expression } from '../states/expression'
import { BoxElementInput } from '../ui/box-element-input'
import { ColumnsElementInput } from '../ui/columns-element-input'
import { TextElementInput } from '../ui/text-element-input'
import { Controller, ElementOptions } from './controller'
import { ComponentName } from './helpers'
import { OptionsWrapper } from './helpers/options-wrapper'

export class FeatureCenterCards extends Controller {
	name = 'Feature Center Cards'
	image = imageUrl
	defaultData = deserializeElement(defaultData)

	renderOptions(options: ElementOptions): ReactNode {
		return <FeatureCenterOptions />
	}
}

// =============  renderOptions =============

function FeatureCenterOptions() {
	const [selectedTileNumber, setSelectedTileNumber] = useState(0)
	const set = useSetElement()
	const component = useSelectedElement<BoxElement>()!
	const title = component.findByTagId<TextElement>(tagIds.title)!
	const subtitle = component.findByTagId<TextElement>(tagIds.subtitle)!
	const grid = component.findByTagId<ColumnsElement>(tagIds.grid)!
	const [searchValue, setSearchValue] = useState('')
	const [iconColor, setIconColor] = useState('hsla(181, 75%, 52%, 1)')
	const [iconType, setIconType] = useState('far')
	const selectedTile = grid.children?.[selectedTileNumber] as BoxElement

	const Row = memo((props: any) => {
		const { data: iconNames, columnIndex, rowIndex, style } = props
		const singleColumnIndex = columnIndex + rowIndex * 3
		const icon = iconNames[singleColumnIndex]
		if (!icon) return null
		return (
			<Tooltip openDelay={700} withinPortal withArrow label={icon} key={singleColumnIndex}>
				<div style={style}>
					<button
						onClick={() =>
							set(selectedTile.children?.[0] as IconElement, (draft) => {
								draft.data.type = iconType
								draft.data.name = icon
								draft.style.desktop!.default!.color = iconColor
								draft.style.desktop!.default!.color = iconColor
							})
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

	const addFeature = () => {
		set(grid, (draft) => draft.children?.push(regenElement(tile)))
	}

	const deleteFeature = () => {
		set(grid, (draft) => draft.children?.splice(selectedTileNumber, 1))
		setSelectedTileNumber(selectedTileNumber > 0 ? selectedTileNumber - 1 : 0)
	}

	return (
		<OptionsWrapper>
			<ComponentName name="Feature Center Grid" />
			<ColumnsElementInput element={grid} />
			<TextElementInput label="Title" element={title} />
			<TextElementInput label="Subtitle" element={subtitle} />
			<BoxElementInput label="Background color" element={component} />
			<Button
				size="xs"
				fullWidth
				variant="outline"
				onClick={addFeature}
				leftIcon={<TbPlus />}
			>
				Add feature
			</Button>
			<Select
				label="Tiles"
				size="xs"
				placeholder="Select a tile"
				data={grid.children?.map((_child, index) => ({
					label: `Tile ${index + 1}`,
					value: index.toString(),
				}))}
				onChange={(value) => setSelectedTileNumber(_.parseInt(value ?? '0'))}
				value={selectedTileNumber.toString()}
			/>
			<TextElementInput
				label="Feature title"
				element={selectedTile.children?.[1] as TextElement}
			/>
			<TextElementInput
				label="Feature description"
				element={selectedTile.children?.[2] as TextElement}
			/>
			<Tabs
				onTabChange={(name) => setIconType(name as string)}
				variant="pills"
				defaultValue="far"
			>
				<p className="flex items-center mt-3 mb-2">
					Icon <hr className="w-full pl-2" />
				</p>
				<TextInput
					placeholder="Search"
					name="search"
					size="xs"
					value={searchValue}
					onChange={(e) => setSearchValue(e.target.value)}
				/>
				<p className="mt-2 mb-1">Color</p>
				<ColorInput
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
				disabled={grid.children?.length === 1}
				size="xs"
				fullWidth
				variant="outline"
				onClick={deleteFeature}
				leftIcon={<TbMinus />}
			>
				Delete feature
			</Button>
		</OptionsWrapper>
	)
}

// =============  defaultData =============

const tagIds = {
	title: 'title',
	subtitle: 'subtitle',
	grid: 'grid',
}

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
	draft.data.text = Expression.fromString('Features')
	draft.tagId = tagIds.title
}).serialize()

const subtitle = produce(new TextElement(), (draft) => {
	draft.style.desktop = {
		default: {
			fontWeight: '300',
			fontSize: '24px',
			marginBottom: '12px',
		},
	}
	draft.data.text = Expression.fromString('With our platform you can do this and that')
	draft.tagId = tagIds.subtitle
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
	draft.data.text = Expression.fromString('Feature')
})

const tileDetails = produce(new TextElement(), (draft) => {
	draft.style.desktop = {
		default: {
			fontSize: '14px',
			fontWeight: '300',
		},
	}
	draft.data.text = Expression.fromString('Feature description goes here')
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
		const titleElement = draft.children?.[1] as TextElement
		titleElement.data.text = Expression.fromString(title)
		const descriptionElement = draft.children?.[2] as TextElement
		descriptionElement.data.text = Expression.fromString(description)
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
	draft.tagId = tagIds.grid
}).serialize()

const defaultData = {
	...wrapperDiv,
	components: [
		{
			...topDiv,
			components: [title, subtitle],
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
