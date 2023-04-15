import { TextInput } from '@mantine/core'
import { Element } from '../../elements/element'
import { BackgroundsEditor } from '../../style/background-editor'
import { BordersEditor } from '../../style/border-editor'
import { SimpleAnimationEditor } from '../../style/simple-animation-editor'
import { SimpleModeShadowsEditor } from '../../style/simple-mode-shadows-editor'
import { SpacingEditor } from '../../style/spacing-editor'
import { TypographyEditor } from '../../style/typography-editor'
import { Styler } from './styler'
import { useSetWithElement } from '../../elements/elements-store'
import { InputElement } from '../../elements/extensions/input'

export function InputStyler({
	element,
	label,
	stylers,
}: {
	element: InputElement
	label: string
	stylers?: Array<'backgrounds' | 'borders' | 'spacing' | 'typography' | 'animation' | 'shadow'>
}) {
	const set = useSetWithElement(element)
	const setPlaceHolder = (text: string) => {
		set((draft) => (draft.data.placeholder = text))
	}
	return (
		<TextInput
			size="xs"
			label={label}
			name={label}
			value={element.data.placeholder.toString()}
			onChange={(event) => setPlaceHolder(event.target.value)}
			rightSection={<StyleEditor element={element} stylers={stylers} />}
		/>
	)
}

function StyleEditor({
	element,
	stylers,
}: {
	element: Element | Element[]
	stylers?: Array<'backgrounds' | 'borders' | 'spacing' | 'typography' | 'animation' | 'shadow'>
}) {
	return (
		<Styler>
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
			{stylers?.includes('shadow') && (
				<SimpleModeShadowsEditor element={element as Element} />
			)}
		</Styler>
	)
}
