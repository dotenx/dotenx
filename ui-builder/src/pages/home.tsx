import { Container, Divider, Loader, Text } from '@mantine/core'
import { useQuery } from '@tanstack/react-query'
import _ from 'lodash'
import { getPages, QueryKey } from '../api'
import { PageForm } from '../features/page/page-form'
import { PageList } from '../features/page/page-list'
import { useFetchProjectTag } from '../features/page/top-bar'

export function HomePage() {
	const pagesQuery = usePagesQuery()
	const pages = pagesQuery.data?.data?.filter((page) => !!page) ?? []

	if (pagesQuery.isLoading) return <Loader size="xs" mx="auto" mt="xl" />

	return (
		<Container my="xl" py="xl">
			{_.isEmpty(pages) ? (
				<NoPageMessage />
			) : (
				<>
					<PageList pages={pages} />
					<Divider label="or add a new page" my="xl" />
				</>
			)}
			<PageForm />
		</Container>
	)
}

function NoPageMessage() {
	return (
		<Text size="xs" color="dimmed" my="xl">
			You have no page yet, add one to continue
		</Text>
	)
}

const usePagesQuery = () => {
	const projectTag = useFetchProjectTag() ?? ''
	const pagesQuery = useQuery([QueryKey.Pages, projectTag], () => getPages({ projectTag }), {
		enabled: !!projectTag,
	})
	return pagesQuery
}
