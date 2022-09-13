import {
	Button,
	Center,
	Chip,
	CloseButton,
	Collapse,
	ColorInput,
	Divider,
	Menu,
	NumberInput,
	Popover,
	SegmentedControl,
	Select,
	Text,
	TextInput,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import produce from 'immer'
import cssProperties from 'known-css-properties'
import _ from 'lodash'
import { CSSProperties, ReactNode, useState } from 'react'
import {
	TbAlignCenter,
	TbAlignJustified,
	TbAlignLeft,
	TbAlignRight,
	TbArrowAutofitHeight,
	TbArrowsHorizontal,
	TbBaseline,
	TbBoxModel,
	TbBoxModel2,
	TbChevronDown,
	TbChevronUp,
	TbEye,
	TbEyeOff,
	TbItalic,
	TbLayoutAlignCenter,
	TbLayoutAlignLeft,
	TbLayoutAlignRight,
	TbLayoutDistributeVertical,
	TbLayoutGrid,
	TbLayoutList,
	TbLineDashed,
	TbLineDotted,
	TbMinus,
	TbOverline,
	TbPlus,
	TbSquare,
	TbStrikethrough,
	TbSwitchHorizontal,
	TbUnderline,
	TbX,
} from 'react-icons/tb'
import { uuid } from '../utils'
import {
	ActionKind,
	AnimationAction,
	ComponentKind,
	EventKind,
	useCanvasStore,
} from './canvas-store'
import { ClassEditor } from './class-editor'
import { eventOptions } from './data-editor'
import { useSelectedComponent } from './use-selected-component'

const normalizedCssProperties = cssProperties.all.map((property) =>
	property
		.split('-')
		.map((part, index) => (index !== 0 ? _.capitalize(part) : part))
		.join('')
)

export const toCenter = (layout: { label: ReactNode; title: string; value: string }) => ({
	label: (
		<Center className="text-sm" title={layout.title}>
			{layout.label}
		</Center>
	),
	value: layout.value,
})

const layouts = [
	{ label: <TbSquare />, title: 'Block', value: 'block' },
	{ label: <TbLayoutList className="rotate-90" />, title: 'Flex', value: 'flex' },
	{ label: <TbLayoutGrid />, title: 'Grid', value: 'grid' },
	{ label: <TbBoxModel2 />, title: 'Inline block', value: 'inline-block' },
	{ label: <TbBoxModel />, title: 'Inline', value: 'inline' },
	{ label: <TbEyeOff />, title: 'None', value: 'none' },
].map(toCenter)

export type EditStyle = (style: keyof CSSProperties, value: string) => void

export function StylesEditor({
	styles,
	onChange,
}: {
	styles: CSSProperties
	onChange: (style: CSSProperties) => void
}) {
	const editStyle: EditStyle = (style, value) => {
		onChange({ ...styles, [style]: value })
	}

	return (
		<div className="space-y-6">
			<CollapseLine label="Class">
				<ClassEditor />
			</CollapseLine>

			<CollapseLine label="Animation">
				<AnimationEditor />
			</CollapseLine>

			<CollapseLine label="Layout">
				<LayoutEditor styles={styles} editStyle={editStyle} />
			</CollapseLine>

			<CollapseLine label="Spacing">
				<SpacingEditor styles={styles} editStyle={editStyle} />
			</CollapseLine>

			<CollapseLine label="Size">
				<SizeEditor styles={styles} editStyle={editStyle} />
			</CollapseLine>

			<CollapseLine label="Position">
				<PositionEditor styles={styles} editStyle={editStyle} />
			</CollapseLine>

			<CollapseLine label="Typography">
				<TypographyEditor styles={styles} editStyle={editStyle} />
			</CollapseLine>

			<CollapseLine label="Backgrounds">
				<BackgroundsEditor styles={styles} editStyle={editStyle} />
			</CollapseLine>

			<CollapseLine label="Borders">
				<BordersEditor styles={styles} editStyle={editStyle} />
			</CollapseLine>

			<CollapseLine label="Shadows">
				<ShadowsEditor styles={styles} editStyle={editStyle} />
			</CollapseLine>

			<CollapseLine label="CSS Properties" defaultClosed>
				<CssPropertiesEditor onChange={onChange} style={styles} />
			</CollapseLine>
		</div>
	)
}

function ShadowsEditor({ styles, editStyle }: { styles: CSSProperties; editStyle: EditStyle }) {
	const shadowProperties = styles.boxShadow?.split(' ')
	const shadowX = shadowProperties?.[0]
	const shadowY = shadowProperties?.[1]
	const shadowBlur = shadowProperties?.[2]
	const shadowSpread = shadowProperties?.[3]
	const shadowColor = shadowProperties?.[4]

	return (
		<div className="grid items-center grid-cols-12 gap-y-2 gap-x-3">
			<p className="col-span-3">Color</p>
			<div className="col-span-9">
				<ColorInput
					value={shadowColor}
					onChange={(value) =>
						editStyle(
							'boxShadow',
							produce(shadowProperties, (draft) => {
								const withoutSpace = value.replaceAll(' ', '')
								if (draft) draft[4] = withoutSpace
								else return ['0px', '0px', '0px', '0px', withoutSpace]
							})?.join(' ') ?? ''
						)
					}
					format="hsla"
				/>
			</div>

			<p className="col-span-3">X</p>
			<div className="col-span-3">
				<InputWithUnit
					value={shadowX}
					onChange={(value) =>
						editStyle(
							'boxShadow',
							produce(shadowProperties, (draft) => {
								if (draft) draft[0] = value
								else return [value, '0px', '0px', '0px', 'rgba(0,0,0,0.5)']
							})?.join(' ') ?? ''
						)
					}
				/>
			</div>

			<p className="col-span-3">Y</p>
			<div className="col-span-3">
				<InputWithUnit
					value={shadowY}
					onChange={(value) =>
						editStyle(
							'boxShadow',
							produce(shadowProperties, (draft) => {
								if (draft) draft[1] = value
								else return ['0px', value, '0px', '0px', 'rgba(0,0,0,0.5)']
							})?.join(' ') ?? ''
						)
					}
				/>
			</div>

			<p className="col-span-3">Blur</p>
			<div className="col-span-3">
				<InputWithUnit
					value={shadowBlur}
					onChange={(value) =>
						editStyle(
							'boxShadow',
							produce(shadowProperties, (draft) => {
								if (draft) draft[2] = value
								else return ['0px', '0px', value, '0px', 'rgba(0,0,0,0.5)']
							})?.join(' ') ?? ''
						)
					}
				/>
			</div>

			<p className="col-span-3">Spread</p>
			<div className="col-span-3">
				<InputWithUnit
					value={shadowSpread}
					onChange={(value) =>
						editStyle(
							'boxShadow',
							produce(shadowProperties, (draft) => {
								if (draft) draft[3] = value
								else return ['0px', '0px', '0px', value, 'rgba(0,0,0,0.5)']
							})?.join(' ') ?? ''
						)
					}
				/>
			</div>
		</div>
	)
}

const cssAnimations = [
	'bounce',
	'flash',
	'pulse',
	'rubberBand',
	'shakeX',
	'shakeY',
	'headShake',
	'swing',
	'tada',
	'wobble',
	'jello',
	'heartBeat',
	'backInDown',
	'backInLeft',
	'backInRight',
	'backInUp',
]

function AnimationEditor() {
	const selectedComponent = useSelectedComponent()
	const { editEvent, addEvent, removeEvent } = useCanvasStore((store) => ({
		addEvent: store.addComponentEvent,
		removeEvent: store.removeEvent,
		editEvent: store.editComponentEvent,
	}))
	if (!selectedComponent) return null
	const addNewAnimation = () => {
		addEvent(selectedComponent.id, {
			id: uuid(),
			kind: EventKind.MouseEnter,
			actions: [{ id: uuid(), kind: ActionKind.Animation, animationName: cssAnimations[0] }],
		})
	}
	const removeAnimation = (eventId: string) => {
		removeEvent(selectedComponent.id, eventId)
	}

	const animations = selectedComponent.events.map((event) =>
		event.actions
			.filter((action): action is AnimationAction => action.kind === ActionKind.Animation)
			.map((animation) => (
				<div className="space-y-2" key={animation.id}>
					<CloseButton ml="auto" onClick={() => removeAnimation(event.id)} size="xs" />
					<div className="flex items-center gap-2">
						<Text className="w-14">On</Text>
						<Select
							size="xs"
							data={eventOptions}
							className="grow"
							value={event.kind}
							onChange={(value: EventKind) =>
								editEvent(selectedComponent.id, { ...event, kind: value })
							}
						/>
					</div>
					<div className="flex items-center gap-2">
						<Text className="w-14">Animate</Text>
						<Select
							size="xs"
							data={cssAnimations}
							className="grow"
							value={animation.animationName}
							onChange={(value) =>
								editEvent(selectedComponent.id, {
									...event,
									actions: [
										{ ...animation, animationName: value ?? cssAnimations[0] },
									],
								})
							}
						/>
					</div>
				</div>
			))
	)

	return (
		<div>
			<div className="space-y-4">{animations}</div>
			<Button mt="xl" size="xs" leftIcon={<TbPlus />} onClick={addNewAnimation}>
				Animation
			</Button>
		</div>
	)
}

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
	{
		label: <TbLayoutList />,
		title: 'Space between',
		value: 'space-between',
	},
	{ label: <TbLayoutDistributeVertical />, title: 'Space around', value: 'space-around' },
].map(toCenter)

const justifyItems = [
	{ label: <TbLayoutAlignLeft />, title: 'Start', value: 'start' },
	{ label: <TbLayoutAlignCenter />, title: 'Center', value: 'center' },
	{ label: <TbLayoutAlignRight />, title: 'End', value: 'end' },
	{ label: <TbArrowsHorizontal />, title: 'Stretch', value: 'stretch' },
].map(toCenter)

function LayoutEditor({ styles, editStyle }: { styles: CSSProperties; editStyle: EditStyle }) {
	const isFlex = styles.display === 'flex'
	const isGrid = styles.display === 'grid'
	const selectedComponent = useSelectedComponent()

	return (
		<div className="grid items-center grid-cols-12 gap-y-2">
			<p className="col-span-3">Display</p>
			<SegmentedControl
				className="col-span-9"
				data={layouts}
				fullWidth
				size="xs"
				value={styles.display ?? 'block'}
				onChange={(value) => editStyle('display', value)}
				disabled={selectedComponent?.kind === ComponentKind.Columns}
			/>

			{isGrid && (
				<>
					<p className="col-span-3">Align</p>
					<SegmentedControl
						className="col-span-9"
						data={flexAligns}
						fullWidth
						size="xs"
						value={styles.alignItems ?? ''}
						onChange={(value) => editStyle('alignItems', value)}
					/>

					<p className="col-span-3">Justify</p>
					<SegmentedControl
						className="col-span-9"
						data={justifyItems}
						fullWidth
						size="xs"
						value={styles.justifyItems ?? ''}
						onChange={(value) => editStyle('justifyItems', value)}
					/>

					<p className="col-span-3">Gap</p>
					<div className="flex col-span-9 gap-3">
						<InputWithUnit
							placeholder="Columns"
							title="Columns"
							value={styles.columnGap?.toString()}
							onChange={(value) => editStyle('columnGap', value)}
						/>
						<InputWithUnit
							placeholder="Rows"
							title="Rows"
							value={styles.rowGap?.toString()}
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
							value={styles.flexDirection?.includes('column') ? 'column' : 'row'}
							onChange={(value) =>
								editStyle(
									'flexDirection',
									styles.flexDirection?.includes('reverse')
										? `${value}-reverse`
										: value
								)
							}
							className="grow"
						/>
						<Chip
							checked={styles.flexDirection?.includes('reverse') ? true : false}
							onChange={() =>
								editStyle(
									'flexDirection',
									styles.flexDirection?.includes('reverse')
										? styles.flexDirection.replace('-reverse', '')
										: `${styles.flexDirection}-reverse`
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
						value={styles.alignItems ?? ''}
						onChange={(value) => editStyle('alignItems', value)}
					/>

					<p className="col-span-3">Justify</p>
					<SegmentedControl
						className="col-span-9"
						data={flexJustifies}
						fullWidth
						size="xs"
						value={styles.justifyContent ?? ''}
						onChange={(value) => editStyle('justifyContent', value)}
					/>

					<p className="col-span-3">Gap</p>
					<div className="flex col-span-9 gap-3">
						<InputWithUnit
							placeholder="Columns"
							title="Columns"
							value={styles.columnGap?.toString()}
							onChange={(value) => editStyle('columnGap', value)}
						/>
						<InputWithUnit
							placeholder="Rows"
							title="Rows"
							value={styles.rowGap?.toString()}
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
							value={styles.flexWrap ?? 'nowrap'}
							onChange={(value) => editStyle('flexWrap', value)}
							className="grow"
						/>
						<Chip
							disabled={styles.flexWrap === 'nowrap'}
							checked={styles.flexWrap?.includes('reverse') ? true : false}
							onChange={() =>
								editStyle(
									'flexWrap',
									styles.flexWrap === 'wrap' ? 'wrap-reverse' : 'wrap'
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
	)
}

export function CollapseLine({
	children,
	label,
	defaultClosed,
}: {
	children: ReactNode
	label: string
	defaultClosed?: boolean
}) {
	const [opened, handlers] = useDisclosure(!defaultClosed)

	return (
		<div>
			<Divider
				label={
					<div className="flex items-center gap-1">
						{opened ? <TbChevronUp /> : <TbChevronDown />}
						{label}
					</div>
				}
				className="rounded cursor-pointer hover:bg-gray-50"
				mb="xs"
				onClick={handlers.toggle}
			/>
			<Collapse in={opened}>{children}</Collapse>
		</div>
	)
}

const borderStyles = [
	{ label: <TbX />, title: 'None', value: 'none' },
	{ label: <TbMinus />, title: 'Solid', value: 'solid' },
	{ label: <TbLineDashed />, title: 'Dashed', value: 'dashed' },
	{ label: <TbLineDotted />, title: 'Dotted', value: 'dotted' },
].map(toCenter)

export function BordersEditor({
	styles,
	editStyle,
}: {
	styles: CSSProperties
	editStyle: EditStyle
}) {
	return (
		<div className="grid items-center grid-cols-12 gap-y-2">
			<p className="col-span-3">Radius</p>
			<div className="col-span-9">
				<InputWithUnit
					value={styles.borderRadius?.toString()}
					onChange={(value) => editStyle('borderRadius', value)}
				/>
			</div>

			<p className="col-span-3">Style</p>
			<SegmentedControl
				value={styles.borderStyle ?? 'none'}
				onChange={(value) => editStyle('borderStyle', value)}
				data={borderStyles}
				className="col-span-9"
				size="xs"
			/>

			<p className="col-span-3">Width</p>
			<div className="col-span-9">
				<InputWithUnit
					value={styles.borderWidth?.toString()}
					onChange={(value) => editStyle('borderWidth', value)}
				/>
			</div>

			<p className="col-span-3">Color</p>
			<ColorInput
				value={styles.borderColor ?? ''}
				onChange={(value) => editStyle('borderColor', value)}
				className="col-span-9"
				size="xs"
				autoComplete="off"
				name="color"
				format="hsla"
			/>
		</div>
	)
}

const backgroundClippings = [
	{ label: 'None', value: 'border-box' },
	{ label: 'Padding', value: 'padding-box' },
	{ label: 'Content', value: 'content-box' },
	{ label: 'Text', value: 'text' },
]

function BackgroundsEditor({ styles, editStyle }: { styles: CSSProperties; editStyle: EditStyle }) {
	return (
		<div className="grid items-center grid-cols-12 gap-y-2">
			<p className="col-span-3">Color</p>
			<ColorInput
				value={styles.backgroundColor ?? ''}
				onChange={(value) => editStyle('backgroundColor', value)}
				className="col-span-9"
				size="xs"
				format="hsla"
			/>

			<p className="col-span-3">Clipping</p>
			<Select
				value={styles.backgroundClip ?? ''}
				onChange={(value) => editStyle('backgroundClip', value ?? '')}
				data={backgroundClippings}
				className="col-span-9"
				size="xs"
			/>
		</div>
	)
}

const weights = [
	{ label: '100 - Thin', value: '100' },
	{ label: '200 - Extra Light', value: '200' },
	{ label: '300 - Light', value: '300' },
	{ label: '400 - Normal', value: '400' },
	{ label: '500 - Medium', value: '500' },
	{ label: '600 - Semi Bold', value: '600' },
	{ label: '700 - Bold', value: '700' },
	{ label: '800 - Extra Bold', value: '800' },
	{ label: '900 - Black', value: '900' },
]

const aligns = [
	{ label: <TbAlignLeft />, title: 'Left', value: 'left' },
	{ label: <TbAlignCenter />, title: 'Center', value: 'center' },
	{ label: <TbAlignRight />, title: 'Right', value: 'right' },
	{ label: <TbAlignJustified />, title: 'Justify', value: 'justify' },
].map(toCenter)

const decorations = [
	{ label: <TbX />, title: 'None', value: 'none' },
	{ label: <TbStrikethrough />, title: 'Strike Through', value: 'line-through' },
	{ label: <TbOverline />, title: 'Overline', value: 'overline' },
	{ label: <TbUnderline />, title: 'Underline', value: 'underline' },
].map(toCenter)

export const getStyleNumber = (style?: string) => {
	const unit = (style?.replace(/[0-9]/g, '') as Unit) ?? 'auto'
	const number = (style ? _.parseInt(style.replace(unit, '')) : 0) || 0
	return number
}

const fonts = [
	'Arial',
	'Arial Black',
	'Bahnschrift',
	'Calibri',
	'Cambria',
	'Cambria Math',
	'Candara',
	'Comic Sans MS',
	'Consolas',
	'Constantia',
	'Corbel',
	'Courier New',
	'Ebrima',
	'Franklin Gothic Medium',
	'Gabriola',
	'Gadugi',
	'Georgia',
	'HoloLens MDL2 Assets',
	'Impact',
	'Ink Free',
	'Javanese Text',
	'Leelawadee UI',
	'Lucida Console',
	'Lucida Sans Unicode',
	'Malgun Gothic',
	'Microsoft Himalaya',
	'Microsoft JhengHei',
	'Microsoft New Tai Lue',
	'Microsoft PhagsPa',
	'Microsoft Sans Serif',
	'Microsoft Tai Le',
	'Microsoft YaHei',
	'Microsoft Yi Baiti',
	'MingLiU-ExtB',
	'Mongolian Baiti',
	'MS Gothic',
	'MV Boli',
	'Myanmar Text',
	'Nirmala UI',
	'Palatino Linotype',
	'Segoe Print',
	'Segoe Script',
	'Segoe UI',
	'SimSun',
	'Sitka',
	'Sylfaen',
	'Tahoma',
	'Times New Roman',
	'Trebuchet MS',
	'Verdana',
	'Yu Gothic',
]

const fontSizes = [
	{ label: 'xs', value: '0.75rem' },
	{ label: 'sm', value: '0.875rem' },
	{ label: 'md', value: '1rem' },
	{ label: 'lg', value: '1.125rem' },
	{ label: 'xl', value: '1.25rem' },
	{ label: '2xl', value: '1.5rem' },
	{ label: '3xl', value: '1.875rem' },
	{ label: '4xl', value: '2.25rem' },
	{ label: '5xl', value: '3rem' },
	{ label: '6xl', value: '3.75rem' },
	{ label: '7xl', value: '4.5rem' },
	{ label: '8xl', value: '6rem' },
	{ label: '9xl', value: '8rem' },
]

export function TypographyEditor({
	styles,
	editStyle,
	simple,
}: {
	styles: CSSProperties
	editStyle: EditStyle
	simple?: boolean
}) {
	const sizeAndHeight = (
		<>
			<p className="col-span-3">Size</p>
			<div className="col-span-3">
				<InputWithUnit
					value={styles.fontSize?.toString()}
					onChange={(value) => editStyle('fontSize', value)}
				/>
			</div>

			<p className="col-span-3 ml-3">Height</p>
			<div className="col-span-3">
				<InputWithUnit
					value={styles.lineHeight?.toString()}
					onChange={(value) => editStyle('lineHeight', value)}
				/>
			</div>
		</>
	)

	const simpleSize = (
		<>
			<p className="col-span-3">Size</p>
			<div className="col-span-9">
				<Select
					value={styles.fontSize?.toString()}
					onChange={(value) => editStyle('fontSize', value ?? '')}
					data={fontSizes}
				/>
			</div>
		</>
	)

	return (
		<div className="grid items-center grid-cols-12 gap-y-2">
			<p className="col-span-3">Font</p>
			<Select
				value={styles.fontFamily ?? ''}
				onChange={(value) => editStyle('fontFamily', value ?? fonts[0])}
				className="col-span-9"
				data={fonts}
				size="xs"
			/>

			<p className="col-span-3">Weight</p>
			<Select
				value={styles.fontWeight?.toString() ?? ''}
				onChange={(value) => editStyle('fontWeight', value ?? '')}
				className="col-span-9"
				data={weights}
				size="xs"
			/>

			{!simple && sizeAndHeight}
			{simple && simpleSize}

			<p className="col-span-3">Color</p>
			<ColorInput
				value={styles.color ?? ''}
				onChange={(value) => editStyle('color', value)}
				className="col-span-9"
				size="xs"
				format="hsla"
			/>

			<p className="col-span-3">Align</p>
			<SegmentedControl
				value={styles.textAlign ?? ''}
				onChange={(value) => editStyle('textAlign', value)}
				className="col-span-9"
				data={aligns}
				size="xs"
				fullWidth
			/>

			<p className="col-span-3">Style</p>
			<div className="flex items-center col-span-9 gap-2">
				<SegmentedControl
					value={styles.textDecoration?.toString() ?? ''}
					onChange={(value) => editStyle('textDecoration', value)}
					data={decorations}
					fullWidth
					className="grow"
					size="xs"
				/>
				<Chip
					checked={styles.fontStyle === 'italic'}
					onChange={() =>
						editStyle('fontStyle', styles.fontStyle === 'italic' ? 'normal' : 'italic')
					}
					size="sm"
					variant="filled"
					radius="sm"
					title="Italic"
				>
					<TbItalic className="inline" />
				</Chip>
			</div>
		</div>
	)
}

const positions = [
	{ label: 'Static', value: 'static' },
	{ label: 'Relative', value: 'relative' },
	{ label: 'Absolute', value: 'absolute' },
	{ label: 'Fixed', value: 'fixed' },
	{ label: 'Sticky', value: 'sticky' },
]

function PositionEditor({ styles, editStyle }: { styles: CSSProperties; editStyle: EditStyle }) {
	return (
		<div>
			<Select
				value={styles.position ?? ''}
				onChange={(value) => editStyle('position', value ?? '')}
				data={positions}
				size="xs"
			/>
			<div className="flex flex-col gap-2 px-2 py-2 mt-2 font-mono bg-white border rounded">
				<MarginPaddingInput
					value={styles.top?.toString() ?? '0px'}
					onChange={(value) => editStyle('top', value)}
				/>
				<div className="flex items-center gap-2">
					<MarginPaddingInput
						value={styles.left?.toString() ?? '0px'}
						onChange={(value) => editStyle('left', value)}
					/>
					<div className="h-4 bg-gray-200 border rounded grow" />
					<MarginPaddingInput
						value={styles.right?.toString() ?? '0px'}
						onChange={(value) => editStyle('right', value)}
					/>
				</div>
				<MarginPaddingInput
					value={styles.bottom?.toString() ?? '0px'}
					onChange={(value) => editStyle('bottom', value)}
				/>
			</div>
		</div>
	)
}

const overflows = [
	{ label: <TbEye />, title: 'Visible', value: 'visible' },
	{ label: <TbEyeOff />, title: 'Hidden', value: 'hidden' },
	{ label: <TbArrowAutofitHeight />, title: 'Scroll', value: 'scroll' },
	{ label: <p className="text-xs leading-none">Auto</p>, title: 'Auto', value: 'auto' },
].map(toCenter)

export function SizeEditor({
	styles,
	editStyle,
	simple,
}: {
	styles: CSSProperties
	editStyle: EditStyle
	simple?: boolean
}) {
	const widthInput = (
		<>
			<p className="col-span-3">Width</p>
			<div className="col-span-3">
				<InputWithUnit
					value={styles.width?.toString()}
					onChange={(value) => editStyle('width', value)}
				/>
			</div>
		</>
	)
	const heightInput = (
		<>
			<p className="col-span-3">Height</p>
			<div className="col-span-3">
				<InputWithUnit
					value={styles.height?.toString()}
					onChange={(value) => editStyle('height', value)}
				/>
			</div>
		</>
	)

	if (simple)
		return (
			<div className="grid items-center grid-cols-12 gap-x-3 gap-y-3">
				{widthInput}
				{heightInput}
			</div>
		)

	return (
		<div>
			<div className="grid items-center grid-cols-12 gap-x-3 gap-y-3">
				{widthInput}
				{heightInput}
				<p className="col-span-3">Min W</p>
				<div className="col-span-3">
					<InputWithUnit
						value={styles.minWidth?.toString()}
						onChange={(value) => editStyle('minWidth', value)}
					/>
				</div>
				<p className="col-span-3">Min H</p>
				<div className="col-span-3">
					<InputWithUnit
						value={styles.minHeight?.toString()}
						onChange={(value) => editStyle('minHeight', value)}
					/>
				</div>
				<p className="col-span-3">Max W</p>
				<div className="col-span-3">
					<InputWithUnit
						value={styles.maxWidth?.toString()}
						onChange={(value) => editStyle('maxWidth', value)}
					/>
				</div>
				<p className="col-span-3">Max H</p>
				<div className="col-span-3">
					<InputWithUnit
						value={styles.maxHeight?.toString()}
						onChange={(value) => editStyle('maxHeight', value)}
					/>
				</div>
			</div>
			<div className="grid items-center grid-cols-4 gap-2 mt-6">
				<p className="whitespace-nowrap">Overflow</p>
				<SegmentedControl
					data={overflows}
					value={styles.overflow ?? ''}
					onChange={(value) => editStyle('overflow', value)}
					size="xs"
					fullWidth
					className="col-span-3"
				/>
				<p className="whitespace-nowrap">Fit</p>
				<Select
					data={[
						{ label: 'Fill', value: 'fill' },
						{ label: 'Contain', value: 'contain' },
						{ label: 'Cover', value: 'cover' },
						{ label: 'None', value: 'none' },
						{ label: 'Scale Down', value: 'scale-down' },
					]}
					value={styles.objectFit ?? ''}
					onChange={(value) => editStyle('objectFit', value ?? '')}
					size="xs"
					className="col-span-3"
				/>
			</div>
		</div>
	)
}

const units = ['px', 'rem', 'em', '%', 'vw', 'vh', 'auto'] as const
type Unit = typeof units[number]

export function InputWithUnit({
	label,
	value,
	onChange,
	title,
	placeholder,
}: {
	label?: string
	value?: string
	onChange: (value: string) => void
	title?: string
	placeholder?: string
}) {
	const unit = (value?.replace(/[0-9.]/g, '') as Unit) ?? 'auto'
	const number = (value ? parseFloat(value.replace(unit, '')) : 0) || 0
	const [opened, setOpened] = useState(false)

	const unitSection = (
		<Menu shadow="sm" opened={opened} onChange={setOpened}>
			<Menu.Target>
				<button className="bg-gray-50 uppercase text-[10px] font-medium flex items-center justify-center rounded hover:bg-gray-100 px-px">
					{unit}
				</button>
			</Menu.Target>
			<Menu.Dropdown p={0}>
				<div>
					{units.map((unit) => (
						<button
							key={unit}
							onClick={() => {
								setOpened(false)
								if (unit === 'auto') onChange('auto')
								else onChange(number + unit)
							}}
							className="px-2 py-0.5 w-full hover:bg-gray-100"
						>
							{unit}
						</button>
					))}
				</div>
			</Menu.Dropdown>
		</Menu>
	)

	return (
		<div className="flex items-center gap-3">
			{label && <Text className="whitespace-nowrap">{label}</Text>}
			<NumberInput
				size="xs"
				value={unit === 'auto' ? undefined : number}
				onChange={(newValue) => {
					if (unit === 'auto') onChange(newValue + 'px')
					else onChange((newValue ?? '0') + unit)
				}}
				rightSection={unitSection}
				title={title}
				placeholder={placeholder}
				className="w-full"
				precision={1}
				step={0.1}
			/>
		</div>
	)
}

export function SpacingEditor({
	styles,
	editStyle,
}: {
	styles: CSSProperties
	editStyle: EditStyle
}) {
	return (
		<div className="relative flex flex-col gap-2 px-2 py-2 font-mono border rounded">
			<Text className="absolute uppercase top-1 left-2" color="dimmed" size={8} weight="bold">
				Margin
			</Text>
			<MarginPaddingInput
				value={styles.marginTop?.toString() ?? '0px'}
				onChange={(value) => editStyle('marginTop', value)}
			/>
			<div className="flex gap-2">
				<MarginPaddingInput
					value={styles.marginLeft?.toString() ?? '0px'}
					onChange={(value) => editStyle('marginLeft', value)}
				/>
				<div className="px-1 py-1 bg-gray-200 border rounded grow">
					<div className="relative flex flex-col gap-2 px-2 py-2 bg-white border rounded">
						<Text
							className="absolute uppercase top-1 left-2"
							color="dimmed"
							size={8}
							weight="bold"
						>
							Padding
						</Text>
						<MarginPaddingInput
							value={styles.paddingTop?.toString() ?? '0px'}
							onChange={(value) => editStyle('paddingTop', value)}
						/>
						<div className="flex items-center gap-2">
							<MarginPaddingInput
								value={styles.paddingLeft?.toString() ?? '0px'}
								onChange={(value) => editStyle('paddingLeft', value)}
							/>
							<div className="h-4 bg-gray-200 border rounded grow" />
							<MarginPaddingInput
								value={styles.paddingRight?.toString() ?? '0px'}
								onChange={(value) => editStyle('paddingRight', value)}
							/>
						</div>
						<MarginPaddingInput
							value={styles.paddingBottom?.toString() ?? '0px'}
							onChange={(value) => editStyle('paddingBottom', value)}
						/>
					</div>
				</div>
				<MarginPaddingInput
					value={styles.marginRight?.toString() ?? '0px'}
					onChange={(value) => editStyle('marginRight', value)}
				/>
			</div>
			<MarginPaddingInput
				value={styles.marginBottom?.toString() ?? '0px'}
				onChange={(value) => editStyle('marginBottom', value)}
			/>
		</div>
	)
}

function MarginPaddingInput({
	value,
	onChange,
}: {
	value: string
	onChange: (value: string) => void
}) {
	const isZero = value === '0px'

	return (
		<Popover shadow="sm" withArrow position="left" withinPortal trapFocus>
			<Popover.Target>
				<button className="self-center w-[6ch] no-scrollbar overflow-auto">
					{isZero ? 0 : value}
				</button>
			</Popover.Target>
			<Popover.Dropdown p="xs">
				<InputWithUnit value={value} onChange={onChange} />
			</Popover.Dropdown>
		</Popover>
	)
}

function CssPropertiesEditor({
	style,
	onChange,
}: {
	style: CSSProperties
	onChange: (style: CSSProperties) => void
}) {
	const styles = _.toPairs(style)

	return (
		<div>
			<div className="space-y-4">
				{styles.map(([property, value]) => (
					<div className="flex items-center gap-2" key={property}>
						<Select
							searchable
							creatable
							data={normalizedCssProperties}
							size="xs"
							value={property ?? ''}
							onChange={(newProperty) => {
								const newStyles = _.fromPairs(
									styles.map(([p, v]) =>
										p === property ? [newProperty, v] : [p, v]
									)
								)
								onChange(newStyles)
							}}
						/>
						<TextInput
							size="xs"
							value={value ?? ''}
							onChange={(event) => {
								onChange({ ...style, [property]: event.target.value })
							}}
						/>
						<CloseButton size="xs" onClick={() => onChange(_.omit(style, property))} />
					</div>
				))}
			</div>
			<Button
				leftIcon={<TbPlus />}
				onClick={() => {
					const newStyles = { ...style, '': '' }
					onChange(newStyles)
				}}
				size="xs"
				mt="md"
			>
				Property
			</Button>
		</div>
	)
}
