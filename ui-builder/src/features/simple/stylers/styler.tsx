import { ActionIcon, Drawer, SegmentedControl } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { useAtom } from 'jotai'
import { ReactNode } from 'react'
import { TbDroplet } from 'react-icons/tb'
import { CssSelector } from '../../elements/style'
import { selectedSelectorAtom } from '../../style/class-editor'

export function Styler({
	children,
	withHoverSelector,
}: {
	children: ReactNode
	withHoverSelector?: boolean
}) {
	const [opened, openedHandlers] = useDisclosure(false)
	const [selector, setSelector] = useAtom(selectedSelectorAtom)

	return (
		<>
			<ActionIcon size="xs" onClick={openedHandlers.toggle}>
				<TbDroplet size={12} />
			</ActionIcon>
			<Drawer
				opened={opened}
				onClose={() => {
					openedHandlers.close()
					setSelector(CssSelector.Default)
				}}
				position="right"
				padding="lg"
				overlayProps={{ opacity: 0.1 }}
				size={310}
				title={
					withHoverSelector && (
						<SegmentedControl
							data={[
								{ label: 'Default', value: CssSelector.Default },
								{ label: 'Hover', value: CssSelector.Hover },
							]}
							size="xs"
							value={selector}
							onChange={(value: CssSelector) => setSelector(value)}
						/>
					)
				}
			>
				<div className="space-y-6 text-xs">{children}</div>
			</Drawer>
		</>
	)
}
