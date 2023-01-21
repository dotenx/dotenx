import { Switch } from "@mantine/core"
import clsx from "clsx"
import { useMutation, useQueryClient } from "react-query"
import { Link } from "react-router-dom"
import { QueryKey, setTableAccess } from "../../api"
import { Modals, useModal } from "../hooks"
import { AddButton } from "../ui"
import CustomQuery from "./custom-query"
import ExportDatabase from "./export-database"

export function TableList({ projectName, query }: { projectName: string; query: any }) {
	const tables = query.data?.data.tables ?? []
	const modal = useModal()
	const helpDetails = {
		title: "Use tables to store the data of your application",
		description:
			"The tables provide all the necessary functionality to store and manage your data. You can create tables, add columns, and manage the permissions of your users.",
		videoUrl: "https://www.youtube.com/embed/_5GRK17KUrg",
		tutorialUrl: "https://docs.dotenx.com/docs/builder_studio/files",
	}

	return (
		<div>
			<div className="w-full flex justify-between">
				<AddButton text="Add new table" handleClick={() => modal.open(Modals.NewTable)} />
				<div className="flex gap-x-5">
					<ExportDatabase projectName={projectName} />
					<CustomQuery />
				</div>
			</div>
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
		<div className="grid grid-cols-3 gap-y-10 gap-x-16 mt-10">
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
		<Link
			to={name + (isPublic ? "/public" : "/private")}
			className={clsx(
				"rounded-md bg-white px-6 py-4 flex justify-between items-center gap-6 hover:bg-gray-700 group hover:text-white",
				isLoading && "blur-[1px] animate-pulse"
			)}
		>
			<p className="text-2xl font-medium">{name}</p>
			<div
				onClick={(event) => {
					event.stopPropagation()
					if (!isLoading) mutate({ name, projectName, isPublic })
				}}
			>
				<Switch
					label={isPublic ? "public" : "private"}
					checked={isPublic}
					onChange={(event) => event.target.checked}
					classNames={{ label: "group-hover:text-white" }}
				/>
			</div>
		</Link>
	)
}
