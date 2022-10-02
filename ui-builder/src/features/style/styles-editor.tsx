import { AnimationEditor } from './animation-editor'
import { BackgroundsEditor } from './background-editor'
import { BordersEditor } from './border-editor'
import { ClassEditor } from './class-editor'
import { CssPropertiesEditor } from './css-properties-editor'
import { LayoutEditor } from './layout-editor'
import { PositionEditor } from './position-editor'
import { ShadowsEditor } from './shadow-editor'
import { SizeEditor } from './size-editor'
import { SpacingEditor } from './spacing-editor'
import { TypographyEditor } from './typography-editor'

export function StylesEditor() {
	return (
		<div className="space-y-6">
			<ClassEditor />
			<AnimationEditor />
			<LayoutEditor />
			<SpacingEditor />
			<SizeEditor />
			<PositionEditor />
			<TypographyEditor />
			<BackgroundsEditor />
			<BordersEditor />
			<ShadowsEditor />
			<CssPropertiesEditor />
		</div>
	)
}
