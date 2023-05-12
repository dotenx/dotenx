import { TextInput } from '@mantine/core'
import _ from 'lodash'
import { useSetWithElement } from '../../elements/elements-store'
import { TextElement } from '../../elements/extensions/text'
import { YouTubeElement } from '../../elements/extensions/youtube'
import { Expression } from '../../states/expression'
import { BordersEditor } from '../../style/border-editor'
import { SizeEditor } from '../../style/size-editor'
import { SpacingEditor } from '../../style/spacing-editor'
import { TypographyEditor } from '../../style/typography-editor'
import { Styler } from './styler'

export function YoutubeStyler({ element }: { element: YouTubeElement }) {
	const set = useSetWithElement(element)

	return (
		<TextInput
			size="xs"
			label="src"
			name={'src'}
			value={element.data.src}
			onChange={(event) => {
				set((draft) => {
					draft.data.src = event.target.value
				})
			}}
			rightSection={<StyleEditor element={element} />}
		/>
	)
}

function StyleEditor({ element }: { element: YouTubeElement }) {
	return (
		<Styler>
			<SizeEditor element={element} simple />
			<BordersEditor element={element} simple />
			<SpacingEditor element={element} />
		</Styler>
	)
}
