import orjson
import psutil

from app.db import RD

async def get_disk_stats():

    result = await RD.get('disk_usage')
    if not result:
        try:
            hdd = psutil.disk_usage('/app/web/download')
            result = orjson.dumps({
                "used": hdd.used,
                "total": hdd.total,
                "free": hdd.free,
            })
            await RD.setex( 'disk_usage', 3600, result )
        except Exception as e:
            result = orjson.dumps({
                "used": 0,
                "total": 0,
                "free": 0,
            })

    return result