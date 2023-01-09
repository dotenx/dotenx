import { ColorInput } from '@mantine/core'
import { Element } from '../elements/element'
import { useSetWithElement } from '../elements/elements-store'

export function BoxElementInput({ element, label }: { element: Element; label: string }) {
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
