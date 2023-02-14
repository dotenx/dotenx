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
import { ContentWrapper, Header } from "../features/ui"
import { useGetProjectTag } from "../features/ui/hooks/use-get-project-tag"
import { SalesStats, Stats } from "./products"
import { monthDays } from "./sales"

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

export function AnalyticsPage() {
	const [activeTab, setActiveTab] = useState<"sales" | "audience">("sales")

	return (
		<div>
			<Header
				tabs={["sales", "audience"]}
				title="Analytics"
				activeTab={activeTab}
				onTabChange={setActiveTab}
			/>
			<ContentWrapper>
				{activeTab === "sales" && <SalesTab />}
				{activeTab === "audience" && <AudienceTab />}
			</ContentWrapper>
		</div>
	)
}

//#region sales

function SalesTab() {
	const projectQuery = useGetProjectTag()
	const projectTag = projectQuery.projectTag
	return (
		<div className="gap-10 flex flex-col">
			<SalesStats projectTag={projectTag} />
			<SalesChart mode="daily" />
			<BestStats />
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

	const labels = monthDays()

	const data = {
		labels,
		datasets: [
			{
				label: `${mode === "daily" ? "Daily" : "Monthly"} One-off sales`,
				data: labels.map(() => Math.floor(Math.random() * 100)),
				backgroundColor: "#9ca3af",
			},
			{
				label: `${mode === "daily" ? "Daily" : "Monthly"} Membership Sales`,
				data: labels.map(() => Math.floor(Math.random() * 100)),
				backgroundColor: "#f43f5e",
			},
		],
	}

	ChartJS.defaults.font.family = "Inter"
	ChartJS.defaults.color = "#2b2d42"

	return <Bar options={options} data={data} className="max-h-80" />
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
			<BestStat
				title="Best Day of the Week"
				value={bestDay}
				rightTitle="Average Revenue"
				rightValue={`${currency}${bestDayAverageRevenue}`}
			/>
			<BestStat
				title="Best Seller"
				value={bestSeller}
				rightTitle="Total Revenue"
				rightValue={`${currency}${bestSellerTotalRevenue}`}
			/>
			<BestStat
				title="Most Popular Product"
				value={mostPopularProduct}
				rightTitle="Units Sold"
				rightValue={mostPopularProductSold}
			/>
			<BestStat
				title="Highest Rated Product"
				value={highestRatedProduct}
				rightTitle="Average Rating"
				rightValue={highestRatedProductRating}
			/>
		</div>
	)
}

function BestStat({
	title,
	value,
	rightTitle,
	rightValue,
}: {
	title: string
	value: string
	rightTitle: string
	rightValue: string
}) {
	return (
		<div className="bg-white rounded-lg grid grid-cols-2">
			<div className="p-4 flex flex-col">
				<p className="text-gray-500 text-sm pb-2">{title}</p>
				<p className="text-2xl font-bold my-auto">{value}</p>
			</div>
			<div className="p-4 bg-black rounded-r-lg text-white flex flex-col">
				<p className="text-6xl font-bold">{rightValue}</p>
				<p className="text-gray-300 text-sm pb-2 my-auto">{rightTitle}</p>
			</div>
		</div>
	)
}

//#endregion

//#region audience

function AudienceTab() {
	const totalUsers = 1900
	const last24 = 4

	const stats = [
		{ title: "Total Members", value: totalUsers, isLoading: false },
		{ title: "New Members (24h)", value: last24, isLoading: false },
	]

	return (
		<div className="gap-10 flex flex-col">
			<AudienceStats stats={stats} />
			<AudienceChart mode="daily" />
			<ReferrerChart mode="daily" />
		</div>
	)
}

export function AudienceStats({
	stats,
}: {
	stats: { title: string; value: number; isLoading: boolean }[]
}) {
	return <Stats stats={stats} />
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

	const labels = monthDays()

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

	return <Line options={options} data={data} className="max-h-80" />
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

	return <Bar options={options} data={data} className="max-h-80" />
}

//#endregion
