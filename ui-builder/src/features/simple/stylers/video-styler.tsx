import { useSetWithElement } from '../../elements/elements-store'
import { VideoElement } from '../../elements/extensions/video'
import { BordersEditor } from '../../style/border-editor'
import { SizeEditor } from '../../style/size-editor'
import { SpacingEditor } from '../../style/spacing-editor'
import { VideoDrop } from '../../ui/video-drop'
import { Styler } from './styler'

export function VideoStyler({ element }: { element: VideoElement }) {
	const set = useSetWithElement(element)

	return (
		<VideoDrop
			src={element.data.src.toString()}
			onChange={(value) => set((draft) => (draft.data.src = value))}
			rightSection={<StyleEditor element={element} />}
		/>
	)
}

function StyleEditor({ element }: { element: VideoElement }) {
	return (
		<Styler>
			<SizeEditor element={element} simple />
			<BordersEditor element={element} simple />
			<SpacingEditor element={element} />
		</Styler>
	)
}
