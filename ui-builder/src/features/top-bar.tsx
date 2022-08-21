import { Button, Divider, Menu, SegmentedControl, TextInput } from '@mantine/core'
import { useForm } from '@mantine/form'
import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { TbDeviceDesktop, TbDeviceMobile, TbDeviceTablet } from 'react-icons/tb'
import { QueryKey } from '../api/api'
import { useGetProjectTag, usePages } from '../hooks'
import { useCanvasStore } from './canvas-store'
import { useDataSourceStore } from './data-source-store'
import { useViewportStore, ViewportDevice } from './viewport-store'

export function TopBar() {
	const { projectTag } = useGetProjectTag()
	const { pagesList, addPageMutate, addPageLoading } = usePages(projectTag)
	const { viewport, changeViewport } = useViewportStore((store) => ({
		viewport: store.device,
		changeViewport: store.change,
	}))
	const { pageName, setPageName, pagesListLoading } = usePages(projectTag)
	const pageOptions = pagesList.map((p) => ({ label: p, value: p }))
	const [opened, setOpened] = useState(false)
	const components = useCanvasStore((store) => store.components)
	const dataSources = useDataSourceStore((store) => store.sources)

	return (
		<div className="flex items-center justify-between h-full px-6">
			<div className="flex items-center gap-6">
				<Menu
					opened={opened}
					onChange={setOpened}
					width={260}
					shadow="sm"
					position="bottom-start"
				>
					<Menu.Target>
						<Button
							variant="subtle"
							size="xs"
							sx={{ minWidth: 260 }}
							loading={pagesListLoading}
						>
							{'/' + (pageName || (pagesList[0] ?? ''))}
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
					]}
				/>
			</div>
			<Button
				size="xs"
				onClick={() => addPageMutate({ name: pageName, components, dataSources })}
				loading={addPageLoading}
			>
				Publish
			</Button>
		</div>
	)
}

function AddPageForm({
	projectTag,
	closeMenu,
}: {
	projectTag: string
	closeMenu: (value: boolean) => void
}) {
	const { addPageMutate, addPageLoading } = usePages(projectTag)
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
				addPageMutate(
					{ ...values, components: [], dataSources: [] },
					{
						onSuccess: () => {
							queryClient.invalidateQueries([QueryKey.Pages]), closeMenu(false)
						},
					}
				)
			})}
			className="p-1"
		>
			<TextInput size="xs" label="Page name" crossOrigin="" {...form.getInputProps('name')} />
			<Button type="submit" size="xs" mt="xs" fullWidth loading={addPageLoading}>
				Add Page
			</Button>
		</form>
	)
}
