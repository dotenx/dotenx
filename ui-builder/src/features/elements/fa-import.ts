import { library } from '@fortawesome/fontawesome-svg-core'
import * as SolidIcons from '@fortawesome/free-solid-svg-icons'
import * as RegularIcons from '@fortawesome/free-regular-svg-icons'

import * as BrandIcons from '@fortawesome/free-brands-svg-icons'

import { IconDefinition, IconPrefix, IconPack } from '@fortawesome/free-solid-svg-icons'

// Type that `library.add()` expects.
type IconDefinitionOrPack = IconDefinition | IconPack

interface ImportedIcons {
	[key: string]: IconPrefix | IconDefinitionOrPack
}

// Type `Icons` as a interface containing keys whose values are
// union of the resulting union type from above and `IconPrefix`.

const solidIconList = Object.keys(SolidIcons)
	.filter((key) => key !== 'fas' && key !== 'prefix')
	.map((icon) => (SolidIcons as ImportedIcons)[icon])

export const solidIconNames = solidIconList.map((i: any) => i.iconName)


const regularIconList = Object.keys(RegularIcons)
	.filter((key) => key !== 'far' && key !== 'prefix')
	.map((icon) => (RegularIcons as ImportedIcons)[icon])

export const regularIconNames = regularIconList.map((i: any) => i.iconName)

const brandIconList = Object.keys(BrandIcons)
	.filter((key) => key !== 'fab' && key !== 'prefix')
	.map((icon) => (BrandIcons as ImportedIcons)[icon])

export const brandIconNames = brandIconList.map((i: any) => i.iconName)

library.add(...(solidIconList as IconDefinitionOrPack[]))
library.add(...(regularIconList as IconDefinitionOrPack[]))
library.add(...(brandIconList as IconDefinitionOrPack[]))