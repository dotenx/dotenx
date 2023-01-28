import { Button } from "@mantine/core"
import { useState } from "react"
import { IoReload } from "react-icons/io5"
import { useQuery, useQueryClient } from "react-query"
import { Navigate, useParams } from "react-router-dom"
import { getLast24HoursSales, getProject, QueryKey } from "../api"
import { Modals, useModal } from "../features/hooks"
import { ContentWrapper, Header, Table } from "../features/ui"

import {
	BarElement,
	CategoryScale,
	Chart as ChartJS,
	Legend,
	LinearScale,
	Title,
	Tooltip,
} from "chart.js"
import { Bar } from "react-chartjs-2"

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

export default function SalesPage() {
	const { projectName } = useParams()
	if (!projectName) return <Navigate to="/" replace />
	return <UMTableContent projectName={projectName} />
}

function UMTableContent({ projectName }: { projectName: string }) {
	const [currentPage, setCurrentPage] = useState(1)
	const [activeTab, setActiveTab] = useState<"all" | "products" | "memberships">("all")

	const { data: projectDetails, isLoading: projectDetailsLoading } = useQuery(
		QueryKey.GetProject,
		() => getProject(projectName)
	)
	const projectTag = projectDetails?.data.tag ?? ""
	const { data: usersData, isLoading: usersDataLoading } = useQuery(
		[QueryKey.GetLast24HoursSales, projectTag, currentPage],
		() => getLast24HoursSales(projectTag, currentPage),
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
				title={"Sales"}
				activeTab={activeTab}
				onTabChange={(v: typeof activeTab) => {
					setActiveTab(v)
				}}
			>
				<ActionBar />
			</Header>
			<ContentWrapper>
				{activeTab === "all" && (
					<div className="flex flex-col">
						<CurrentMonthSalesChart />
						<Table
							withPagination
							currentPage={currentPage}
							nPages={nPages}
							setCurrentPage={setCurrentPage}
							loading={projectDetailsLoading || usersDataLoading}
							emptyText="No sales recorded yet"
							actionBar={
								<Button
									leftIcon={<IoReload />}
									type="button"
									onClick={() =>
										queryClient.invalidateQueries(QueryKey.GetLast24HoursSales)
									}
								>
									Refresh
								</Button>
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
							data={tableData}
						/>
					</div>
				)}
			</ContentWrapper>
		</div>
	)
}

function ActionBar() {
	const modal = useModal()

	return (
		<Button className="endpoints" onClick={() => modal.open(Modals.UserManagementEndpoint)}>
			Add New Product
		</Button>
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
	const labels = Array.from(
		{ length: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate() },
		(_, i) => i + 1
	)

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

	return (
		<div className="">
			<Bar options={options} data={data} className="max-h-80" />
		</div>
	)
}
