import { Button, Divider, Menu, SegmentedControl, TextInput } from '@mantine/core'
import { TbDeviceDesktop, TbDeviceMobile, TbDeviceTablet } from 'react-icons/tb'
import { useViewportStore, ViewportDevice } from './viewport-store'

export function TopBar() {
	const { viewport, changeViewport } = useViewportStore((store) => ({
		viewport: store.device,
		changeViewport: store.change,
	}))

	return (
		<div className="flex items-center justify-between h-full px-6">
			<Menu width={260} shadow="sm" position="bottom-start">
				<Menu.Target>
					<Button variant="subtle" size="xs" sx={{ minWidth: 260 }}>
						/about
					</Button>
				</Menu.Target>

				<Menu.Dropdown>
					<Menu.Label>Page</Menu.Label>
					<Menu.Item>/about</Menu.Item>
					<Menu.Item>/home</Menu.Item>
					<Menu.Item>/login</Menu.Item>
					<Divider label="or add a new page" labelPosition="center" />
					<AddPageForm />
				</Menu.Dropdown>
			</Menu>
			<SegmentedControl
				value={viewport}
				onChange={(value: ViewportDevice) => changeViewport(value)}
				size="xs"
				data={[
					{ label: <TbDeviceDesktop size={18} title="Desktop view" />, value: 'desktop' },
					{ label: <TbDeviceTablet size={18} title="Tablet view" />, value: 'tablet' },
					{ label: <TbDeviceMobile size={18} title="Mobile view" />, value: 'mobile' },
				]}
			/>
		</div>
	)
}

function AddPageForm() {
	return (
		<form className="p-1">
			<TextInput size="xs" label="Page name" />
			<Button size="xs" mt="xs" fullWidth>
				Add Page
			</Button>
		</form>
	)
}
