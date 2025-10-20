import re
import os
import glob
from sqlalchemy import func, select, exists, or_, and_
from sqlalchemy.orm import Session
from natsort import natsorted, ns
from app import models
from app import db
from app.tools import escape_glob, upload_cover
from app.tools import reset_animes, reset_notifications
from pymediainfo import MediaInfo

anime_file_regex = re.compile(r"^(?P<name>[^\[\]]+)(\s*\[(?P<quality>.*p)\s*(?P<hevc>HEVC)?\]\s+\[(?P<voices>.*)\])?\.\w+$")
season_folder_regex = re.compile(r"^(?P<number>\d+)\.\s*(?P<name>.+)\s*\[(?P<quality>.*p)\s*(?P<hevc>HEVC)?\]\s+\[(?P<voices>.*)\]$")
season_file_regex = re.compile(r"^(?P<number>\d+)\.\s*(?P<name>.+)\s*\[(?P<quality>.*p)\s*(?P<hevc>HEVC)?\]\s+\[(?P<voices>.*)\]\.\w+$")
chapter_file_regex = re.compile(r"^(?P<number>\d+)\.?(?P<name>.+)?\.\w+$")

async def get_mediainfo(
    obj_type: str,
    obj_id: int
) -> dict:

    session = db.DB()

    if obj_type == 'anime':
        obj = session.execute(
            select(models.Anime).filter(models.Anime.id==obj_id)
        ).scalar_one_or_none()
    if obj_type == 'season':
        obj = session.execute(
            select(models.AnimeSeason).filter(models.AnimeSeason.id==obj_id)
        ).scalar_one_or_none()
    if obj_type == 'chapter':
        obj = session.execute(
            select(models.AnimeChapter).filter(models.AnimeChapter.id==obj_id)
        ).scalar_one_or_none()

    if not obj:
        return {}

    scan_path = models.ANIME_FS_PATH
    file_path = obj.fs_path

    path = os.path.join(scan_path,file_path)
    if os.path.exists(path):
        media_info = MediaInfo.parse( path )
        return media_info.to_data()
    return {}


async def scan_animes():

    scan_path = models.ANIME_FS_PATH
    scan_results = os.listdir(scan_path)
    scan_results = natsorted(scan_results, alg=ns.IGNORECASE)
    
    session = db.DB()

    for element in scan_results:

        name, ext = os.path.splitext(element)

        if os.path.isfile( os.path.join( scan_path, element ) ):
            if ext in models.COVERS_EXTS:
                continue
            elif ext in models.ANIME_EXTS:
                await handleAnimeFile(session=session, root_dir=scan_path, file=element)
        else:
            await handleAnimeFolder(session=session, root_dir=scan_path, folder=element)
    
    session.close()
    
    await reset_animes()
    await reset_notifications()


async def handleAnimeFile(session: Session, root_dir: str, file: str):

    name = None
    quality = None
    hevc = False
    voices = None
    size = None

    matches = anime_file_regex.match(file)
    if matches:
        name = matches.group('name')
        quality = matches.group('quality')
        hevc = matches.group('hevc') != None
        voices = matches.group('voices')
        if name:
            name = name.strip()
    else:
        return
    
    size = os.stat( os.path.join( root_dir, file ) )

    anime = session.execute(
        select(models.Anime)\
            .filter(
                models.Anime.filename==file
            )\
            .limit(1)
        ).scalar_one_or_none()
    if not anime:
        anime = models.Anime()
        anime.name = name
        anime.engname = name
        anime.filename = file
        anime.filesize = size.st_size if size else None
        anime.quality = quality
        anime.hevc = hevc
        anime.voices = voices
        anime.slug = None
        session.add(anime)
        session.commit()

        notification = models.Notification()
        notification.type = 'new'
        notification.target = 'Anime'
        notification.target_id = anime.id
        session.add(notification)
        session.commit()
    else:
        anime.filesize = size.st_size if size else None
        session.add(anime)
        session.commit()

    filename, _ = os.path.splitext(file)
    cover_pattern = escape_glob(filename+'.cover.*')
    cover_files = glob.glob(cover_pattern,root_dir=root_dir,include_hidden=True)
    if len(cover_files):
        for cover_file in cover_files:
            _, ext = os.path.splitext(cover_file)
            if ext in models.COVERS_EXTS:
                cover = upload_cover(anime, os.path.join(root_dir,cover_files[0]))
                if cover:
                    if anime.cover != cover:
                        anime.cover = cover
                        session.add(anime)
                        session.commit()
                    break


async def handleAnimeFolder(session: Session, root_dir: str, folder: str):

    anime = session.execute(
        select(models.Anime)\
            .filter(
                models.Anime.path==folder
            )\
            .limit(1)
        ).scalar_one_or_none()
    if not anime:
        slug = re.sub("\W", "-", folder)
        slug = re.sub("\-+", "-", slug)
        slug = slug.strip('-').lower()
        # 
        anime = models.Anime()
        anime.name = folder
        anime.engname = folder
        anime.path = folder
        anime.slug = slug
        session.add(anime)
        session.commit()

        notification = models.Notification()
        notification.type = 'new'
        notification.target = 'Anime'
        notification.target_id = anime.id
        session.add(notification)
        session.commit()

    scan_path = os.path.join(root_dir,folder)
    scan_results = os.listdir(scan_path)
    scan_results = natsorted(scan_results, alg=ns.IGNORECASE)

    for element in scan_results:
        _, ext = os.path.splitext(element)

        if os.path.isfile( os.path.join( scan_path, element ) ):
            if ext in models.COVERS_EXTS:
                continue
            elif ext in models.MANGA_EXTS:
                await handleSeasonFile(session=session, root_dir=scan_path, file=element, anime_id=anime.id)
        else:
            await handleSeasonFolder(session=session, root_dir=scan_path, folder=element, anime_id=anime.id)

async def handleSeasonFile(session: Session, root_dir: str, file: str, anime_id: int):

    number = None
    name = None
    quality = None
    hevc = False
    voices = None
    size = None

    matches = season_file_regex.match(file)
    if matches:
        number = matches.group('number')
        name = matches.group('name')
        quality = matches.group('quality')
        hevc = matches.group('hevc') != None
        voices = matches.group('voices')
        if name:
            name = name.strip()
    else:
        return
    
    size = os.stat( os.path.join( root_dir, file ) )

    anime_season = session.execute(
        select(models.AnimeSeason)\
            .filter(
                models.AnimeSeason.anime_id==anime_id,
                models.AnimeSeason.filename==file,
            )\
            .limit(1)
        ).scalar_one_or_none()
    if not anime_season:
        anime_season = models.AnimeSeason()
        anime_season.anime_id = anime_id
        anime_season.number = number
        anime_season.name = name
        anime_season.engname = name
        anime_season.filename = file
        anime_season.filesize = size.st_size if size else None
        anime_season.hevc = hevc
        anime_season.quality = quality
        anime_season.voices = voices
        anime_season.slug = None
        session.add(anime_season)
        session.commit()

        notification = models.Notification()
        notification.type = 'new'
        notification.target = 'AnimeSeason'
        notification.target_id = anime_season.id
        session.add(notification)
        session.commit()
    else:
        anime_season.filesize = size.st_size if size else None
        session.add(anime_season)
        session.commit()

    filename, _ = os.path.splitext(file)
    cover_pattern = escape_glob(filename+'.cover.*')
    cover_files = glob.glob(cover_pattern,root_dir=root_dir,include_hidden=True)
    if len(cover_files):
        for cover_file in cover_files:
            _, ext = os.path.splitext(cover_file)
            if ext in models.COVERS_EXTS:
                cover = upload_cover(anime_season, os.path.join(root_dir,cover_files[0]))
                if cover:
                    if anime_season.cover != cover:
                        anime_season.cover = cover
                        session.add(anime_season)
                        session.commit()
                    break

async def handleSeasonFolder(session: Session, root_dir: str, folder: str, anime_id: int):

    number = None
    name = None
    quality = None
    hevc = False
    voices = None

    matches = season_folder_regex.match(folder)
    if matches:
        number = matches.group('number')
        name = matches.group('name')
        quality = matches.group('quality')
        hevc = matches.group('hevc') != None
        voices = matches.group('voices')
        if name:
            name = name.strip()
    else:
        return

    anime_season = session.execute(
        select(models.AnimeSeason)\
            .filter(
                models.AnimeSeason.anime_id==anime_id,
                models.AnimeSeason.path==folder,
            )\
            .limit(1)
        ).scalar_one_or_none()
    if not anime_season:
        slug = re.sub("\W", "-", name)
        slug = re.sub("\-+", "-", slug)
        slug = slug.strip('-').lower()
        # 
        anime_season = models.AnimeSeason()
        anime_season.anime_id = anime_id
        anime_season.number = number
        anime_season.name = name
        anime_season.engname = name
        anime_season.path = folder
        anime_season.hevc = hevc
        anime_season.quality = quality
        anime_season.voices = voices
        anime_season.slug = slug
        session.add(anime_season)
        session.commit()

        notification = models.Notification()
        notification.type = 'new'
        notification.target = 'AnimeSeason'
        notification.target_id = anime_season.id
        session.add(notification)
        session.commit()

    scan_path = os.path.join(root_dir,folder)
    scan_results = os.listdir(scan_path)
    scan_results = natsorted(scan_results, alg=ns.IGNORECASE)

    cover_files = glob.glob('.cover.*',root_dir=scan_path,include_hidden=True)
    if len(cover_files):
        for cover_file in cover_files:
            _, ext = os.path.splitext(cover_file)
            if ext in models.COVERS_EXTS:
                cover = upload_cover(anime_season, os.path.join(scan_path,cover_files[0]))
                if cover:
                    if anime_season.cover != cover:
                        anime_season.cover = cover
                        session.add(anime_season)
                        session.commit()
                    break

    index = 1
    for element in scan_results:
        _, ext = os.path.splitext(element)

        if os.path.isfile( os.path.join( scan_path, element ) ):
            if ext in models.COVERS_EXTS:
                continue
            elif ext in models.ANIME_EXTS:
                await handleChapterFile(session=session, root_dir=scan_path, file=element, season_id=anime_season.id, number=index)
                index += 1

async def handleChapterFile(session: Session, root_dir: str, file: str, season_id: int, number: int):

    _number = None
    name = None

    matches = chapter_file_regex.match(file)
    if matches:
        _number = matches.group('number')
        name = matches.group('name')
        if name:
            name = name.strip()
    else:
        return

    if not _number:
        _number = str(number)

    if not name:
        name = _number

    size = os.stat( os.path.join( root_dir, file ) )

    anime_chapter = session.execute(
        select(models.AnimeChapter)\
            .filter(
                models.AnimeChapter.season_id==season_id,
                models.AnimeChapter.filename==file
            )\
            .limit(1)
        ).scalar_one_or_none()
    if not anime_chapter:
        anime_chapter = models.AnimeChapter()
        anime_chapter.season_id = season_id
        anime_chapter.name = name
        anime_chapter.engname = name
        anime_chapter.filename = file
        session.add(anime_chapter)
        session.commit()

        notification = models.Notification()
        notification.type = 'new'
        notification.target = 'AnimeChapter'
        notification.target_id = anime_chapter.id
        session.add(notification)
        session.commit()

    anime_chapter.filesize = size.st_size if size else None
    anime_chapter.number = number
    session.add(anime_chapter)
    session.commit()