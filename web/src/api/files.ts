import { StorageStats, StorageStatsInitial } from "../types/general"
import { loadData } from "./general"

export async function getCacheStats(): Promise<StorageStats>
{
    let response: StorageStats = {
        used: 0,
        total: 1,
        free: 1,
    }
    if( window.navigator.storage && window.navigator.storage.estimate )
    {
        const quota = await window.navigator.storage.estimate()
        response.used = quota.usage??0
        response.total = quota.quota??0
        response.free = response.total - response.used
    }
    return response
}

export async function getDiskStats(): Promise<StorageStats>
{
    return await loadData<StorageStats>( `/disk_stats` )
        .then(
            (response) => {
                return response??StorageStatsInitial
            }
        )
        .catch(
            (error) => {
                console.error(error)
                return StorageStatsInitial
            }
        )
}