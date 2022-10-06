import { SegmentedControl, Text, Tooltip } from '@mantine/core'
import { useAtom } from 'jotai'
import { ReactNode } from 'react'
import { TbDeviceDesktop, TbDeviceMobile, TbDeviceTablet } from 'react-icons/tb'
import { viewportAtom, ViewportDevice } from './viewport-store'

export function ViewportSelection() {
	const [viewport, setViewport] = useAtom(viewportAtom)

	return (
		<SegmentedControl
			value={viewport}
			onChange={(value: ViewportDevice) => setViewport(value)}
			size="xs"
			data={deviceOptions}
		/>
	)
}

const deviceOptions = [
	{
		label: (
			<SmallTooltip label="Desktop view">
				<TbDeviceDesktop size={18} />
			</SmallTooltip>
		),
		value: 'desktop',
	},
	{
		label: (
			<SmallTooltip label="Tablet view">
				<TbDeviceTablet size={18} />
			</SmallTooltip>
		),
		value: 'tablet',
	},
	{
		label: (
			<SmallTooltip label="Mobile view">
				<TbDeviceMobile size={18} />
			</SmallTooltip>
		),
		value: 'mobile',
	},
]

function SmallTooltip({ children, label }: { children: ReactNode; label: string }) {
	return (
		<Tooltip offset={14} withinPortal withArrow label={<Text size="xs">{label}</Text>}>
			<span>{children}</span>
		</Tooltip>
	)
}
