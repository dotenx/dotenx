import imageUrl from '../../../assets/components/about-left.png'
import { Controller } from '../../controllers/controller'
import { BoxElement } from '../../elements/extensions/box'

export class CollectionList extends Controller {
	name = 'Collection list'
	image = imageUrl
	defaultData = defaultData
	renderOptions = () => <CollectionListOptions />
}

function CollectionListOptions() {
	return <div>options</div>
}

const defaultData = new BoxElement()
