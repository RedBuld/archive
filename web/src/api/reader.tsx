import { DefaultReaderSettings, ReaderSettings } from "@/types/reader"
import { getCached, setCached } from "@/api/general"
import { mergeDeep } from "../tools/general"

export function getReaderSettings(): ReaderSettings
{
    let cached = getCached<ReaderSettings>( 'reader_settings' )
    if( !cached )
    {
        return mergeDeep( {}, DefaultReaderSettings ) as ReaderSettings
    }
    // upfill new properties after updates
    let result = mergeDeep( {}, DefaultReaderSettings ) as ReaderSettings
    result = mergeDeep( result, cached ) as ReaderSettings
	return result
}

export function setReaderSettings(settings: any)
{
    setCached( 'reader_settings', settings )
}