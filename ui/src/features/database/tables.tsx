import { Switch } from "@mantine/core"
import { IoAdd } from "react-icons/io5"
import { useMutation, useQueryClient } from "react-query"
import { Link } from "react-router-dom"
import { QueryKey, setTableAccess } from "../../api"
import { Modals, useModal } from "../hooks"
import { PageTitle } from "../ui/page-title"

export function TableList({ projectName, query }: { projectName: string; query: any }) {
	const tables = query.data?.data.tables ?? []

	const helpDetails = {
		title: "Use tables to store the data of your application",
		description:
			"The tables provide all the necessary functionality to store and manage your data. You can create tables, add columns, and manage the permissions of your users.",
		videoUrl: "https://www.youtube.com/embed/_5GRK17KUrg",
		tutorialUrl: "https://docs.dotenx.com/docs/builder_studio/files",
	}

	return (
		<div>
			<PageTitle title="Tables" helpDetails={helpDetails} />
			<List items={tables} projectName={projectName} />
		</div>
	)
}

function List({
	items,
	projectName,
}: {
	items: { name: string; is_public: boolean }[]
	projectName: string
}) {
	return (
		<div className="flex flex-wrap gap-8 mt-4">
			{items
				.filter((table) => table.name !== "user_info" && table.name !== "user_group")
				.map((table, index) => (
					<ListItem
						key={index}
						projectName={projectName}
						isPublic={table.is_public}
						name={table.name}
					/>
				))}
			<AddTableButton />
		</div>
	)
}

function ListItem({
	name,
	isPublic,
	projectName,
}: {
	name: string
	isPublic: boolean
	projectName: string
}) {
	const client = useQueryClient()
	const { mutate, isLoading } = useMutation(setTableAccess, {
		onSuccess: () => client.invalidateQueries(QueryKey.GetTables),
	})
	return (
		<div
			className={`grid grid-cols-1 py-2  place-items-center w-40 h-32 transition rounded shadow-sm bg-rose-50 shadow-rose-50 text-rose-900 hover:bg-rose-100 hover:shadow hover:shadow-rose-100 outline-rose-400 `}
		>
			<Link to={name + (isPublic ? "/public" : "")} className="text-xl font-medium">
				{name}
			</Link>
			<div
				onClick={() =>
					mutate({
						name,
						projectName,
						isPublic,
					})
				}
				className={`flex mt-3 cursor-pointer mr-2 ${isLoading && "blur-sm animate-pulse "}`}
			>
				<Switch
					label={isPublic ? "public" : "private"}
					className="mr-2"
					size="md"
					color={"pink"}
					checked={isPublic}
				></Switch>
			</div>
		</div>
	)
}

function AddTableButton() {
	const modal = useModal()

	return (
		<button
			className="flex items-center justify-center w-40 h-32 text-xl text-center transition-all border-2 border-dashed rounded border-rose-400 text-rose-500 hover:text-2xl hover:text-rose-600 hover:border-x-rose-600 outline-rose-400"
			onClick={() => modal.open(Modals.NewTable)}
		>
			<IoAdd />
		</button>
	)
}
