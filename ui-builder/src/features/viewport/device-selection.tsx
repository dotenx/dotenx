import { SegmentedControl } from '@mantine/core'
import { useAtom } from 'jotai'
import { TbDeviceDesktop, TbDeviceMobile, TbDeviceTablet } from 'react-icons/tb'
import { viewportAtom, ViewportDevice } from './viewport-store'

const deviceOptions = [
	{
		label: <TbDeviceDesktop size={18} title="Desktop view" />,
		value: 'desktop',
	},
	{
		label: <TbDeviceTablet size={18} title="Tablet view" />,
		value: 'tablet',
	},
	{
		label: <TbDeviceMobile size={18} title="Mobile view" />,
		value: 'mobile',
	},
]

export function DeviceSelection() {
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
