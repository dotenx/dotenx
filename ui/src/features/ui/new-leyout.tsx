import { ReactNode } from "react"
import { useNavigate } from "react-router-dom"

export function Header({
	title,
	subtitle,
	children,
	tabs,
	activeTab,
	onTabChange,
	expand,
	headerLink,
}: {
	title: JSX.Element | string
	subtitle?: JSX.Element | string
	children?: JSX.Element | ReactNode
	tabs?: string[]
	activeTab?: string
	onTabChange?: any
	expand?: boolean
	headerLink?: string
}) {
	const navigate = useNavigate()

	return (
		<div className={` ${expand && "pl-[0]"} w-full bg-white shadow-sm`}>
			<div className="flex items-center justify-between p-10">
				<div className="h-10 ">
					<div
						onClick={() => {
							if (headerLink) navigate(headerLink)
						}}
						className={`${headerLink && "cursor-pointer"} text-3xl font-semibold `}
					>
						{title}
					</div>
					<div className="text-xs text-gray-500">{subtitle}</div>
				</div>
				<div className="flex gap-x-5">{children}</div>
			</div>
			<div className="flex h-8 pl-10 gap-x-10 ">
				{tabs?.map((tab) => {
					const active = tab === activeTab
					return (
						<span
							onClick={() => onTabChange(tab)}
							key={tab}
							className={`transition-all duration-200 uppercase pb-1 text-sm font-medium cursor-pointer  ${
								active
									? "text-black border-b-4 border-b-rose-600 "
									: "text-gray-400 border-b-4 border-transparent hover:border-gray-400"
							}`}
						>
							{tab}
						</span>
					)
				})}
			</div>
		</div>
	)
}
export function Content_Wrapper({ children, expand }: { children: ReactNode; expand?: boolean }) {
	return (
		<div className={`${expand && "pl-[0]"} w-full pb-10`}>
			<div className="px-10 pt-5">{children}</div>
		</div>
	)
}
