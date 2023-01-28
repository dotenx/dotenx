import { Button, Select, Textarea, TextInput } from "@mantine/core"
import { useState } from "react"
import { ContentWrapper, Header } from "../features/ui"

export function NewProductPage() {
	const [activeTab, setActiveTab] = useState<"details" | "content">("details")

	return (
		<div>
			<Header
				tabs={["details", "content"]}
				title="New Product"
				activeTab={activeTab}
				onTabChange={setActiveTab}
			>
				<ActionBar />
			</Header>
			<ContentWrapper>{activeTab === "details" && <DetailsTab />}</ContentWrapper>
		</div>
	)
}

function DetailsTab() {
	return (
		<div className="grid grid-cols-3">
			<form className="flex flex-col w-full gap-8 col-span-2">
				<TextInput label="Product Name" placeholder="Name" />
				<Select
					data={["Subscription", "one-time"]}
					label="Product Type"
					placeholder="Type"
				/>
				<Textarea label="Long Description" placeholder="Description" minRows={10} />
				<Textarea label="Short Description" placeholder="Description" minRows={3} />
				{/* Todo: Add file upload for cover image */}
				{/* Todo: Add file upload for thumbnails */}
			</form>
			<div></div>
		</div>
	)
}

function ActionBar() {
	return (
		<div className="flex gap-2">
			<Button color="dark">Publish</Button>
			<Button>Save</Button>
		</div>
	)
}
