import { Button } from "@mantine/core"
import { useState } from "react"
import { IoArrowBack } from "react-icons/io5"
import { useQuery } from "react-query"
import { Link, Navigate, useParams } from "react-router-dom"
import { getTables, QueryKey } from "../api"
import { TableForm, TableList } from "../features/database"
import ExportDatabase from "../features/database/export-database"
import CustomQuery from "../features/database/custom-query"
import { Modals } from "../features/hooks"
import { ContentWrapper, Loader, NewModal } from "../features/ui"
import { ViewList } from "../features/views/view-list"

export default function TablesPage() {
	const { projectName } = useParams()
	if (!projectName) return <Navigate to="/" replace />
	return <Tables name={projectName} />
}

function Tables({ name }: { name: string }) {
	const [noDatabase, setNoDatabase] = useState(false)
	const query = useQuery(QueryKey.GetTables, () => getTables(name), {
		onError: (err: any) => {
			if (err.response.status === 400) {
				setNoDatabase(true)
			}
		},
	})
	if (query.isLoading)
		return (
			<ContentWrapper>
				<Loader />
			</ContentWrapper>
		)
	return (
		<>
			<ContentWrapper>
				{noDatabase ? (
					<div className="flex flex-col items-center">
						<div className="mb-4 mt-44">
							This project does not have a database to add tables you need to create a
							project <span className="underline">with</span> database
						</div>
						<Link to="/">
							<Button size="sm">
								<IoArrowBack className="mr-1" />
								Projects
							</Button>
						</Link>
					</div>
				) : (
					<>
						<div className="w-full flex items-center justify-end gap-x-5">
							<CustomQuery />
							<ExportDatabase projectName={name} />
						</div>
						<TableList projectName={name} query={query} />
						<ViewList projectName={name} />
					</>
				)}
			</ContentWrapper>
			<NewModal kind={Modals.NewTable} title="Add a new table">
				<TableForm projectName={name} />
			</NewModal>
		</>
	)
}
