import { Divider } from '@mantine/core'
import { useSetAtom } from 'jotai'
import { ReactNode } from 'react'
import { Draggable, DraggableMode } from '../dnd/draggable'
import { ElementSections } from '../elements'
import { sidebarAtom } from './element-dragger-layer'

export function ElementDragger() {
	const setSidebar = useSetAtom(sidebarAtom)

	return (
		<div className="space-y-6">
			{ElementSections.map((section) => (
				<div key={section.title}>
					<Divider label={section.title} labelPosition="center" mb="xs" />
					<div className="grid grid-cols-3 gap-2">
						{section.items.map((Element) => {
							const element = new Element()
							return (
								<Draggable
									key={element.name}
									data={{ mode: DraggableMode.Add, ElementClass: Element }}
									onDrag={() => setSidebar({ tab: 'layers' })}
								>
									<ElementCard label={element.name} icon={element.icon} />
								</Draggable>
							)
						})}
					</div>
				</div>
			))}
		</div>
	)
}

export function ElementCard({ label, icon }: { label: string; icon: ReactNode }) {
	return (
		<div className="flex flex-col items-center gap-2 p-2 rounded bg-gray-50 cursor-grab text-slate-600 hover:text-slate-900">
			<div className="pt-1 text-2xl">{icon}</div>
			<p className="text-xs text-center">{label}</p>
		</div>
	)
}
