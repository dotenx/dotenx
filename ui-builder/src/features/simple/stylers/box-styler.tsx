import { ColorInput } from '@mantine/core'
import { useAtomValue } from 'jotai'
import { Element } from '../../elements/element'
import { useSetWithElement } from '../../elements/elements-store'
import { AlignmentEditor } from '../../style/alignment-editor'
import { BackgroundsEditor, useParseBgColor } from '../../style/background-editor'
import { BackgroundImageEditor } from '../../style/background-image-editor'
import { BordersEditor } from '../../style/border-editor'
import { SimpleAnimationEditor } from '../../style/simple-animation-editor'
import { SimpleModeShadowsEditor } from '../../style/simple-mode-shadows-editor'
import { SpacingEditor } from '../../style/spacing-editor'
import { TypographyEditor } from '../../style/typography-editor'
import { selectedPaletteAtom } from '../palette'
import { Styler } from './styler'

export function BoxStyler({
	element,
	label,
	stylers,
	stylerOptions,
}: {
	element: Element | Element[]
	label: string
	stylers?: Array<
		| 'alignment'
		| 'backgrounds'
		| 'borders'
		| 'spacing'
		| 'typography'
		| 'animation'
		| 'background-image'
		| 'shadow'
	>
	stylerOptions?: {
		alignment?: {
			direction?: 'row' | 'column'
		}
	}
}) {
	return (
		<div className="flex justify-between items-center">
			<p className="font-medium">{label}</p>
			<StyleEditor element={element} stylers={stylers} stylerOptions={stylerOptions} />
		</div>
	)
}

function StyleEditor({
	element,
	stylers,
	stylerOptions,
}: {
	element: Element | Element[]
	stylers?: Array<
		| 'alignment'
		| 'backgrounds'
		| 'borders'
		| 'spacing'
		| 'typography'
		| 'animation'
		| 'background-image'
		| 'shadow'
	>
	stylerOptions?: {
		alignment?: {
			direction?: 'row' | 'column'
		}
	}
}) {
	return (
		<Styler>
			{stylers?.includes('alignment') && (
				<AlignmentEditor
					element={element}
					direction={stylerOptions?.alignment?.direction || 'row'}
				/>
			)}
			{(!stylers || stylers.includes('backgrounds')) && (
				<BackgroundsEditor simple element={element} />
			)}
			{(!stylers || stylers.includes('borders')) && (
				<BordersEditor simple element={element} />
			)}
			{(!stylers || stylers.includes('spacing')) && <SpacingEditor element={element} />}
			{(!stylers || stylers.includes('typography')) && (
				<TypographyEditor simple element={element} />
			)}
			{stylers?.includes('animation') && element instanceof Element && (
				<SimpleAnimationEditor element={element as Element} />
			)}
			{stylers?.includes('background-image') && (
				<BackgroundImageEditor element={element as Element} />
			)}
			{stylers?.includes('shadow') && (
				<SimpleModeShadowsEditor element={element as Element} />
			)}
		</Styler>
	)
}

export function BoxStylerSimple({ element, label }: { element: Element; label: string }) {
	const set = useSetWithElement(element)
	const setBgColor = (value: string) => {
		set((draft) => (draft.style.desktop!.default!.backgroundColor = value))
	}

	const color = useParseBgColor(element.style.desktop?.default?.backgroundColor ?? '')
	const palette = useAtomValue(selectedPaletteAtom)

	return (
		<ColorInput
			label={label}
			value={color}
			onChange={setBgColor}
			size="xs"
			format="hsla"
			swatches={palette.colors}
		/>
	)
}
