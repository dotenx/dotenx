import { useAtomValue } from 'jotai'
import _ from 'lodash'
import { useMemo } from 'react'
import { mapStyleToKebabCase } from '../../api/mapper'
import { Element } from '../elements/element'
import { CssSelector, SelectorStyle, Style } from '../elements/style'
import { ViewportDevice } from '../viewport/viewport-store'
import { useClassesStore } from './classes-store'
import { fontsAtom } from './typography-editor'

const globalPageStyles = `
@import url('https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap');
*, *::before, *::after {
	box-sizing: border-box;
  }
  * {
	margin: 0;
  }
  html, body {
	height: 100%;
  }
  body {
	line-height: 1.5;
	-webkit-font-smoothing: antialiased;
	font-family: 'Roboto', sans-serif;
  }
  img, picture, video, canvas, svg {
	display: block;
	max-width: 100%;
  }
  input, button, textarea, select {
	font: inherit;
  }
  p, h1, h2, h3, h4, h5, h6 {
	overflow-wrap: break-word;
  }
  #root, #__next {
	isolation: isolate;
  }
  * {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
`

export const useGenerateStyles = (elements: Element[]) => {
	const fonts = useAtomValue(fontsAtom)
	const classNames = useClassesStore((store) => store.classes)

	const desktopIds = useMemo(() => generateCssIds(elements, 'desktop'), [elements])
	const tabletIds = useMemo(() => generateCssIds(elements, 'tablet'), [elements])
	const mobileIds = useMemo(() => generateCssIds(elements, 'mobile'), [elements])

	const desktopClasses = useMemo(() => generateCssClasses(classNames, 'desktop'), [classNames])
	const tabletClasses = useMemo(() => generateCssClasses(classNames, 'tablet'), [classNames])
	const mobileClasses = useMemo(() => generateCssClasses(classNames, 'mobile'), [classNames])

	const fontsCss = useMemo(() => generateFontsCss(fonts), [fonts])

	const generatedStyles = useMemo(
		() => `
			${fontsCss}
			${globalPageStyles}
			${desktopClasses}
			${desktopIds}
			@media (max-width: 767px) { ${tabletClasses} }
			@media (max-width: 478px) { ${mobileClasses} }
			@media (max-width: 767px) { ${tabletIds} }
			@media (max-width: 478px) { ${mobileIds} }
		`,
		[desktopClasses, desktopIds, fontsCss, mobileClasses, mobileIds, tabletClasses, tabletIds]
	)

	return generatedStyles
}

const generateCssIds = (elements: Element[], device: ViewportDevice) => {
	return flatElements(elements)
		.map((element) => generateCssId(element.id, element.style[device] ?? {}))
		.join('\n')
}

const flatElements = (elements: Element[]): Element[] => {
	return elements.map((element) => [element, ...flatElements(element.children ?? [])]).flat()
}

const generateCssId = (id: string, styles: SelectorStyle) => {
	return _.toPairs(styles)
		.map(([selector, style]) => {
			const cssSelector = selector === CssSelector.Default ? '' : `:${selector}`
			const stringifiedStyles = stylesToString(mapStyleToKebabCase(style))
			return `.${id}${cssSelector} { ${stringifiedStyles} }`
		})
		.join('\n')
}

const generateCssClasses = (classNames: Record<string, Style>, viewport: ViewportDevice) => {
	return _.toPairs(classNames)
		.map(([className, styles]) =>
			_.toPairs(styles[viewport])
				.map(([selector, style]) => {
					const cssSelector = selector === CssSelector.Default ? '' : `:${selector}`
					const stringifiedStyles = stylesToString(mapStyleToKebabCase(style))
					return `.${className}${cssSelector} { ${stringifiedStyles} }`
				})
				.join('\n')
		)
		.join('\n')
}

const stylesToString = (styles: Record<string, string>) => {
	return _.toPairs(styles)
		.map(([key, value]) => `${key}: ${value};`)
		.join(' ')
}
function generateFontsCss(fonts: Record<string, string>) {
	return _.values(fonts)
		.map((fontUrl) => `@import url('${fontUrl}');`)
		.join(' ')
}
