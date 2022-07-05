import { Drawer as RawDrawer, DrawerProps as RawDrawerProps, ScrollArea } from '@mantine/core'
import { Modals, useModal } from '../hooks'

interface DrawerProps extends Omit<RawDrawerProps, 'opened' | 'onClose'> {
	kind: Modals
}

export function Drawer({ kind, children, ...rest }: DrawerProps) {
	const modal = useModal()

	return (
		<RawDrawer
			title="Endpoints"
			size="1000px"
			position="right"
			classNames={{
				header: 'px-6 pt-6',
				drawer: 'flex flex-col text-slate-700 font-body selection:bg-rose-400 selection:text-slate-700',
			}}
			{...rest}
			opened={modal.isOpen && modal.kind === kind}
			onClose={modal.close}
		>
			<ScrollArea className="h-full px-6 pb-6">{children}</ScrollArea>
		</RawDrawer>
	)
}
