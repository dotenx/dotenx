import { Button, Divider, Menu, SegmentedControl, TextInput } from '@mantine/core'
import { useForm } from '@mantine/form'
import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { TbDeviceDesktop, TbDeviceMobile, TbDeviceTablet } from 'react-icons/tb'
import { QueryKey } from '../api/types'
import { usePages } from '../hooks'
import { useViewportStore, ViewportDevice } from './viewport-store'

export function TopBar({ projectTag, pagesList }: { projectTag: string; pagesList: string[] }) {
	const { viewport, changeViewport } = useViewportStore((store) => ({
		viewport: store.device,
		changeViewport: store.change,
	}))
	const { pageName, setPageName, pagesListLoading } = usePages(projectTag)
	const pageOptions = pagesList.map((p) => ({ label: p, value: p }))
	const [opened, setOpened] = useState(false)
	return (
		<div className="flex items-center justify-between h-full px-6">
			<Menu
				opened={opened}
				onChange={setOpened}
				transition={'pop'}
				width={260}
				shadow="sm"
				position="bottom-start"
			>
				<Menu.Target>
					<Button variant="subtle" size="xs" sx={{ minWidth: 260 }}>
						{pagesListLoading ? (
							<span className="animate-pulse bg-slate-300 w-10 h-4 rounded-md"></span>
						) : (
							'/' + (pageName || pagesList[0])
						)}
					</Button>
				</Menu.Target>

				<Menu.Dropdown>
					<Menu.Label>Page</Menu.Label>
					{pageOptions.map((p, index) => (
						<Menu.Item key={index} onClick={() => setPageName(p.value)}>
							/{p.label}
						</Menu.Item>
					))}
					<Divider label="or add a new page" labelPosition="center" />
					<AddPageForm projectTag={projectTag} closeMenu={setOpened} />
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

function AddPageForm({ projectTag, closeMenu }: { projectTag: string; closeMenu: any }) {
	const { addPageMutate } = usePages(projectTag)
	const queryClient = useQueryClient()

	const form = useForm({
		initialValues: {
			name: '',
		},

		validate: {
			name: (value) =>
				/^[a-z]{2,20}$[a-z0-9_]*$/.test(value)
					? null
					: 'Name must start with a letter and can only contain lowercase letters, numbers and underscores',
		},
	})
	return (
		<form
			onSubmit={form.onSubmit((values) => {
				addPageMutate(values, {
					onSuccess: () => {
						queryClient.invalidateQueries([QueryKey.GetPages]), closeMenu(false)
					},
				})
			})}
			className="p-1"
		>
			<TextInput size="xs" label="Page name" crossOrigin="" {...form.getInputProps('name')} />
			<Button type="submit" size="xs" mt="xs" fullWidth>
				Add Page
			</Button>
		</form>
	)
}
