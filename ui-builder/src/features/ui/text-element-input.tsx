import { ActionIcon, CloseButton, Popover, ScrollArea, TextInput } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { TbDroplet } from 'react-icons/tb'
import { Element } from '../elements/element'
import { useSetWithElement } from '../elements/elements-store'
import { TextElement } from '../elements/extensions/text'
import { Expression } from '../states/expression'
import { SpacingEditor } from '../style/spacing-editor'
import { TypographyEditor } from '../style/typography-editor'

export function TextElementInput({ label, element }: { label: string; element: TextElement }) {
	const set = useSetWithElement(element)
	const setText = (text: string) => {
		set((draft) => (draft.data.text = Expression.fromString(text)))
	}

	return (
		<TextInput
			size="xs"
			label={label}
			name={label}
			value={element.data.text.toString()}
			onChange={(event) => setText(event.target.value)}
			rightSection={<StyleSection element={element} />}
		/>
	)
}

function StyleSection({ element }: { element: TextElement }) {
	const [opened, openedHandlers] = useDisclosure(false)

	return (
		<Popover
			shadow="md"
			position="left"
			withinPortal
			width={300}
			closeOnClickOutside={false}
			opened={opened}
		>
			<Popover.Target>
				<ActionIcon size="xs" onClick={openedHandlers.toggle}>
					<TbDroplet size={12} />
				</ActionIcon>
			</Popover.Target>
			<Popover.Dropdown sx={{ padding: 0 }}>
				<CloseButton onClick={openedHandlers.close} size="xs" ml="auto" />
				<ScrollArea sx={{ height: 400, padding: '0 16px 12px 16px' }} offsetScrollbars>
					<StyleEditor element={element} />
				</ScrollArea>
			</Popover.Dropdown>
		</Popover>
	)
}

function StyleEditor({ element }: { element: Element }) {
	return (
		<div className="space-y-6 text-xs">
			<TypographyEditor simple element={element} />
			<SpacingEditor element={element} />
		</div>
	)
}
