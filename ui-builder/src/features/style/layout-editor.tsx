import { Chip, SegmentedControl } from '@mantine/core'
import {
	TbArrowsHorizontal,
	TbBaseline,
	TbBoxModel,
	TbBoxModel2,
	TbEyeOff,
	TbLayoutAlignCenter,
	TbLayoutAlignLeft,
	TbLayoutAlignRight,
	TbLayoutDistributeVertical,
	TbLayoutGrid,
	TbLayoutList,
	TbSquare,
	TbSwitchHorizontal,
} from 'react-icons/tb'
import { toCenter } from '../../utils/center'
import { useSelectedElements } from '../selection/use-selected-component'
import { CollapseLine } from '../ui/collapse-line'
import { InputWithUnit } from '../ui/style-input'
import { useEditStyle } from './use-edit-style'

export function LayoutEditor() {
	const { style, editStyle } = useEditStyle()
	const isFlex = style.display === 'flex'
	const isGrid = style.display === 'grid'
	const selectedComponents = useSelectedElements()
	const selectedComponent = selectedComponents.length === 1 ? selectedComponents[0] : null
	if (!selectedComponent) return null

	return (
		<CollapseLine label="Layout">
			<div className="grid items-center grid-cols-12 gap-y-2">
				<p className="col-span-3">Display</p>
				<SegmentedControl
					className="col-span-9"
					data={layouts}
					fullWidth
					size="xs"
					value={style.display ?? 'block'}
					onChange={(value) => editStyle('display', value)}
				/>
				{isGrid && (
					<>
						<p className="col-span-3">Align</p>
						<SegmentedControl
							className="col-span-9"
							data={flexAligns}
							fullWidth
							size="xs"
							value={style.alignItems ?? ''}
							onChange={(value) => editStyle('alignItems', value)}
						/>

						<p className="col-span-3">Justify</p>
						<SegmentedControl
							className="col-span-9"
							data={justifyItems}
							fullWidth
							size="xs"
							value={style.justifyItems ?? ''}
							onChange={(value) => editStyle('justifyItems', value)}
						/>

						<p className="col-span-3">Gap</p>
						<div className="flex col-span-9 gap-3">
							<InputWithUnit
								placeholder="Columns"
								title="Columns"
								value={style.columnGap?.toString()}
								onChange={(value) => editStyle('columnGap', value)}
							/>
							<InputWithUnit
								placeholder="Rows"
								title="Rows"
								value={style.rowGap?.toString()}
								onChange={(value) => editStyle('rowGap', value)}
							/>
						</div>
					</>
				)}

				{isFlex && (
					<>
						<p className="col-span-3">Direction</p>
						<div className="flex items-center col-span-9 gap-1">
							<SegmentedControl
								data={[
									{ label: 'Horizontal', value: 'row' },
									{ label: 'Vertical', value: 'column' },
								]}
								fullWidth
								size="xs"
								value={style.flexDirection?.includes('column') ? 'column' : 'row'}
								onChange={(value) =>
									editStyle(
										'flexDirection',
										style.flexDirection?.includes('reverse')
											? `${value}-reverse`
											: value
									)
								}
								className="grow"
							/>
							<Chip
								checked={style.flexDirection?.includes('reverse') ? true : false}
								onChange={() =>
									editStyle(
										'flexDirection',
										style.flexDirection?.includes('reverse')
											? style.flexDirection.replace('-reverse', '')
											: `${style.flexDirection}-reverse`
									)
								}
								size="sm"
								variant="filled"
								radius="sm"
							>
								<TbSwitchHorizontal className="inline" />
							</Chip>
						</div>

						<p className="col-span-3">Align</p>
						<SegmentedControl
							className="col-span-9"
							data={flexAligns}
							fullWidth
							size="xs"
							value={style.alignItems ?? ''}
							onChange={(value) => editStyle('alignItems', value)}
						/>

						<p className="col-span-3">Justify</p>
						<SegmentedControl
							className="col-span-9"
							data={flexJustifies}
							fullWidth
							size="xs"
							value={style.justifyContent ?? ''}
							onChange={(value) => editStyle('justifyContent', value)}
						/>

						<p className="col-span-3">Gap</p>
						<div className="flex col-span-9 gap-3">
							<InputWithUnit
								placeholder="Columns"
								title="Columns"
								value={style.columnGap?.toString()}
								onChange={(value) => editStyle('columnGap', value)}
							/>
							<InputWithUnit
								placeholder="Rows"
								title="Rows"
								value={style.rowGap?.toString()}
								onChange={(value) => editStyle('rowGap', value)}
							/>
						</div>

						<p className="col-span-3">Children</p>
						<div className="flex items-center col-span-9 gap-1">
							<SegmentedControl
								data={[
									{ label: "Dont' wrap", value: 'nowrap' },
									{ label: 'Wrap', value: 'wrap' },
								]}
								fullWidth
								size="xs"
								value={style.flexWrap ?? 'nowrap'}
								onChange={(value) => editStyle('flexWrap', value)}
								className="grow"
							/>
							<Chip
								disabled={style.flexWrap === 'nowrap'}
								checked={style.flexWrap?.includes('reverse') ? true : false}
								onChange={() =>
									editStyle(
										'flexWrap',
										style.flexWrap === 'wrap' ? 'wrap-reverse' : 'wrap'
									)
								}
								size="sm"
								variant="filled"
								radius="sm"
							>
								<TbSwitchHorizontal className="inline" />
							</Chip>
						</div>
					</>
				)}
			</div>
		</CollapseLine>
	)
}

export const simpleFlexAligns = [
	{ label: <TbLayoutAlignLeft />, title: 'Start', value: 'flex-start' },
	{ label: <TbLayoutAlignCenter />, title: 'Center', value: 'center' },
	{ label: <TbLayoutAlignRight />, title: 'End', value: 'flex-end' },
	{ label: <TbArrowsHorizontal />, title: 'Stretch', value: 'stretch' },
].map(toCenter)

const layouts = [
	{ label: <TbSquare />, title: 'Block', value: 'block' },
	{ label: <TbLayoutList className="rotate-90" />, title: 'Flex', value: 'flex' },
	{ label: <TbLayoutGrid />, title: 'Grid', value: 'grid' },
	{ label: <TbBoxModel2 />, title: 'Inline block', value: 'inline-block' },
	{ label: <TbBoxModel />, title: 'Inline', value: 'inline' },
	{ label: <TbEyeOff />, title: 'None', value: 'none' },
].map(toCenter)

const flexAligns = [
	{ label: <TbLayoutAlignLeft />, title: 'Start', value: 'flex-start' },
	{ label: <TbLayoutAlignCenter />, title: 'Center', value: 'center' },
	{ label: <TbLayoutAlignRight />, title: 'End', value: 'flex-end' },
	{ label: <TbArrowsHorizontal />, title: 'Stretch', value: 'stretch' },
	{ label: <TbBaseline />, title: 'Baseline', value: 'baseline' },
].map(toCenter)

const flexJustifies = [
	{ label: <TbLayoutAlignLeft />, title: 'Start', value: 'flex-start' },
	{ label: <TbLayoutAlignCenter />, title: 'Center', value: 'center' },
	{ label: <TbLayoutAlignRight />, title: 'End', value: 'flex-end' },
	{ label: <TbLayoutList />, title: 'Space between', value: 'space-between' },
	{ label: <TbLayoutDistributeVertical />, title: 'Space around', value: 'space-around' },
	{ label: <TbArrowsHorizontal />, title: 'Stretch', value: 'stretch' },
].map(toCenter)

const justifyItems = [
	{ label: <TbLayoutAlignLeft />, title: 'Start', value: 'start' },
	{ label: <TbLayoutAlignCenter />, title: 'Center', value: 'center' },
	{ label: <TbLayoutAlignRight />, title: 'End', value: 'end' },
	{ label: <TbArrowsHorizontal />, title: 'Stretch', value: 'stretch' },
].map(toCenter)
