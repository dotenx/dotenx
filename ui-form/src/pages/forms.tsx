import { Loader as LoaderDots, Table } from "@mantine/core"
import { useMutation, useQuery } from "@tanstack/react-query"
import { useState } from "react"
import { TbChevronDown, TbChevronRight } from "react-icons/tb"
import { useNavigate, useParams } from "react-router-dom"
import { api } from "../api"
import { QueryKey } from "../api/types"
import { useGetProjectTag } from "../features/hooks/use-project-query"
import { ContentWrapper, Header } from "../features/ui/header"
import { Loader } from "../features/ui/loader"

export function FormsPage() {
	const { page = "" } = useParams()
	const { projectName, projectTag } = useGetProjectTag()
	const navigate = useNavigate()
	return (
		<>
			<Header title={`${page} Forms`} />
			<ContentWrapper>
				<div className="flex cursor-default items-center gap-x-1 text-sm mb-10">
					<span className="cursor-pointer" onClick={() => navigate(`/${projectName}`)}>
						Pages
					</span>{" "}
					<TbChevronRight className="w-3 h-3" /> {page}
				</div>
				<FormList page={page} projectTag={projectTag} />
			</ContentWrapper>
		</>
	)
}

function FormList({ page, projectTag }: { page: string; projectTag: string }) {
	const formsQuery = useSubmittedFormsQuery({ pageName: page })
	const [tableData, setTableData] = useState<any>()
	const [clickedFormId, setClickedFormId] = useState<string>()
	const forms = formsQuery.data?.data ?? []
	const { mutate, isLoading: loadingResponses } = useMutation(api.getFormResponses, {
		onSuccess: (d) => setTableData(d.data),
		onError: (e: any) => {
			if (e.response.status === 404) {
				setTableData("no-submission")
			}
		},
	})
	if (formsQuery.isLoading || !projectTag) return <Loader className="w-full text-center mt-24" />

	if (forms.length === 0)
		return <div className="w-full text-center mt-24">No forms submitted yet</div>

	return (
		<div className="bg-white pb-2">
			{forms?.map((form) => (
				<div className={"bg-white p-2 space-y-5  "}>
					<div
						onClick={() => {
							if (tableData && clickedFormId === form.form_id) {
								setTableData(undefined)
							} else {
								setTableData(undefined)
								mutate({ projectTag, formId: form.form_id, page })
								setClickedFormId(form.form_id)
							}
						}}
						className={`${
							loadingResponses &&
							clickedFormId === form.form_id &&
							"pointer-events-none "
						}font-semibold items-center  border hover:bg-gray-50 p-2 rounded-md   cursor-pointer  transition-all text-lg flex justify-between`}
					>
						{form.name}
						{loadingResponses && clickedFormId === form.form_id && (
							<LoaderDots variant="dots" />
						)}
						<TbChevronDown
							className={`w-7 h-7 transition-all  ${
								tableData && clickedFormId === form.form_id && "rotate-180"
							} `}
						/>
					</div>
					{tableData && clickedFormId === form.form_id && <FormTable data={tableData} />}
				</div>
			))}
		</div>
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

const FormTable = ({ data }: { data: any }) => {
	if (data === "no-submission")
		return <div className="w-full text-center ">No form Submission yet.</div>
	const headers = Object.keys(data[0]?.response)
	const tBodies = data?.map((d: any, index: number) => {
		return (
			<tr key={index}>
				{Object.values(d.response).map((v: any) => {
					return <td>{v}</td>
				})}
			</tr>
		)
	})

	const tHeaders = (
		<tr key={headers[0]}>
			{headers?.map((h) => (
				<th>{h}</th>
			))}
		</tr>
	)
	return (
		<Table striped>
			<thead>{tHeaders}</thead>
			<tbody>{tBodies}</tbody>
		</Table>
	)
}
