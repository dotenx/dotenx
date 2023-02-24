import EditorJS, { OutputData } from "@editorjs/editorjs"
import { Button } from "@mantine/core"
import edjsHTML from "editorjs-html"
import { useEffect, useRef } from "react"
import { createEditor, EDITOR_ID } from "./config"

const edjsParser = edjsHTML()

export type EditorValue = { html: string; json?: OutputData }

export function Editor({ onSave }: { onSave: (value: EditorValue) => void }) {
	const editorRef = useRef<EditorJS | null>(null)

	useEffect(() => {
		if (editorRef.current) return
		editorRef.current = createEditor()
	}, [])

	const handleSave = async () => {
		const data = await editorRef.current?.save()
		const html = edjsParser.parse(data) as string[]
		onSave({
			html: html.join("\n"),
			json: data,
		})
	}

	return (
		<div className="bg-white rounded-md p-6 prose max-w-none">
			<div id={EDITOR_ID} />
			<div className="flex justify-end">
				<Button onClick={handleSave} px="xl">
					Next
				</Button>
			</div>
		</div>
	)
}
