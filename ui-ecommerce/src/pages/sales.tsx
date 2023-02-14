import { ActionIcon } from "@mantine/core"
import { useQuery } from "@tanstack/react-query"
import {
	BarElement,
	CategoryScale,
	Chart as ChartJS,
	Legend,
	LinearScale,
	Title,
	Tooltip,
} from "chart.js"
import { getDaysInMonth } from "date-fns"
import _ from "lodash"
import { useState } from "react"
import { Bar } from "react-chartjs-2"
import { IoReload } from "react-icons/io5"
import { useParams } from "react-router-dom"
import { getColumns, getTableRecords, QueryKey, runCustomQuery } from "../api"
import { ContentWrapper, Header, Table } from "../features/ui"
import { useGetProjectTag } from "../features/ui/hooks/use-get-project-tag"

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

export function SalesPage() {
	const [activeTab, setActiveTab] = useState<"all" | "products" | "memberships">("all")

	return (
		<div>
			<Header
				tabs={["all", "products", "memberships"]}
				title="Sales"
				activeTab={activeTab}
				onTabChange={setActiveTab}
			/>
			<ContentWrapper>
				{activeTab === "all" && <AllTab />}
				{activeTab === "products" && <ProductsTab />}
				{activeTab === "memberships" && <MembershipsTab />}
			</ContentWrapper>
		</div>
	)
}

function AllTab() {
	const [currentPage, setCurrentPage] = useState(1)
	const { projectName = "" } = useParams()

	const columnsQuery = useQuery([QueryKey.GetColumns, "orders"], () =>
		getColumns(projectName, "orders")
	)

	const columns = columnsQuery.data?.data.columns ?? []
	const productsHeaders = [
		{ Header: "products__description", accessor: "products__description" },
		{ Header: "products__name", accessor: "products__name" },
		{ Header: "products__price", accessor: "products__price" },
		{ Header: "products__status", accessor: "products__status" },
		{ Header: "products__type", accessor: "products__type" },
	]

	const ordersHeaders = columns
		.map((column) => ({
			Header: column.name,
			accessor: column.name,
		}))
		.filter((d) => d.accessor !== "creator_id")
	const headers = ordersHeaders.concat(productsHeaders)
	const projectQuery = useGetProjectTag()
	const projectTag = projectQuery.projectTag
	const recordsQuery = useQuery(
		["get-sales", projectTag, currentPage],
		() =>
			getTableRecords(projectTag, "orders", currentPage, {
				columns: [
					"id",
					"creator_id",
					"__products",
					"quantity",
					"address",
					"email",
					"payment_status",
					"updated_at",
					"products__name",
					"products__type",
					"products__description",
					"products__price",
					"products__status",
				],
			}),
		{ enabled: !!projectTag }
	)
	const sales = (recordsQuery.data?.data?.rows || []).map((record) =>
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
			<CurrentMonthSalesChart />
			<Table
				withPagination
				currentPage={currentPage}
				nPages={nPages}
				setCurrentPage={setCurrentPage}
				loading={projectQuery.isLoading || recordsQuery.isLoading}
				emptyText="No sales recorded yet"
				actionBar={
					<ActionIcon onClick={() => recordsQuery.refetch()}>
						<IoReload />
					</ActionIcon>
				}
				columns={headers}
				data={sales}
			/>
		</div>
	)
}

function CurrentMonthSalesChart() {
	const projectQuery = useGetProjectTag()
	const projectTag = projectQuery.projectTag
	const lastMonth = ((d) => new Date(d.setMonth(d.getMonth() - 1)).toISOString())(new Date())
	const currentMonthSalesQuery = useQuery(
		["get-total-revenue", projectTag],
		() =>
			runCustomQuery(
				projectTag,
				`select sum(paid_amount) as sale_amount, date(updated_at) 
					from orders 
					where updated_at >= '${lastMonth}' 
					group by date(updated_at);`
			),
		{ enabled: !!projectTag }
	)

	const currentMonthSales = currentMonthSalesQuery?.data?.data.rows
	if (currentMonthSalesQuery.isLoading || !currentMonthSales) return <></>

	const options = {
		responsive: true,
		plugins: {
			legend: {
				display: false,
			},
			title: {
				display: true,
				text: "Current Month Sales Amount",
			},
		},

		scales: {
			x: {
				grid: {
					display: false,
				},
			},
			y: {
				grid: {
					display: false,
				},
			},
		},
	}

	const labels = currentMonthSales?.map((s) => {
		return s?.date?.substring(0, 10)
	})

	const data = {
		labels,
		datasets: [
			{
				data: currentMonthSales?.map((s) => {
					return s.sale_amount
				}),
				backgroundColor: "#8d99ae",
			},
		],
	}

	ChartJS.defaults.font.family = "Inter"
	ChartJS.defaults.color = "#2b2d42"
	return <Bar options={options} data={data} className="max-h-80" />
}

export const monthDays = () => {
	// days of the current month from 1 to the last day of the month. The last day of the month depends on the current month.
	return _.range(1, getDaysInMonth(new Date()) + 1)
}

function ProductsTab() {
	const [currentPage, setCurrentPage] = useState(1)
	const { projectName = "" } = useParams()

	const columnsQuery = useQuery([QueryKey.GetColumns, "orders"], () =>
		getColumns(projectName, "orders")
	)

	const columns = columnsQuery.data?.data.columns ?? []
	const productsHeaders = [
		{ Header: "products__description", accessor: "products__description" },
		{ Header: "products__name", accessor: "products__name" },
		{ Header: "products__price", accessor: "products__price" },
		{ Header: "products__status", accessor: "products__status" },
		{ Header: "products__type", accessor: "products__type" },
	]

	const ordersHeaders = columns
		.map((column) => ({
			Header: column.name,
			accessor: column.name,
		}))
		.filter((d) => d.accessor !== "creator_id")
	const headers = ordersHeaders.concat(productsHeaders)
	const projectQuery = useGetProjectTag()
	const projectTag = projectQuery.projectTag
	const recordsQuery = useQuery(
		["get-porducts-sales", projectTag, currentPage],
		() =>
			getTableRecords(projectTag, "orders", currentPage, {
				columns: [
					"id",
					"creator_id",
					"__products",
					"quantity",
					"address",
					"email",
					"payment_status",
					"updated_at",
					"products__name",
					"products__type",
					"products__description",
					"products__price",
					"products__status",
				],
				filters: {
					filterSet: [{ key: "products__type", operator: "!=", value: "membership" }],
				},
			}),
		{ enabled: !!projectTag }
	)
	const sales = (recordsQuery.data?.data?.rows || []).map((record) =>
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
				emptyText="No sales recorded yet"
				actionBar={
					<ActionIcon onClick={() => recordsQuery.refetch()}>
						<IoReload />
					</ActionIcon>
				}
				columns={headers}
				data={sales}
			/>
		</div>
	)
}
function MembershipsTab() {
	const [currentPage, setCurrentPage] = useState(1)
	const { projectName = "" } = useParams()

	const columnsQuery = useQuery([QueryKey.GetColumns, "orders"], () =>
		getColumns(projectName, "orders")
	)

	const columns = columnsQuery.data?.data.columns ?? []
	const productsHeaders = [
		{ Header: "products__description", accessor: "products__description" },
		{ Header: "products__name", accessor: "products__name" },
		{ Header: "products__price", accessor: "products__price" },
		{ Header: "products__status", accessor: "products__status" },
		{ Header: "products__type", accessor: "products__type" },
	]

	const ordersHeaders = columns
		.map((column) => ({
			Header: column.name,
			accessor: column.name,
		}))
		.filter((d) => d.accessor !== "creator_id")
	const headers = ordersHeaders.concat(productsHeaders)
	const projectQuery = useGetProjectTag()
	const projectTag = projectQuery.projectTag
	const recordsQuery = useQuery(
		["get-memberships-sales", projectTag, currentPage],
		() =>
			getTableRecords(projectTag, "orders", currentPage, {
				columns: [
					"id",
					"creator_id",
					"__products",
					"quantity",
					"address",
					"email",
					"payment_status",
					"updated_at",
					"products__name",
					"products__type",
					"products__description",
					"products__price",
					"products__status",
				],
				filters: {
					filterSet: [{ key: "products__type", operator: "=", value: "membership" }],
				},
			}),
		{ enabled: !!projectTag }
	)
	const sales = (recordsQuery.data?.data?.rows || []).map((record) =>
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
				emptyText="No sales recorded yet"
				actionBar={
					<ActionIcon onClick={() => recordsQuery.refetch()}>
						<IoReload />
					</ActionIcon>
				}
				columns={headers}
				data={sales}
			/>
		</div>
	)
}
