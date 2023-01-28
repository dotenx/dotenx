import { Button } from "@mantine/core"
import { useState } from "react"
import { BsPlusLg } from "react-icons/bs"
import { useQuery } from "react-query"
import { Link, useParams } from "react-router-dom"
import { getProductsSummary, QueryKey } from "../api"
import { ContentWrapper, Header, Table } from "../features/ui"
import { useGetProjectTag } from "../features/ui/hooks/use-get-project-tag"

export function ProductsPage() {
	const [activeTab, setActiveTab] = useState<"all" | "products" | "memberships">("all")

	return (
		<div>
			<Header
				title="Products"
				tabs={["all", "products", "memberships"]}
				activeTab={activeTab}
				onTabChange={setActiveTab}
			>
				<ActionBar />
			</Header>
			<ContentWrapper>
				{activeTab === "all" && <AllTab />}
				{activeTab === "products" && <ProductsTab />}
				{activeTab === "memberships" && <MembershipsTab />}
			</ContentWrapper>
		</div>
	)
}

function ActionBar() {
	const { projectName } = useParams()

	return (
		<Button
			component={Link}
			to={`/projects/${projectName}/products/new`}
			leftIcon={<BsPlusLg />}
		>
			New Product
		</Button>
	)
}

function AllTab() {
	const [currentPage, setCurrentPage] = useState(1)
	const projectQuery = useGetProjectTag()
	const projectTag = projectQuery.projectTag
	const productsSummaryQuery = useQuery(
		[QueryKey.GetProductsSummary, projectTag, currentPage],
		() => getProductsSummary(projectTag, currentPage),
		{ enabled: !!projectTag }
	)
	const products = productsSummaryQuery.data?.data?.rows ?? []
	const nPages = Math.ceil((productsSummaryQuery?.data?.data?.totalRows ?? 0) / 10)

	return (
		<div>
			<SalesStats />
			<Table
				withPagination
				currentPage={currentPage}
				nPages={nPages}
				setCurrentPage={setCurrentPage}
				loading={projectQuery.isLoading || productsSummaryQuery.isLoading}
				emptyText="No products added yet"
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
				data={products}
			/>
		</div>
	)
}

export function SalesStats() {
	const totalRevenue = 130
	const last24 = 10
	const mrr = 100

	const stats = [
		{ title: "Total Revenue", value: `$${totalRevenue}` },
		{ title: "Last 24h", value: `$${last24}` },
		{ title: "MRR", value: `$${mrr}` },
	]

	return <Stats stats={stats} />
}

export function Stats({ stats }: { stats: StatData[] }) {
	return (
		<div className="grid lg:grid-cols-3 md-grid-cols-2 gap-x-2 gap-y-2">
			{stats.map((stat) => (
				<StatBlock key={stat.title} title={stat.title} value={stat.value} />
			))}
		</div>
	)
}

type StatData = {
	title: string
	value: string
}

export function StatBlock({ title, value }: StatData) {
	return (
		<div className="bg-white rounded-lg p-4">
			<p className="text-gray-500 text-sm pb-2">{title}</p>
			<p className="text-2xl font-bold">{value}</p>
		</div>
	)
}

function ProductsTab() {
	return <div></div>
}

function MembershipsTab() {
	return <div></div>
}
