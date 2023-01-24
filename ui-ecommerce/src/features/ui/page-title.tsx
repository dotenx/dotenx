import { Title } from "@mantine/core"
import { HelpDetails, HelpPopover } from "./help-popover"

export function PageTitle({ title, helpDetails }: { title: string; helpDetails?: HelpDetails }) {
	return (
		<div className="flex justify-start">
			<Title order={2} sx={{ display: "inline-flex" }}>
				{title}
			</Title>
			{helpDetails && <HelpPopover helpDetails={helpDetails} />}
		</div>
	)
}
