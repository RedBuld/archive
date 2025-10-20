import axios from 'axios'

export const API_REFRESH_INTERVAL = 10000

export const API = axios.create({
    baseURL: '/api',
    headers: {
        "Content-Type": "application/json",
    },
})

export function loadData<T>(url: string)
{
    const promise = 
        API.get(url)
            .then(
                (response) => {
                    return response.data as T
                }
            )
            .catch(
                (error) => {
                    console.error(error)
                    throw error
                }
            )

    return promise
}

export function runSearch(search: string)
{
    const promise = 
        API.post('/search', {'search':search})
            .then(
                (response) => {
                    return response.data
                }
            )
            .catch(
                (error) => {
                    console.error(error)
                    throw error
                }
            )

    return promise
}

export function setCached<T>( path: string, data: T ): void
{
    localStorage.setItem( path, JSON.stringify( data ) )
}

export function getCached<T>( path: string ): T|null
{
    let cached = localStorage.getItem( path )
    if( !cached )
    {
        return null
    }
    return JSON.parse( cached )
}


export function setSession<T>( path: string, data: T ): void
{
    sessionStorage.setItem( path, JSON.stringify( data ) )
}

export function getSession<T>( path: string ): T|null
{
    let cached = sessionStorage.getItem( path )
    if( !cached )
    {
        return null
    }
    return JSON.parse( cached )
}

export function delSession( path: string )
{
    sessionStorage.removeItem( path )
}