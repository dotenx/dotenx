import { IconName } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Tabs, TextInput, Tooltip } from '@mantine/core'
import produce from 'immer'
import { memo, ReactNode, useState } from 'react'
import { TbTarget } from 'react-icons/tb'
import { areEqual, FixedSizeGrid as Grid } from 'react-window'
import { Element, RenderFn, RenderOptions } from '../element'
import { brandIconNames, regularIconNames, solidIconNames } from '../fa-import'
import { Style } from '../style'

import { IconPrefix } from '@fortawesome/free-solid-svg-icons'
import _ from 'lodash'
import { InputWithUnit } from '../../ui/style-input'

export class IconElement extends Element {
	name = 'Icon'
	icon = (<TbTarget />)
	public children: Element[] = []
	data = { name: 'bell', type: 'fas' }
	style: Style = {
		desktop: {
			default: {
				width: '50px',
				height: '50px',
				flexShrink: 0,
			},
		},
	}

	render(renderFn: RenderFn): ReactNode {
		return <FontAwesomeIcon icon={[this.data.type as IconPrefix, this.data.name as IconName]} />
	}

	renderOptions({ set }: RenderOptions): ReactNode {
		return <IconHandler set={set} data={this} />
	}
}

function IconHandler({ set, data }: { set: any; data: IconElement }) {
	const [searchValue, setSearchValue] = useState('')
	const [iconType, setIconType] = useState('far')

	// eslint-disable-next-line react/display-name
	const Row = memo((r: any) => {
		const { data: iconNames, columnIndex, rowIndex, style } = r
		const singleColumnIndex = columnIndex + rowIndex * 3
		const icon = iconNames[singleColumnIndex]
		if (!icon) return null
		return (
			<Tooltip openDelay={700} withinPortal withArrow label={icon} key={singleColumnIndex}>
				<div style={style}>
					<button
						onClick={() => {
							set(
								produce(data, (draft: any) => {
									draft.data.type = iconType
									draft.data.name = icon
								})
							)
						}}
						className="w-16 p-1 transition-all border rounded active:animate-pulse active:scale-100 hover:z-50 active:bg-gray-100 bg-gray-50 hover:bg-white hover:scale-125"
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

	return (
		<div>
			<Tabs
				onTabChange={(name) => setIconType(name as string)}
				variant="pills"
				defaultValue="far"
			>
				<TextInput
					placeholder="Search"
					name="search"
					size="xs"
					value={searchValue}
					onChange={(e) => setSearchValue(e.target.value)}
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
						height={400}
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
						height={400}
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
						height={400}
						rowCount={handleSearch(brandIconNames, searchValue).length / 3}
						rowHeight={35}
						width={260}
						itemData={handleSearch(brandIconNames, searchValue)}
					>
						{Row}
					</Grid>
				</Tabs.Panel>
			</Tabs>
			<InputWithUnit
				label="Size"
				onChange={(value) =>
					set(
						produce(data, (draft) => {
							_.set(draft, 'style.desktop.default.fontSize', value)
							_.set(draft, 'style.desktop.default.width', value)
							_.set(draft, 'style.desktop.default.height', value)
						})
					)
				}
				value={data.style.desktop?.default?.fontSize?.toString()}
			/>
		</div>
	)
}

const handleSearch = (IconNames: string[], searchValue: string) => {
	return IconNames.filter((name) => name.includes(searchValue)).length > 0
		? IconNames.filter((name) => name.includes(searchValue))
		: IconNames
}
