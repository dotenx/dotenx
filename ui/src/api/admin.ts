import axios from 'axios'
import { ADMIN_API_URL } from '../constants'

const api = axios.create({
	baseURL: ADMIN_API_URL,
	withCredentials: true,
})

export function logout() {
	return api.get('/oauth/logout')
}
