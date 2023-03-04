import { Anchor } from "@mantine/core"
import { useQuery } from "@tanstack/react-query"
import { Link } from "react-router-dom"
import { api } from "../api"
import { QueryKey } from "../api/types"
import { useGetProjectTag } from "../features/hooks/use-project-query"
import { ContentWrapper, Header } from "../features/ui/header"
import { Loader } from "../features/ui/loader"

export function HomePage() {
	return (
		<>
			<Header title="Pages" />
			<ContentWrapper>
				<PageList />
			</ContentWrapper>
		</>
	)
}

function PageList() {
	const pagesQuery = usePagesQuery()

	if (pagesQuery.isLoading) return <Loader />

	return (
		<ul className="space-y-2">
			{pagesQuery.data?.data?.map((page) => (
				<li key={page}>
					<Anchor component={Link} to={page} color="dimmed">
						{page}
					</Anchor>
				</li>
			))}
		</ul>
	)
}

const usePagesQuery = () => {
	const { projectTag } = useGetProjectTag()
	return useQuery(
		[QueryKey.GetPages, projectTag],
		() =>
			api.getPages({
				projectTag,
			}),
		{
			enabled: !!projectTag,
		}
	)
}
