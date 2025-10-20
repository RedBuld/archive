import os
from pymediainfo import MediaInfo
from sqlalchemy import func, select, exists, or_, and_
from sqlalchemy.orm import Session
from app import models
from app import db

async def get_mediainfo(
    obj_type: str,
    obj_id: int
) -> dict|None:

    session = db.DB()

    if obj_type == 'anime':
        obj = session.execute(
            select(
                models.Anime
            )\
            .filter(
                models.Anime.id==obj_id
            )
        ).scalar_one_or_none()
    if obj_type == 'season':
        obj = session.execute(
            select(
                models.AnimeSeason
            )\
            .filter(
                models.AnimeSeason.id==obj_id
            )
        ).scalar_one_or_none()
    if obj_type == 'seria':
        obj = session.execute(
            select(
                models.AnimeSeria
            )\
            .filter(
                models.AnimeSeria.id==obj_id
            )
        ).scalar_one_or_none()

    if not obj:
        return {}

    return scan_mediainfo( obj.fs_path )

    

def scan_mediainfo( path: str ) -> dict|None:
    # print(f'Trying get MI for file {path}')
    if os.path.exists( path ):
        media_info = MediaInfo.parse( path )
        if media_info:
            duration_gen = 0
            duration_vid = 0
            info = {
                'width': '',#width
                'height': '',#height
                'format': '',#format
                'alt_format': '',#internet_media_type
                'bit_depth': '',#bit_depth
                'bit_rate': '',#bit_rate
                'duration': '',
                'overall_bit_rate': '',#overall_bit_rate
            }
            raw = media_info.to_data()
            if 'tracks' in raw:
                for track in raw['tracks']:
                    if track['track_type'] == 'General':
                        if 'duration' in track:
                            duration_gen = int( float( track['duration'] ) )
                        if 'overall_bit_rate' in track:
                            info['overall_bit_rate'] = track['overall_bit_rate']
                    if track['track_type'] == 'Video':
                        if 'duration' in track:
                            duration_vid = int( float( track['duration'] ) )
                        if 'width' in track:
                            info['width'] = track['width']
                        if 'height' in track:
                            info['height'] = track['height']
                        if 'format' in track:
                            info['format'] = track['format']
                        if 'internet_media_type' in track:
                            info['alt_format'] = track['internet_media_type']
                        if 'bit_depth' in track:
                            info['bit_depth'] = track['bit_depth']
                        if 'bit_rate' in track:
                            info['bit_rate'] = track['bit_rate']
                if duration_vid:
                    info['duration'] = str( duration_vid )
                elif duration_vid:
                    info['duration'] = str( duration_gen )
                return info
        return media_info.to_data()
    return None