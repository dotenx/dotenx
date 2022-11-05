import { Button, Divider, Menu } from '@mantine/core'
import { useQuery } from '@tanstack/react-query'
import { useAtomValue } from 'jotai'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getPages, QueryKey } from '../../api'
import { AddPageForm } from './add-page-form'
import { projectTagAtom } from './top-bar'

export function PageSelection() {
	const { projectName = '', pageName = '' } = useParams()
	const [menuOpened, setMenuOpened] = useState(false)
	const pagesQuery = usePagesQuery()
	const pages = pagesQuery.data?.data ?? []
	const closeMenu = () => setMenuOpened(false)

	const pageList = pages
		.filter((page) => !!page)
		.map((page) => (
			<Menu.Item key={page} component={Link} to={`/projects/${projectName}/${page}`}>
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
					{`/${pageName}`}
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
	const projectTag = useAtomValue(projectTagAtom)
	const pagesQuery = useQuery([QueryKey.Pages, projectTag], () => getPages({ projectTag }), {
		enabled: !!projectTag,
	})

	return pagesQuery
}
