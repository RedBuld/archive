import { Notification } from "../types/general"
import { loadData } from "./general"

export async function loadNotifications( offset: number, limit: number ): Promise<Notification[]|null>
{
    return loadData<Notification[]>( `/notifications/list?limit=${limit}&offset=${offset}` )
        .then(
            (response) => {
                return response
            }
        )
        .catch(
            (error) => {
                console.error(error)
                return null
            }
        )
}

export async function loadLastNotifications(): Promise<Notification[]|null>
{
    return loadData<Notification[]>( `/notifications/last` )
        .then(
            (response) => {
                return response
            }
        )
        .catch(
            (error) => {
                console.error(error)
                return null
            }
        )
}