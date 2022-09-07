import {
	Button,
	Center,
	Chip,
	CloseButton,
	Collapse,
	ColorInput,
	Divider,
	SegmentedControl,
	Select,
	Slider,
	Text,
	TextInput,
} from '@mantine/core'
import { useDidUpdate, useDisclosure } from '@mantine/hooks'
import cssProperties from 'known-css-properties'
import _ from 'lodash'
import { CSSProperties, ReactNode, useState } from 'react'
import {
	TbAlignCenter,
	TbAlignJustified,
	TbAlignLeft,
	TbAlignRight,
	TbArrowAutofitHeight,
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
import { ActionKind, AnimationAction, EventKind, useCanvasStore } from './canvas-store'
import { ClassEditor } from './class-editor'
import { eventOptions } from './data-editor'
import { useSelectedComponent } from './use-selected-component'

const normalizedCssProperties = cssProperties.all.map((property) =>
	property
		.split('-')
		.map((part, index) => (index !== 0 ? _.capitalize(part) : part))
		.join('')
)

const toCenter = (layout: { label: ReactNode; title: string; value: string }) => ({
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

type EditStyle = (style: keyof CSSProperties, value: string) => void

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

			<CollapseLine label="CSS Properties">
				<CssPropertiesEditor onChange={onChange} style={styles} />
			</CollapseLine>
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
					<div className="flex gap-2 items-center">
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
					<div className="flex gap-2 items-center">
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
	{ label: <TbLayoutList className="rotate-90" />, title: 'Stretch', value: 'stretch' },
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

function LayoutEditor({ styles, editStyle }: { styles: CSSProperties; editStyle: EditStyle }) {
	const isFlex = styles.display === 'flex'

	return (
		<div className="grid grid-cols-12 items-center gap-y-2">
			<p className="col-span-3">Display</p>
			<SegmentedControl
				className="col-span-9"
				data={layouts}
				fullWidth
				size="xs"
				value={styles.display ?? 'block'}
				onChange={(value) => editStyle('display', value)}
			/>

			{isFlex && (
				<>
					<p className="col-span-3">Direction</p>
					<div className="col-span-9 flex items-center gap-1">
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
						value={styles.alignItems ?? 'flex-start'}
						onChange={(value) => editStyle('alignItems', value)}
					/>

					<p className="col-span-3">Justify</p>
					<SegmentedControl
						className="col-span-9"
						data={flexJustifies}
						fullWidth
						size="xs"
						value={styles.justifyContent ?? 'flex-start'}
						onChange={(value) => editStyle('justifyContent', value)}
					/>

					<p className="col-span-3">Gap</p>
					<div className="col-span-9 flex gap-2">
						<TextInput
							size="xs"
							placeholder="Columns"
							title="Columns"
							value={styles.columnGap ?? '0'}
							onChange={(event) => editStyle('columnGap', event.target.value)}
						/>
						<TextInput
							size="xs"
							placeholder="Rows"
							title="Rows"
							value={styles.rowGap ?? '0'}
							onChange={(event) => editStyle('rowGap', event.target.value)}
						/>
					</div>

					<p className="col-span-3">Children</p>
					<div className="col-span-9 flex items-center gap-1">
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

function CollapseLine({ children, label }: { children: ReactNode; label: string }) {
	const [opened, handlers] = useDisclosure(true)

	return (
		<div>
			<Divider
				label={
					<div className="flex gap-1 items-center">
						{opened ? <TbChevronUp /> : <TbChevronDown />}
						{label}
					</div>
				}
				className="cursor-pointer hover:bg-gray-50 rounded"
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

function BordersEditor({ styles, editStyle }: { styles: CSSProperties; editStyle: EditStyle }) {
	const defaultBorderRadius = _.parseInt(styles.borderRadius?.toString().replace('px', '') ?? '0')
	const [borderRadius, setBorderRadius] = useState(defaultBorderRadius)

	useDidUpdate(() => {
		editStyle('borderRadius', borderRadius + 'px')
	}, [borderRadius])

	return (
		<div className="grid grid-cols-12 items-center gap-y-2">
			<p className="col-span-3">Radius</p>
			<div className="col-span-9 flex gap-2 items-center">
				<Slider
					min={0}
					max={20}
					value={borderRadius}
					onChange={setBorderRadius}
					size="xs"
					className="grow"
				/>
				<TextInput
					value={styles.borderRadius ?? 0}
					onChange={(event) => editStyle('borderRadius', event.target.value)}
					className="w-16"
					size="xs"
				/>
			</div>

			<p className="col-span-3">Style</p>
			<SegmentedControl
				value={styles.borderStyle ?? 'solid'}
				onChange={(value) => editStyle('borderStyle', value)}
				data={borderStyles}
				className="col-span-9"
				size="xs"
			/>

			<p className="col-span-3">Width</p>
			<TextInput
				value={styles.borderWidth ?? 0}
				onChange={(event) => editStyle('borderWidth', event.target.value)}
				className="col-span-9"
				size="xs"
			/>

			<p className="col-span-3">Color</p>
			<ColorInput
				value={styles.borderColor ?? ''}
				onChange={(value) => editStyle('borderColor', value)}
				className="col-span-9"
				size="xs"
				autoComplete="off"
				name="color"
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
		<div className="grid grid-cols-12 items-center gap-y-2">
			<p className="col-span-3">Color</p>
			<ColorInput
				value={styles.backgroundColor ?? ''}
				onChange={(value) => editStyle('backgroundColor', value)}
				className="col-span-9"
				size="xs"
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

function TypographyEditor({ styles, editStyle }: { styles: CSSProperties; editStyle: EditStyle }) {
	return (
		<div className="grid grid-cols-12 items-center gap-y-2">
			<p className="col-span-3">Font</p>
			<TextInput
				value={styles.fontFamily ?? ''}
				onChange={(event) => editStyle('fontFamily', event.target.value)}
				className="col-span-9"
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

			<p className="col-span-3">Size</p>
			<TextInput
				value={styles.fontSize ?? ''}
				onChange={(event) => editStyle('fontSize', event.target.value)}
				className="col-span-3"
				size="xs"
			/>

			<p className="col-span-3 ml-3">Height</p>
			<TextInput
				value={styles.height ?? ''}
				onChange={(event) => editStyle('lineHeight', event.target.value)}
				className="col-span-3"
				size="xs"
			/>

			<p className="col-span-3">Color</p>
			<ColorInput
				value={styles.color ?? ''}
				onChange={(value) => editStyle('color', value)}
				className="col-span-9"
				size="xs"
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
			<div className="col-span-9 flex gap-2 items-center">
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
			<div className="border py-2 px-2 rounded bg-white flex flex-col gap-2 mt-2 font-mono">
				<MarginPaddingInput
					value={styles.top?.toString() ?? '0'}
					onChange={(value) => editStyle('top', value)}
				/>
				<div className="flex gap-2 items-center">
					<MarginPaddingInput
						value={styles.left?.toString() ?? '0'}
						onChange={(value) => editStyle('left', value)}
					/>
					<div className="border h-4 bg-gray-200 rounded grow" />
					<MarginPaddingInput
						value={styles.right?.toString() ?? '0'}
						onChange={(value) => editStyle('right', value)}
					/>
				</div>
				<MarginPaddingInput
					value={styles.bottom?.toString() ?? '0'}
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
	{ label: <p className="leading-none text-xs">Auto</p>, title: 'Auto', value: 'auto' },
].map(toCenter)

function SizeEditor({ styles, editStyle }: { styles: CSSProperties; editStyle: EditStyle }) {
	return (
		<div>
			<div className="grid grid-cols-2 gap-x-2 gap-y-3">
				<InlineInput
					label="Width"
					value={styles.width?.toString() ?? ''}
					onChange={(value) => editStyle('width', value)}
				/>
				<InlineInput
					label="Height"
					value={styles.height?.toString() ?? ''}
					onChange={(value) => editStyle('height', value)}
				/>
				<InlineInput
					label="Min W"
					value={styles.minWidth?.toString() ?? ''}
					onChange={(value) => editStyle('minWidth', value)}
				/>
				<InlineInput
					label="Min H"
					value={styles.minHeight?.toString() ?? ''}
					onChange={(value) => editStyle('minHeight', value)}
				/>
				<InlineInput
					label="Max W"
					value={styles.maxWidth?.toString() ?? ''}
					onChange={(value) => editStyle('maxWidth', value)}
				/>
				<InlineInput
					label="Max H"
					value={styles.maxHeight?.toString() ?? ''}
					onChange={(value) => editStyle('maxHeight', value)}
				/>
			</div>
			<div className="grid grid-cols-4 gap-2 items-center mt-6">
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

function InlineInput({
	label,
	value,
	onChange,
}: {
	label: string
	value: string
	onChange: (value: string) => void
}) {
	return (
		<div className="grid grid-cols-2 items-center">
			<Text className="whitespace-nowrap">{label}</Text>
			<TextInput
				size="xs"
				value={value ?? ''}
				onChange={(event) => onChange(event.target.value)}
			/>
		</div>
	)
}

function SpacingEditor({ styles, editStyle }: { styles: CSSProperties; editStyle: EditStyle }) {
	return (
		<div className="border py-2 px-2 rounded flex flex-col font-mono relative gap-2">
			<Text className="absolute top-1 left-2 uppercase" color="dimmed" size={8} weight="bold">
				Margin
			</Text>
			<MarginPaddingInput
				value={styles.marginTop?.toString() ?? '0'}
				onChange={(value) => editStyle('marginTop', value)}
			/>
			<div className="flex gap-2">
				<MarginPaddingInput
					value={styles.marginLeft?.toString() ?? '0'}
					onChange={(value) => editStyle('marginLeft', value)}
				/>
				<div className="border py-1 px-1 rounded bg-gray-200 grow">
					<div className="border py-2 px-2 rounded bg-white flex flex-col gap-2 relative">
						<Text
							className="absolute top-1 left-2 uppercase"
							color="dimmed"
							size={8}
							weight="bold"
						>
							Padding
						</Text>
						<MarginPaddingInput
							value={styles.paddingTop?.toString() ?? '0'}
							onChange={(value) => editStyle('paddingTop', value)}
						/>
						<div className="flex gap-2 items-center">
							<MarginPaddingInput
								value={styles.paddingLeft?.toString() ?? '0'}
								onChange={(value) => editStyle('paddingLeft', value)}
							/>
							<div className="border h-4 bg-gray-200 rounded grow" />
							<MarginPaddingInput
								value={styles.paddingRight?.toString() ?? '0'}
								onChange={(value) => editStyle('paddingRight', value)}
							/>
						</div>
						<MarginPaddingInput
							value={styles.paddingBottom?.toString() ?? '0'}
							onChange={(value) => editStyle('paddingBottom', value)}
						/>
					</div>
				</div>
				<MarginPaddingInput
					value={styles.marginRight?.toString() ?? '0'}
					onChange={(value) => editStyle('marginRight', value)}
				/>
			</div>
			<MarginPaddingInput
				value={styles.marginBottom?.toString() ?? '0'}
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
	return (
		<div className="w-[6ch] flex items-center justify-center self-center">
			<input
				value={value ?? ''}
				onChange={(event) => onChange(event.target.value)}
				className="focus:outline-none outline-none"
				style={{ maxWidth: '6ch', minWidth: '1ch', width: `${value.length}ch` }}
			/>
		</div>
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
