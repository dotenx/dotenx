import { Chip, ColorInput, SegmentedControl, Select } from '@mantine/core'
import { openModal } from '@mantine/modals'
import { atom, useAtomValue } from 'jotai'
import _ from 'lodash'
import {
	TbAlignCenter,
	TbAlignJustified,
	TbAlignLeft,
	TbAlignRight,
	TbItalic,
	TbOverline,
	TbStrikethrough,
	TbUnderline,
	TbX,
} from 'react-icons/tb'
import { useParams } from 'react-router-dom'
import { toCenter } from '../../utils/center'
import { Element } from '../elements/element'
import { CollapseLine } from '../ui/collapse-line'
import { InputWithUnit } from '../ui/style-input'
import { FontForm } from './font-form'
import { useEditStyle } from './use-edit-style'

export const decorations = [
	{ label: <TbX />, title: 'None', value: 'none' },
	{ label: <TbStrikethrough />, title: 'Strike Through', value: 'line-through' },
	{ label: <TbOverline />, title: 'Overline', value: 'overline' },
	{ label: <TbUnderline />, title: 'Underline', value: 'underline' },
].map(toCenter)

export const aligns = [
	{ label: <TbAlignLeft />, title: 'Left', value: 'left' },
	{ label: <TbAlignCenter />, title: 'Center', value: 'center' },
	{ label: <TbAlignRight />, title: 'Right', value: 'right' },
	{ label: <TbAlignJustified />, title: 'Justify', value: 'justify' },
].map(toCenter)

export const weights = [
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

const defaultFonts = [
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
export const fontsAtom = atom<Record<string, string>>({})

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
	simple,
	element,
}: {
	simple?: boolean
	element?: Element | Element[]
}) {
	const { pageName = '' } = useParams()
	const fonts = useAtomValue(fontsAtom)
	const { style, editStyle } = useEditStyle(element)

	const sizeAndHeight = (
		<>
			<p className="col-span-3">Size</p>
			<div className="col-span-3">
				<InputWithUnit
					value={style.fontSize?.toString()}
					onChange={(value) => editStyle('fontSize', value)}
				/>
			</div>

			<p className="col-span-3 ml-3">Height</p>
			<div className="col-span-3">
				<InputWithUnit
					value={style.lineHeight?.toString()}
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
					value={style.fontSize?.toString()}
					onChange={(value) => editStyle('fontSize', value ?? '')}
					data={fontSizes}
				/>
			</div>
		</>
	)

	return (
		<CollapseLine label="Typography" defaultClosed>
			<div className="grid items-center grid-cols-12 gap-y-2">
				<p className="col-span-3">Font</p>
				<Select
					value={style.fontFamily ?? ''}
					onChange={(value) => editStyle('fontFamily', value ?? defaultFonts[0])}
					className="col-span-9"
					data={[..._.keys(fonts), ...defaultFonts]}
					size="xs"
					onCreate={(fontName) => {
						openModal({
							title: 'Add Font',
							children: <FontForm fontName={fontName} />,
						})
						return fontName
					}}
					creatable
					searchable
					getCreateLabel={(query) => `+ Add ${query}`}
				/>

				<p className="col-span-3">Weight</p>
				<Select
					value={style.fontWeight?.toString() ?? ''}
					onChange={(value) => editStyle('fontWeight', value ?? '')}
					className="col-span-9"
					data={weights}
					size="xs"
				/>

				{!simple && sizeAndHeight}
				{simple && simpleSize}

				<p className="col-span-3">Color</p>
				<ColorInput
					value={style.color ?? ''}
					onChange={(value) => editStyle('color', value)}
					className="col-span-9"
					size="xs"
					format="hsla"
					autoComplete="off"
				/>

				<p className="col-span-3">Align</p>
				<SegmentedControl
					value={style.textAlign ?? ''}
					onChange={(value) => editStyle('textAlign', value)}
					className="col-span-9"
					data={aligns}
					size="xs"
					fullWidth
				/>

				<p className="col-span-3">Style</p>
				<div className="flex items-center col-span-9 gap-2">
					<SegmentedControl
						value={style.textDecoration?.toString() ?? ''}
						onChange={(value) => editStyle('textDecoration', value)}
						data={decorations}
						fullWidth
						className="grow"
						size="xs"
					/>
					<Chip
						checked={style.fontStyle === 'italic'}
						onChange={() =>
							editStyle(
								'fontStyle',
								style.fontStyle === 'italic' ? 'normal' : 'italic'
							)
						}
						size="sm"
						variant="filled"
						radius="sm"
					>
						<TbItalic className="inline" title="Italic" />
					</Chip>
				</div>
			</div>
		</CollapseLine>
	)
}
