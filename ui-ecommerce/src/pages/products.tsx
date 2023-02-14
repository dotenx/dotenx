import { Button } from "@mantine/core"
import { useQuery } from "react-query"
import { useState } from "react"
import { BsPlusLg } from "react-icons/bs"
import { Link, useParams } from "react-router-dom"
import { getColumns, getTableRecords, QueryKey, runCustomQuery } from "../api"
import { ContentWrapper, Header, Table } from "../features/ui"
import { useGetProjectTag } from "../features/ui/hooks/use-get-project-tag"
import _ from "lodash"

export function ProductsPage() {
	const [activeTab, setActiveTab] = useState<"all" | "products" | "memberships">("all")
	const { projectName = "" } = useParams()

	const columnsQuery = useQuery(QueryKey.GetColumns, () => getColumns(projectName, "products"))

	const columns = columnsQuery.data?.data.columns ?? []
	const headers = columns
		.map((column) => ({
			Header: column.name,
			accessor: column.name,
		}))
		.filter((d) => d.accessor !== "creator_id")

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
				{activeTab === "all" && <AllTab columns={headers} />}
				{activeTab === "products" && <ProductsTab columns={headers} />}
				{activeTab === "memberships" && <MembershipsTab columns={headers} />}
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
			New product
		</Button>
	)
}

function AllTab({ columns }: { columns: { Header: string; accessor: string }[] }) {
	const [currentPage, setCurrentPage] = useState(1)

	const projectQuery = useGetProjectTag()
	const projectTag = projectQuery.projectTag
	const recordsQuery = useQuery(
		[QueryKey.GetTableRecords, projectTag, "products", { columns: [] }, currentPage],
		() => getTableRecords(projectTag, "products", currentPage, { columns: [] }),
		{ enabled: !!projectTag }
	)
	const products = (recordsQuery.data?.data?.rows || []).map((record) =>
		_.fromPairs(
			_.toPairs(record).map(([key, value]) =>
				typeof value === "boolean"
					? [key, value ? "Yes" : "No"]
					: _.isArray(value)
					? [key, value.join(", ")]
					: typeof value === "object"
					? [key, JSON.stringify(value)]
					: [key, value]
			)
		)
	)
	const nPages = Math.ceil((recordsQuery?.data?.data?.totalRows ?? 0) / 10)

	return (
		<div>
			<SalesStats projectTag={projectTag} />
			<Table
				withPagination
				currentPage={currentPage}
				nPages={nPages}
				setCurrentPage={setCurrentPage}
				loading={projectQuery.isLoading || recordsQuery.isLoading}
				emptyText="No products added yet"
				columns={columns}
				data={products}
			/>
		</div>
	)
}

export function SalesStats({ projectTag = "" }: { projectTag?: string }) {
	const totalRevenueQuery = useQuery(
		["get-total-revenue", projectTag],
		() =>
			runCustomQuery(
				projectTag,
				"select sum(paid_amount) as total_revenue from orders where payment_status='succeeded';"
			),
		{ enabled: !!projectTag }
	)

	const yesterday = ((d) => new Date(d.setDate(d.getDate() - 1)).toISOString())(new Date())
	const lastMonth = ((d) => new Date(d.setMonth(d.getMonth() - 1)).toISOString())(new Date())
	const lastDayRevQuery = useQuery(
		["get-last-day-revenue", projectTag],
		() =>
			runCustomQuery(
				projectTag,
				`select sum(paid_amount) as total_revenue from orders where payment_status='succeeded' and updated_at >= '${yesterday}';`
			),
		{ enabled: !!projectTag }
	)
	const mrrQuery = useQuery(
		["get-mrr", projectTag],
		() =>
			runCustomQuery(
				projectTag,
				`select sum(paid_amount) as mrr from orders join products on orders.__products = products.id where payment_status='succeeded' and updated_at >= '${lastMonth}' and products.type = 'membership';`
			),
		{ enabled: !!projectTag }
	)
	const totalRevenue = totalRevenueQuery?.data?.data.rows[0].total_revenue
	const last24 = lastDayRevQuery?.data?.data.rows[0].total_revenue
	const mrr = mrrQuery?.data?.data.rows[0].mrr
	const stats = [
		{
			title: "Total Revenue",
			value: `$${totalRevenue}`,
			isLoading: totalRevenueQuery.isLoading || !projectTag,
		},
		{
			title: "Last 24h",
			value: `$${last24}`,
			isLoading: lastDayRevQuery.isLoading || !projectTag,
		},
		{ title: "MRR", value: `$${mrr}`, isLoading: mrrQuery.isLoading || !projectTag },
	]

	return <Stats stats={stats} />
}

export function Stats({ stats }: { stats: StatData[] }) {
	return (
		<div className="grid lg:grid-cols-3 md-grid-cols-2 gap-x-5 gap-y-2">
			{stats.map((stat) => (
				<StatBlock
					key={stat.title}
					title={stat.title}
					value={stat.value}
					isLoading={stat.isLoading}
				/>
			))}
		</div>
	)
}

type StatData = {
	title: string
	value: string | number
	isLoading?: boolean
}

export function StatBlock({ title, value, isLoading }: StatData) {
	return (
		<div className={`bg-white rounded-lg p-4 ${isLoading && "animate-pulse"}`}>
			<p className="text-gray-500 text-sm pb-2">{title}</p>
			<p className="text-2xl font-bold">
				{!isLoading &&
					(!["$undefined", "$null"].includes(_.toString(value)) ? value : "N/A")}
			</p>
		</div>
	)
}

function ProductsTab({ columns }: { columns: { Header: string; accessor: string }[] }) {
	const [currentPage, setCurrentPage] = useState(1)

	const projectQuery = useGetProjectTag()
	const projectTag = projectQuery.projectTag
	const recordsQuery = useQuery(
		[QueryKey.GetProductsOnlyRecords, projectTag, "products", currentPage],
		() =>
			getTableRecords(projectTag, "products", currentPage, {
				columns: [],
				filters: { filterSet: [{ key: "type", operator: "!=", value: "membership" }] },
			}),
		{ enabled: !!projectTag }
	)
	const products = (recordsQuery.data?.data?.rows || []).map((record) =>
		_.fromPairs(
			_.toPairs(record).map(([key, value]) =>
				typeof value === "boolean"
					? [key, value ? "Yes" : "No"]
					: _.isArray(value)
					? [key, value.join(", ")]
					: typeof value === "object"
					? [key, JSON.stringify(value)]
					: [key, value]
			)
		)
	)
	const nPages = Math.ceil((recordsQuery?.data?.data?.totalRows ?? 0) / 10)
	return (
		<div>
			<Table
				withPagination
				currentPage={currentPage}
				nPages={nPages}
				setCurrentPage={setCurrentPage}
				loading={projectQuery.isLoading || recordsQuery.isLoading}
				emptyText="No products added yet"
				columns={columns}
				data={products}
			/>
		</div>
	)
}

function MembershipsTab({ columns }: { columns: { Header: string; accessor: string }[] }) {
	const [currentPage, setCurrentPage] = useState(1)

	const projectQuery = useGetProjectTag()
	const projectTag = projectQuery.projectTag
	const recordsQuery = useQuery(
		[QueryKey.GetMembershipOnlyRecords, projectTag, "products", currentPage],
		() =>
			getTableRecords(projectTag, "products", currentPage, {
				columns: [],
				filters: { filterSet: [{ key: "type", operator: "=", value: "membership" }] },
			}),
		{ enabled: !!projectTag }
	)
	const products = (recordsQuery.data?.data?.rows || []).map((record) =>
		_.fromPairs(
			_.toPairs(record).map(([key, value]) =>
				typeof value === "boolean"
					? [key, value ? "Yes" : "No"]
					: _.isArray(value)
					? [key, value.join(", ")]
					: typeof value === "object"
					? [key, JSON.stringify(value)]
					: [key, value]
			)
		)
	)
	const nPages = Math.ceil((recordsQuery?.data?.data?.totalRows ?? 0) / 10)
	return (
		<div>
			<Table
				withPagination
				currentPage={currentPage}
				nPages={nPages}
				setCurrentPage={setCurrentPage}
				loading={projectQuery.isLoading || recordsQuery.isLoading}
				emptyText="No products added yet"
				columns={columns}
				data={products}
			/>
		</div>
	)
}
