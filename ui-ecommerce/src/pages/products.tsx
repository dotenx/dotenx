import { Button } from "@mantine/core"
import { useState } from "react"
import { IoReload } from "react-icons/io5"
import { useQuery, useQueryClient } from "react-query"
import { Link, useParams } from "react-router-dom"
import { getProductsSummary, getProject, QueryKey } from "../api"
import { Content_Wrapper, Header, Table } from "../features/ui"

export function ProductsPage() {
	const { projectName = "" } = useParams()
	const [currentPage, setCurrentPage] = useState(1)
	const [activeTab, setActiveTab] = useState<"all" | "products" | "memberships">("all")
	const { data: projectDetails, isLoading: projectDetailsLoading } = useQuery(
		QueryKey.GetProject,
		() => getProject(projectName)
	)
	const projectTag = projectDetails?.data.tag ?? ""
	const { data: usersData, isLoading: usersDataLoading } = useQuery(
		[QueryKey.GetProductsSummary, projectTag, currentPage],
		() => getProductsSummary(projectTag, currentPage),
		{ enabled: !!projectTag }
	)
	const tableData = usersData?.data?.rows ?? []
	const nPages = Math.ceil((usersData?.data?.totalRows as number) / 10)
	const queryClient = useQueryClient()

	return (
		<div>
			<Header
				tabs={["all", "products", "memberships"]}
				headerLink={`/builder/projects/${projectName}/user-management`}
				title={"Products"}
				activeTab={activeTab}
				onTabChange={(v: typeof activeTab) => {
					setActiveTab(v)
				}}
			>
				<ActionBar />
			</Header>
			<Content_Wrapper>
				{activeTab === "all" && (
					<div className="flex flex-col">
						<Stats />
						<Table
							withPagination
							currentPage={currentPage}
							nPages={nPages}
							setCurrentPage={setCurrentPage}
							loading={projectDetailsLoading || usersDataLoading}
							emptyText="No products added yet"
							actionBar={
								<Button
									leftIcon={<IoReload />}
									type="button"
									onClick={() =>
										queryClient.invalidateQueries(QueryKey.GetProductsSummary)
									}
								>
									Refresh
								</Button>
							}
							columns={[
								{
									Header: "",
									accessor: "imageUrl",
								},
								{
									Header: "Name",
									accessor: "name",
								},
								{
									Header: "Sales",
									accessor: "sales",
								},
								{
									Header: "Revenue",
									accessor: "revenue",
								},
								{
									Header: "Status",
									accessor: "status",
								},
							]}
							data={tableData}
						/>
					</div>
				)}
			</Content_Wrapper>
		</div>
	)
}

function ActionBar() {
	const { projectName } = useParams()

	return (
		<>
			<div className="flex flex-wrap gap-2">
				<Button component={Link} to={`/projects/${projectName}/products/new`}>
					Add New Product
				</Button>
			</div>
		</>
	)
}

function Stats() {
	const totalRevenue = 130
	const last24 = 10
	const mrr = 100

	return (
		<div className="grid lg:grid-cols-3 md-grid-cols-2 gap-x-2 gap-y-2">
			<StatBlock title="Total Revenue" value={`$${totalRevenue}`} defaultValue="$0" />
			<StatBlock title="Last 24h" value={`$${last24}`} defaultValue="$0" />
			<StatBlock title="MRR" value={`$${mrr}`} defaultValue="$0" />
		</div>
	)
}

function StatBlock({
	title,
	value,
	defaultValue,
}: {
	title: string
	value: string
	defaultValue: string
}) {
	return (
		<div className="bg-white rounded-lg p-4 border-solid border-2 border-gray-600">
			<p className="text-gray-500 text-sm pb-2">{title}</p>
			<p className="text-2xl font-bold">{value || defaultValue}</p>
		</div>
	)
}
