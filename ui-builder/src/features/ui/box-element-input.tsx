import { ColorInput } from '@mantine/core'
import { Element } from '../elements/element'
import { useSetWithElement } from '../elements/elements-store'
import { BackgroundsEditor } from '../style/background-editor'
import { BordersEditor } from '../style/border-editor'
import { SpacingEditor } from '../style/spacing-editor'
import { InputStyler } from './input-styler'

export function BoxElementInputSimple({ element, label }: { element: Element; label: string }) {
	const set = useSetWithElement(element)
	const setBgColor = (value: string) => {
		set((draft) => (draft.style.desktop!.default!.backgroundColor = value))
	}

	return (
		<ColorInput
			label={label}
			value={element.style.desktop?.default?.backgroundColor}
			onChange={setBgColor}
			size="xs"
			format="hsla"
		/>
	)
}

export function BoxElementInput({
	element,
	label,
}: {
	element: Element | Element[]
	label: string
}) {
	return (
		<div className="flex justify-between items-center">
			<p className="font-medium">{label}</p>
			<StyleEditor element={element} />
		</div>
	)
}

function StyleEditor({ element }: { element: Element | Element[] }) {
	return (
		<InputStyler>
			<BackgroundsEditor simple element={element} />
			<BordersEditor simple element={element} />
			<SpacingEditor element={element} />
		</InputStyler>
	)
}
