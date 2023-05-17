import { Popover, Text, Button, ActionIcon, Stack, Box, AspectRatio } from "@mantine/core"
import { TbFileSymlink, TbHelp } from "react-icons/tb"

export interface HelpDetails {
	title: string
	description: string
	tutorialUrl?: string
	videoUrl?: string
}

export function HelpPopover({ helpDetails }: { helpDetails: HelpDetails }) {
	helpDetails.videoUrl = "" // TODO: Remove this line when the video is ready
	return (
		<Popover position="bottom" withArrow shadow="md">
			<Popover.Target>
				<ActionIcon variant="transparent">
					<TbHelp className="text-red-600" size={16} />
				</ActionIcon>
			</Popover.Target>
			<Popover.Dropdown>
				<Stack
					sx={{
						width: "500px",
					}}
				>
					{/* Title bar */}
					<div
						className={
							helpDetails.videoUrl
								? "flex justify-between"
								: "flex justify-between border-b-2 border-dashed rounded border-rose-400 pb-3"
						}
					>
						<Text>{helpDetails.title}</Text>
						<Button
							component="a"
							target="_blank"
							rel="noopener noreferrer"
							href={helpDetails.tutorialUrl}
							leftIcon={<TbFileSymlink size={16} />}
							styles={(theme) => ({
								root: {
									backgroundColor: theme.colors.rose[1],
									color: theme.colors.rose[9],
									border: 0,
									height: 42,
									paddingLeft: 20,
									paddingRight: 20,

									"&:hover": {
										backgroundColor: theme.colors.rose[9],
										color: "white",
									},
								},

								leftIcon: {
									marginRight: 15,
								},
							})}
						>
							Open tutorial
						</Button>
					</div>
					{/* Video */}
					{helpDetails.videoUrl ? (
						<Box
							sx={{
								width: "100%",
							}}
						>
							<AspectRatio ratio={16 / 9}>
								<iframe
									width="100%"
									height="auto"
									src={helpDetails.videoUrl}
									frameBorder="0"
									allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
									allowFullScreen
								></iframe>
							</AspectRatio>
						</Box>
					) : null}
					{/* Description */}
					<Text className={helpDetails.videoUrl ? "" : "border-t-1 border-black pt-3"}>
						{helpDetails.description}
					</Text>
				</Stack>
			</Popover.Dropdown>
		</Popover>
	)
}
