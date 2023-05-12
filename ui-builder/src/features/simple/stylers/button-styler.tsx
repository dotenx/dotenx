import { TextInput } from '@mantine/core'
import { useSetWithElement } from '../../elements/elements-store'
import { ButtonElement } from '../../elements/extensions/button'
import { BackgroundsEditor } from '../../style/background-editor'
import { BordersEditor } from '../../style/border-editor'
import { DisplayEditor } from '../../style/display-editor'
import { SpacingEditor } from '../../style/spacing-editor'
import { TypographyEditor } from '../../style/typography-editor'
import { Styler } from './styler'

export function ButtonStyler({ label, element }: { label: string; element: ButtonElement }) {
	const set = useSetWithElement(element)
	const setText = (text: string) => {
		set((draft) => (draft.data.text = text))
	}

	return (
		<TextInput
			size="xs"
			label={label}
			name={label}
			value={element.data.text.toString()}
			onChange={(event) => setText(event.target.value)}
			rightSection={<StyleEditor element={element} />}
		/>
	)
}

function StyleEditor({ element }: { element: ButtonElement | ButtonElement[] }) {
	return (
		<Styler withHoverSelector>
			<TypographyEditor element={element} simple />
			<BackgroundsEditor simple element={element} />
			<BordersEditor element={element} />
			<SpacingEditor element={element} />
			<DisplayEditor element={element} />
		</Styler>
	)
}
