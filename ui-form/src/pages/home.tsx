import { useQuery } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { api } from "../api"
import { QueryKey } from "../api/types"
import { useGetProjectTag } from "../features/hooks/use-project-query"
import { ContentWrapper, Header } from "../features/ui/header"
import { Loader } from "../features/ui/loader"

export function HomePage() {
	return (
		<>
			<Header title="Forms" />
			<ContentWrapper>
				<PageList />
			</ContentWrapper>
		</>
	)
}

function PageList() {
	const pagesQuery = usePagesQuery()
	const navigate = useNavigate()

	if (pagesQuery.isLoading) return <Loader />

	return (
		<div>
			<div className="flex text-gray-600 justify-between w-full mb-3 mt-5 px-5">
				<div>Page name</div>
				<div>Submissions </div>
			</div>
			<div className="space-y-3">
				{pagesQuery?.data?.data?.map((page) => (
					<div
						className="cursor-pointer hover:shadow-lg flex transition-all hover:bg-black hover:text-white justify-between w-full bg-white text-xl font-semibold p-5  rounded-md"
						key={page.page_name}
						onClick={() => navigate(page.page_name)}
					>
						<div>{page.page_name}</div>
						<div className="min-w-[100px] text-center">{page.submitted_forms}</div>
					</div>
				))}
			</div>
		</div>
	)
}

const usePagesQuery = () => {
	const { projectTag } = useGetProjectTag()
	return useQuery(
		[QueryKey.GetPagesList, projectTag],
		() =>
			api.getPagesList({
				projectTag,
			}),
		{
			enabled: !!projectTag,
		}
	)
}
