import { Button } from '@mantine/core'
import Editor from '@monaco-editor/react'
import { useRef } from 'react'

export function CustomCode({
	defaultValue,
	onSave,
	defaultLanguage,
}: {
	defaultValue: string
	onSave: (value: string) => void
	defaultLanguage: 'html' | 'javascript'
}) {
	const editorRef = useRef<any>(null)

	const handleEditorDidMount = (editor: any) => {
		editorRef.current = editor
	}

	const saveCode = () => {
		onSave(editorRef.current?.getValue?.())
	}

	return (
		<div>
			<Editor
				defaultValue={defaultValue}
				height="75vh"
				defaultLanguage={defaultLanguage}
				onMount={handleEditorDidMount}
			/>
			<Button onClick={saveCode}>Save</Button>
		</div>
	)
}
