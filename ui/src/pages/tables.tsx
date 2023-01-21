import { Button } from "@mantine/core"
import { useState } from "react"
import { IoArrowBack } from "react-icons/io5"
import { useQuery } from "react-query"
import { Link, Navigate, useParams } from "react-router-dom"
import { getTables, QueryKey } from "../api"
import { TableForm, TableList } from "../features/database"
import { Modals } from "../features/hooks"
import { Content_Wrapper, Header, Loader, NewModal } from "../features/ui"
import { ViewList } from "../features/views/view-list"

export default function TablesPage() {
	const { projectName } = useParams()
	if (!projectName) return <Navigate to="/" replace />
	return <Tables name={projectName} />
}

function Tables({ name }: { name: string }) {
	const [noDatabase, setNoDatabase] = useState(false)

	const [activeTab, setActiveTab] = useState<"Tables" | "Views">("Tables")
	const query = useQuery(QueryKey.GetTables, () => getTables(name), {
		onError: (err: any) => {
			if (err.response.status === 400) {
				setNoDatabase(true)
			}
		},
	})
	if (query.isLoading)
		return (
			<div className="w-full mt-20">
				<Loader />
			</div>
		)
	return (
		<>
			<div className=" w-full">
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
						<Header
							title="Tables"
							tabs={["Tables", "Views"]}
							activeTab={activeTab}
							onTabChange={(v: typeof activeTab) => {
								setActiveTab(v)
							}}
						/>
						<Content_Wrapper>
							{activeTab === "Tables" && (
								<TableList projectName={name} query={query} />
							)}
							{activeTab === "Views" && <ViewList projectName={name} />}
						</Content_Wrapper>
					</>
				)}
			</div>
			<NewModal kind={Modals.NewTable} title="Add a new table">
				<TableForm projectName={name} />
			</NewModal>
		</>
	)
}
