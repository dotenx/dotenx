import { ReactNode } from "react"
import ReactSlidingPane from "react-sliding-pane"
import "react-sliding-pane/dist/react-sliding-pane.css"
import { SlidingPanes, useSlidingPane } from "../hooks/use-sliding-pane"

type RenderChildren = (data: unknown) => ReactNode

interface SlidingPaneProps {
	kind: SlidingPanes
	title?: string
	subTitle?: string
	children: ReactNode | RenderChildren
	from?: "left" | "right" | "bottom"
	width?: string
	hideHeader?: boolean
}

export function SlidingPane({
	title,
	subTitle,
	kind,
	children,
	width,
	from,
	hideHeader,
}: SlidingPaneProps) {
	const slidingPane = useSlidingPane()
	return (
		<ReactSlidingPane
			className=""
			overlayClassName="z-10"
			title={title}
			subtitle={subTitle ?? ""}
			from={from ?? "right"}
			width={width ?? "400px"}
			isOpen={slidingPane.isOpen && kind === slidingPane.kind}
			onRequestClose={slidingPane.close}
			hideHeader={hideHeader}
		>
			{children as any}
		</ReactSlidingPane>
	)
}
