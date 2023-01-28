import { Button, NumberInput, Select, Textarea, TextInput } from "@mantine/core"
import { useState } from "react"
import { BsCurrencyDollar } from "react-icons/bs"
import { ContentWrapper, Header } from "../features/ui"
import { ImageDrop } from "../features/ui/image-drop"

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
		<div className="grid grid-cols-3 gap-20">
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
				<NumberInput
					label="Price"
					placeholder="Price"
					name="price"
					rightSection={<BsCurrencyDollar />}
				/>
			</form>
			<div className="space-y-8">
				<ImageDrop label="Cover image" src="" onChange={(src) => console.log(src)} />
				<ImageDrop label="Thumbnail" src="" onChange={(src) => console.log(src)} />
			</div>
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
