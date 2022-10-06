import { Button, Divider, Menu } from '@mantine/core'
import { useQuery } from '@tanstack/react-query'
import { useAtom, useAtomValue } from 'jotai'
import { useState } from 'react'
import { useMatch, useNavigate, useParams } from 'react-router-dom'
import { getPages, QueryKey } from '../../api'
import { AddPageForm } from './add-page-form'
import { projectTagAtom, selectedPageAtom } from './top-bar'

export function PageSelection() {
	const [selectedPage, setSelectedPage] = useAtom(selectedPageAtom)
	const [menuOpened, setMenuOpened] = useState(false)
	const pagesQuery = usePagesQuery()
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
				<AddPageForm onSuccess={closeMenu} />
			</Menu.Dropdown>
		</Menu>
	)
}

const usePagesQuery = () => {
	const navigate = useNavigate()
	const { projectName = '' } = useParams()
	const isSimple = useMatch('/projects/:projectName/simple')
	const projectTag = useAtomValue(projectTagAtom)

	const pagesQuery = useQuery([QueryKey.Pages, projectTag], () => getPages({ projectTag }), {
		onSuccess: (data) => {
			const pages = data.data ?? []
			if (pages.length === 0 && !isSimple) navigate(`/projects/${projectName}/simple`)
		},
		enabled: !!projectTag,
	})

	return pagesQuery
}
