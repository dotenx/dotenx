import { Controller } from '../../controllers/controller'
import { sofa } from './theme'

export class Sofa extends Controller {
	name = 'Sofa'
	image = ''
	defaultData = sofa()
	renderOptions = () => <></>
}
