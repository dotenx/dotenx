import { Button } from "@mantine/core"
import {
	BarElement,
	CategoryScale,
	Chart as ChartJS,
	Legend,
	LinearScale,
	LineElement,
	PointElement,
	Title,
	Tooltip,
} from "chart.js"
import { useState } from "react"
import { Bar, Line } from "react-chartjs-2"
import { useQuery, useQueryClient } from "react-query"
import { Navigate, useParams } from "react-router-dom"
import { getLast24HoursSales, getProject, QueryKey } from "../api"
import { Modals, useModal } from "../features/hooks"
import { ContentWrapper, Header } from "../features/ui"

ChartJS.register(
	CategoryScale,
	LinearScale,
	LineElement,
	PointElement,
	BarElement,
	Title,
	Tooltip,
	Legend
)

export default function AnalyticsPage() {
	const { projectName } = useParams()
	if (!projectName) return <Navigate to="/" replace />
	return <UMTableContent projectName={projectName} />
}

function UMTableContent({ projectName }: { projectName: string }) {
	const [currentPage, setCurrentPage] = useState(1)
	const [activeTab, setActiveTab] = useState<"sales" | "audience">("sales")

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
				tabs={["sales", "audience"]}
				headerLink={`/builder/projects/${projectName}/user-management`}
				title={"Analytics"}
				activeTab={activeTab}
				onTabChange={(v: typeof activeTab) => {
					setActiveTab(v)
				}}
			>
				<ActionBar />
			</Header>
			<ContentWrapper>
				{activeTab === "sales" && <SalesTab />}
				{activeTab === "audience" && <AudienceTab projectTag={projectTag} />}
			</ContentWrapper>
		</div>
	)
}

function ActionBar() {
	const modal = useModal()

	return (
		<div className="flex flex-wrap gap-2">
			<Button className="endpoints" onClick={() => modal.open(Modals.UserManagementEndpoint)}>
				Add New Product
			</Button>
		</div>
	)
}

//#region sales

function SalesTab() {
	return (
		<div className="flex flex-col">
			<div className="my-10">
				<Stats />
			</div>
			<SalesChart mode="daily" />
			<div className="my-10">
				<BestStats />
			</div>
		</div>
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

function SalesChart({ mode }: { mode: "daily" | "monthly" }) {
	const options = {
		responsive: true,
		plugins: {
			legend: {
				display: false,
			},
			title: {
				display: true,
				text: `${mode === "daily" ? "Daily" : "Monthly"} Sales`,
			},
		},
		scales: {
			x: {
				stacked: true,
				grid: {
					display: false,
				},
			},
			y: {
				stacked: true,
				grid: {
					display: false,
				},
			},
		},
	}

	const labels = Array.from(
		{ length: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate() },
		(_, i) => i + 1
	)

	const data = {
		labels,
		datasets: [
			{
				label: `${mode === "daily" ? "Daily" : "Monthly"} One-off sales`,
				data: labels.map(() => Math.floor(Math.random() * 100)),
				backgroundColor: "#8d99ae",
			},
			{
				label: `${mode === "daily" ? "Daily" : "Monthly"} Membership Sales`,
				data: labels.map(() => Math.floor(Math.random() * 100)),
				backgroundColor: "#ef233c",
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

function BestStats() {
	const bestSeller = "Blue T-Shirt"
	const bestSellerTotalRevenue = "100"
	const bestDay = "Monday"
	const bestDayAverageRevenue = "48090"
	const mostPopularProduct = "Red T-Shirt"
	const mostPopularProductSold = "500"
	const highestRatedProduct = "Blue T-Shirt"
	const highestRatedProductRating = "4.5"
	const currency = "$"

	return (
		<div className="grid lg:grid-cols-2 md-grid-cols-1 gap-x-2 gap-y-8">
			<div className="bg-white rounded-lg border-solid border-2 border-gray-600 grid grid-cols-2">
				<div className="p-4 flex flex-col">
					<p className="text-gray-500 text-sm pb-2">Best Day of the Week</p>
					<p className="text-2xl font-bold my-auto">{bestDay}</p>
				</div>
				<div className="p-4 bg-black text-white flex flex-col">
					<p className="text-6xl font-bold">
						{currency}
						{bestDayAverageRevenue}
					</p>
					<p className="text-gray-300 text-sm pb-2 my-auto">Average Revenue</p>
				</div>
			</div>
			<div className="bg-white rounded-lg border-solid border-2 border-gray-600 grid grid-cols-2">
				<div className="p-4 flex flex-col">
					<p className="text-gray-500 text-sm pb-2">Best Seller</p>
					<p className="text-2xl font-bold my-auto">{bestSeller}</p>
				</div>
				<div className="p-4 bg-black text-white flex flex-col">
					<p className="text-6xl font-bold">
						{currency}
						{bestSellerTotalRevenue}
					</p>
					<p className="text-gray-300 text-sm pb-2 my-auto">Total Revenue</p>
				</div>
			</div>
			<div className="bg-white rounded-lg border-solid border-2 border-gray-600 grid grid-cols-2">
				<div className="p-4 flex flex-col">
					<p className="text-gray-500 text-sm pb-2">Most Popular Product</p>
					<p className="text-2xl font-bold my-auto">{mostPopularProduct}</p>
				</div>
				<div className="p-4 bg-black text-white flex flex-col">
					<p className="text-6xl font-bold">{mostPopularProductSold}</p>
					<p className="text-gray-300 text-sm pb-2 my-auto">Units Sold</p>
				</div>
			</div>
			<div className="bg-white rounded-lg border-solid border-2 border-gray-600 grid grid-cols-2">
				<div className="p-4 flex flex-col">
					<p className="text-gray-500 text-sm pb-2">Highest Rated Product</p>
					<p className="text-2xl font-bold my-auto">{highestRatedProduct}</p>
				</div>
				<div className="p-4 bg-black text-white flex flex-col">
					<p className="text-6xl font-bold">{highestRatedProductRating}</p>
					<p className="text-gray-300 text-sm pb-2 my-auto">Average Rating</p>
				</div>
			</div>
		</div>
	)
}

//#endregion

//#region audience

function AudienceTab({ projectTag }: { projectTag: string }) {
	return (
		<div className="flex flex-col">
			<div className="my-10">
				<AudienceStats />
			</div>
			<AudienceChart mode="daily" />
			<div className="my-10">
				<ReferrerChart mode="daily" />
			</div>
		</div>
	)
}

export function AudienceStats() {
	const totalUsers = 1900
	const last24 = 4

	return (
		<div className="grid lg:grid-cols-3 md-grid-cols-2 gap-x-2 gap-y-2">
			<StatBlock title="Total Members" value={`${totalUsers}`} defaultValue="0" />
			<StatBlock title="New Members (24h)" value={`${last24}`} defaultValue="0" />
		</div>
	)
}

function AudienceChart({ mode }: { mode: "daily" | "monthly" }) {
	const options = {
		responsive: true,
		plugins: {
			legend: {
				display: false,
			},
			title: {
				display: true,
				text: `${mode === "daily" ? "Daily" : "Monthly"} New Members`,
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

	const labels = Array.from(
		{ length: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate() },
		(_, i) => i + 1
	)

	const data = {
		labels,
		datasets: [
			{
				label: `${mode === "daily" ? "Daily" : "Monthly"} New Members`,
				data: labels.map(() => Math.floor(Math.random() * 100)),
				backgroundColor: "#2b2d42",
			},
		],
	}

	ChartJS.defaults.font.family = "Inter"
	ChartJS.defaults.color = "#2b2d42"

	return (
		<div className="">
			<Line options={options} data={data} className="max-h-80" />
		</div>
	)
}

function ReferrerChart({ mode }: { mode: "daily" | "monthly" }) {
	const options = {
		responsive: true,
		indexAxis: "y" as const,
		plugins: {
			legend: {
				display: false,
			},
			title: {
				display: true,
				text: `Referrers`,
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

	const labels = [
		"https://t.co",
		"https://google.com",
		"https://facebook.com",
		"https://reddit.com",
		"https://youtube.com",
	]

	const data = {
		labels,
		datasets: [
			{
				label: `${mode === "daily" ? "Daily" : "Monthly"} One-off sales`,
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

//#endregion
