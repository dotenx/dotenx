import { Button } from "@mantine/core"
import CodeEditor from "@uiw/react-textarea-code-editor"
import { useEffect, useState } from "react"
import { IoArrowBack } from "react-icons/io5"

interface CodeFieldProps {
	defaultValue?: string
	onBack: () => void
	submitText?: string
	onSubmit: (code: string) => void
	language: string
}

export function CodeField({
	onBack,
	onSubmit,
	submitText = "add",
	defaultValue = "",
	language,
}: CodeFieldProps) {
	const [code, setCode] = useState(defaultValue)

	useEffect(() => setCode(defaultValue), [defaultValue])

	return (
		<div className="flex flex-col h-full gap-6">
			<BackButton onClick={onBack} />
			<CodeEditor
				value={code}
				language={language}
				placeholder="..."
				onChange={(event) => setCode(event.target.value)}
				style={{ fontFamily: "monospace", flexGrow: 1, overflowY: "auto" }}
				className="rounded-md"
			/>
			<Button type="button" onClick={() => onSubmit(code)}>
				{submitText}
			</Button>
		</div>
	)
}

function BackButton({ onClick }: { onClick: () => void }) {
	return (
		<button type="button" className="max-w-min" onClick={onClick}>
			<IoArrowBack />
		</button>
	)
}
