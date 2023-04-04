import { Link, RichTextEditor } from '@mantine/tiptap'
import { Color } from '@tiptap/extension-color'
import TextStyle from '@tiptap/extension-text-style'

import { Button } from '@mantine/core'
import { closeAllModals } from '@mantine/modals'
import Highlight from '@tiptap/extension-highlight'
import SubScript from '@tiptap/extension-subscript'
import Superscript from '@tiptap/extension-superscript'
import TextAlign from '@tiptap/extension-text-align'
import Underline from '@tiptap/extension-underline'
import { useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useAtomValue } from 'jotai'
import { selectedPaletteAtom } from '../simple/palette'

export function TextEditor({
	onSave,
	content,
}: {
	onSave: (html: string) => void
	content: string
}) {
	const editor = useEditor({
		extensions: [
			StarterKit,
			Underline,
			Link,
			Superscript,
			SubScript,
			Highlight,
			TextStyle,
			Color,
			TextAlign.configure({ types: ['heading', 'paragraph'] }),
		],
		content,
	})
	const selectedPalette = useAtomValue(selectedPaletteAtom)

	return (
		<div>
			<RichTextEditor editor={editor}>
				<RichTextEditor.Toolbar sticky stickyOffset={60}>
					<RichTextEditor.ControlsGroup>
						<RichTextEditor.Bold />
						<RichTextEditor.Italic />
						<RichTextEditor.Underline />
						<RichTextEditor.Strikethrough />
						<RichTextEditor.ClearFormatting />
						<RichTextEditor.Highlight />
						<RichTextEditor.ColorPicker colors={selectedPalette.colors} />
						<RichTextEditor.Code />
					</RichTextEditor.ControlsGroup>

					<RichTextEditor.ControlsGroup>
						<RichTextEditor.H1 />
						<RichTextEditor.H2 />
						<RichTextEditor.H3 />
						<RichTextEditor.H4 />
					</RichTextEditor.ControlsGroup>

					<RichTextEditor.ControlsGroup>
						<RichTextEditor.Blockquote />
						<RichTextEditor.Hr />
						<RichTextEditor.BulletList />
						<RichTextEditor.OrderedList />
						<RichTextEditor.Subscript />
						<RichTextEditor.Superscript />
					</RichTextEditor.ControlsGroup>

					<RichTextEditor.ControlsGroup>
						<RichTextEditor.Link />
						<RichTextEditor.Unlink />
					</RichTextEditor.ControlsGroup>

					<RichTextEditor.ControlsGroup>
						<RichTextEditor.AlignLeft />
						<RichTextEditor.AlignCenter />
						<RichTextEditor.AlignJustify />
						<RichTextEditor.AlignRight />
					</RichTextEditor.ControlsGroup>
				</RichTextEditor.Toolbar>

				<RichTextEditor.Content />
			</RichTextEditor>

			<Button
			className="float-right mb-5"
				mt="xl"
				onClick={() => {
					onSave(editor?.getHTML() ?? '')
					closeAllModals()
				}}
			>
				Save
			</Button>
		</div>
	)
}
