import { Button, Divider, Menu } from '@mantine/core'
import { useQuery } from '@tanstack/react-query'
import { useAtom } from 'jotai'
import { useState } from 'react'
import { useMatch, useNavigate } from 'react-router-dom'
import { getPages, QueryKey } from '../../api'
import { AddPageForm } from './add-page-form'
import { selectedPageAtom } from './top-bar'

export function PageSelection({
	projectTag,
	projectName,
}: {
	projectTag: string
	projectName: string
}) {
	const [selectedPage, setSelectedPage] = useAtom(selectedPageAtom)
	const [menuOpened, setMenuOpened] = useState(false)
	const navigate = useNavigate()
	const isSimple = useMatch('/projects/:projectName/simple')
	const pagesQuery = useQuery([QueryKey.Pages, projectTag], () => getPages({ projectTag }), {
		onSuccess: (data) => {
			const pages = data.data ?? []
			const firstPage = pages[0] ?? 'index'
			setSelectedPage({ exists: !!pages[0], route: firstPage })
			if (pages.length === 0 && !isSimple) navigate(`/projects/${projectName}/simple`)
		},
		enabled: !!projectTag,
	})
	const pages = pagesQuery.data?.data ?? []
	const closeMenu = () => setMenuOpened(false)

	const pageList = pages.map((page) => (
		<Menu.Item key={page} onClick={() => setSelectedPage({ exists: true, route: page })}>
			/{page}
		</Menu.Item>
	))

	return (
		<Menu opened={menuOpened} onChange={setMenuOpened} width={260} shadow="sm">
			<Menu.Target>
				<Button
					variant="light"
					size="xs"
					sx={{ minWidth: 200 }}
					loading={pagesQuery.isLoading}
				>
					{`/${selectedPage.route}`}
				</Button>
			</Menu.Target>

			<Menu.Dropdown>
				<Menu.Label>Page</Menu.Label>
				{pageList}
				<Divider label="or add a new page" labelPosition="center" />
				<AddPageForm projectTag={projectTag} onSuccess={closeMenu} />
			</Menu.Dropdown>
		</Menu>
	)
}
