import { ReactNode, useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"

export function Header({
	title,
	subtitle,
	children,
	tabs,
	activeTab,
	onTabChange,
	headerLink,
}: {
	title: JSX.Element | string
	subtitle?: JSX.Element | string
	children?: JSX.Element | ReactNode
	tabs?: string[]
	activeTab?: string
	onTabChange?: (value: string) => void
	headerLink?: string
}) {
	const navigate = useNavigate()
	const smallScreen = window.innerHeight < 750
	const [searchParams] = useSearchParams()
	searchParams.get("tab")
	const urlActiveTab = tabs?.includes(searchParams.get("tab") ?? "")
		? searchParams.get("tab")
		: undefined
	useEffect(() => {
		if (urlActiveTab) onTabChange?.(urlActiveTab)
	}, [onTabChange, urlActiveTab])

	return (
		<div className={` w-full bg-white shadow-sm`}>
			<div className="flex items-center justify-between pl-10 p-6">
				<div className="min-h-10  ">
					<div
						onClick={() => {
							if (headerLink) navigate(headerLink)
						}}
						className={`${headerLink && "cursor-pointer"} ${
							smallScreen ? "text-3xl" : "text-4xl"
						} `}
					>
						{title}
					</div>
					<div className="text-xs text-gray-500">{subtitle}</div>
				</div>
				<div className="flex gap-x-5">{children}</div>
			</div>
			<div className="flex pl-10 gap-x-10 ">
				{tabs?.map((tab) => {
					const active = tab === activeTab
					return (
						<span
							onClick={() => onTabChange?.(tab)}
							key={tab}
							className={`transition-all duration-200 uppercase pb-1  font-medium cursor-pointer  ${
								active
									? "text-black border-b-4 border-b-rose-600 "
									: "text-gray-400 border-b-4 border-transparent hover:border-gray-400"
							} ${smallScreen ? "text-sm" : "text-lg"}`}
						>
							{tab}
						</span>
					)
				})}
			</div>
		</div>
	)
}
export function ContentWrapper({ children }: { children: ReactNode }) {
	return (
		<div className={` w-full pb-10`}>
			<div className="px-10 pt-5">{children}</div>
		</div>
	)
}
