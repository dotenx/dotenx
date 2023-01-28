import { ActionIcon } from "@mantine/core"
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
import { useQuery, useQueryClient } from "react-query"
import { getLast24HoursSales, QueryKey } from "../api"
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
			<ContentWrapper>{activeTab === "all" && <AllTabs />}</ContentWrapper>
		</div>
	)
}

function AllTabs() {
	const queryClient = useQueryClient()
	const [currentPage, setCurrentPage] = useState(1)
	const projectQuery = useGetProjectTag()
	const projectTag = projectQuery.projectTag
	const salesQuery = useQuery(
		[QueryKey.GetLastDaySales, projectTag, currentPage],
		() => getLast24HoursSales(projectTag, currentPage),
		{ enabled: !!projectTag }
	)
	const sales = salesQuery.data?.data?.rows ?? []
	const nPages = Math.ceil((salesQuery.data?.data?.totalRows as number) / 10)
	const refetchSales = () => queryClient.invalidateQueries(QueryKey.GetLastDaySales)

	return (
		<div>
			<CurrentMonthSalesChart />
			<Table
				withPagination
				currentPage={currentPage}
				nPages={nPages}
				setCurrentPage={setCurrentPage}
				loading={projectQuery.isLoading || salesQuery.isLoading}
				emptyText="No sales recorded yet"
				actionBar={
					<ActionIcon onClick={refetchSales}>
						<IoReload />
					</ActionIcon>
				}
				columns={[
					{
						Header: "Time",
						accessor: "time",
					},
					{
						Header: "Amount",
						accessor: "total",
					},
					{
						Header: "Customer",
						accessor: "email",
					},
				]}
				data={sales}
			/>
		</div>
	)
}

function CurrentMonthSalesChart() {
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

	// days of the current month from 1 to the last day of the month. The last day of the month depends on the current month.
	const labels = _.range(1, getDaysInMonth(new Date()) + 1)

	const data = {
		labels,
		datasets: [
			{
				label: "Daily Sales",
				data: labels.map(() => Math.floor(Math.random() * 100)),
				backgroundColor: "#8d99ae",
			},
		],
	}

	ChartJS.defaults.font.family = "Inter"
	ChartJS.defaults.color = "#2b2d42"

	return <Bar options={options} data={data} className="max-h-80" />
}
