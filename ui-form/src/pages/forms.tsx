import { Prism } from "@mantine/prism"
import { useQuery } from "@tanstack/react-query"
import { useParams } from "react-router-dom"
import { api } from "../api"
import { QueryKey } from "../api/types"
import { useGetProjectTag } from "../features/hooks/use-project-query"
import { ContentWrapper, Header } from "../features/ui/header"
import { Loader } from "../features/ui/loader"

export function FormsPage() {
	const { page = "" } = useParams()

	return (
		<>
			<Header title={`${page} Forms`} />
			<ContentWrapper>
				<FormList page={page} />
			</ContentWrapper>
		</>
	)
}

function FormList({ page }: { page: string }) {
	const formsQuery = useSubmittedFormsQuery({ pageName: page })
	const forms = formsQuery.data?.data ?? []

	if (formsQuery.isLoading) return <Loader />

	if (forms.length === 0) return <p>No forms submitted yet</p>

	return (
		<ul className="space-y-6">
			{forms.map((form) => (
				<li key={form.form_id} className="bg-white border rounded-lg p-4 space-y-4">
					<p className="font-semibold text-lg">{form.form_id}</p>
					<Prism language="json">{JSON.stringify(form.response, null, 2)}</Prism>
				</li>
			))}
		</ul>
	)
}

const useSubmittedFormsQuery = ({ pageName }: { pageName: string }) => {
	const { projectTag } = useGetProjectTag()
	return useQuery(
		[QueryKey.GetSubmittedForms, projectTag, pageName],
		() =>
			api.getSubmittedForms({
				projectTag,
				pageName,
			}),
		{
			enabled: !!projectTag && !!pageName,
		}
	)
}
