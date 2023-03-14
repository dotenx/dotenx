import { IconName, IconPrefix } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { ColorInput, Tabs, TextInput, Tooltip } from '@mantine/core'
import { useAtomValue } from 'jotai'
import { memo, useState } from 'react'
import { areEqual, FixedSizeGrid as Grid } from 'react-window'
import { useSetWithElement } from '../../elements/elements-store'
import { IconElement } from '../../elements/extensions/icon'
import { brandIconNames, regularIconNames, solidIconNames } from '../../elements/fa-import'
import { useParseBgColor } from '../../style/background-editor'
import { useEditStyle } from '../../style/use-edit-style'
import { selectedPaletteAtom } from '../palette'

// TODO: This allows us to pick an icon. It's better to merge this with icon styler and also add options for size, color, etc.
export function IconPicker({ element, label }: { element: IconElement; label?: string }) {
	const [iconType, setIconType] = useState('far')
	const [searchValue, setSearchValue] = useState('')
	const set = useSetWithElement(element)

	// todo: is this really helpful?
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
							set((draft) => {
								draft.data.type = iconType
								draft.data.name = icon
							})
						}
						className="w-16 p-1 text-xl transition-all border rounded active:animate-pulse active:scale-100 hover:z-50 active:bg-gray-100 bg-gray-50 hover:bg-white hover:scale-125"
					>
						<FontAwesomeIcon
							className="text-xl"
							icon={[iconType as IconPrefix, icon as IconName]}
						/>
					</button>
				</div>
			</Tooltip>
		)
	}, areEqual)
	Row.displayName = 'Row'

	const { style: styles, editStyle } = useEditStyle(element)

	const color = useParseBgColor(styles.color ?? '')
	const palette = useAtomValue(selectedPaletteAtom)

	return (
		<Tabs
			onTabChange={(name) => setIconType(name as string)}
			variant="pills"
			defaultValue="far"
		>
			<p className="flex items-center mt-3 mb-2">{label?? 'Icon'}</p>
			<TextInput
				placeholder="Search"
				name="search"
				size="xs"
				value={searchValue}
				onChange={(e) => setSearchValue(e.target.value)}
			/>
			<p className="mt-2 mb-1">Color</p>
			<ColorInput
				value={color}
				onChange={(value) => editStyle('color', value)}
				className="col-span-9"
				size="xs"
				format="hsla"
				swatches={palette.colors}
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
	)
}

const handleSearch = (IconNames: string[], searchValue: string) => {
	return IconNames.filter((name) => name.includes(searchValue)).length > 0
		? IconNames.filter((name) => name.includes(searchValue))
		: IconNames
}
