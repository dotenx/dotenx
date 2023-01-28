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
				<TextInput label="Product name" placeholder="Name" name="product name" />
				<Select
					data={["one-time", "membership"]}
					label="Product type"
					placeholder="Type"
					name="product type"
				/>
				<Textarea
					label="Long description"
					placeholder="Description"
					minRows={10}
					name="long description"
				/>
				<Textarea
					label="Short description"
					placeholder="Description"
					minRows={3}
					name="short description"
				/>
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
