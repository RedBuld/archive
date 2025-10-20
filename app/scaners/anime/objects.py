from __future__ import annotations

import re
import os
import glob
import ujson
from typing import Self, List, Dict
from app import models
from app.tools import escape_glob

class Meta(object):
    _fields_ = ['status','width','height','format','alt_format','bit_depth','bit_rate','duration','overall_bit_rate']
    status: str = ''
    width: str = ''
    height: str = ''
    format: str = ''
    alt_format: str = ''
    bit_depth: str = ''
    bit_rate: str = ''
    duration: str = ''
    overall_bit_rate: str = ''

    def __init__( self: Self ) -> None:
        self.status = ''
        self.width = ''
        self.height = ''
        self.format = ''
        self.alt_format = ''
        self.bit_depth = ''
        self.bit_rate = ''
        self.duration = ''
        self.overall_bit_rate = ''
    
    def from_mi( self: Self, info: Dict|None ) -> None:
        if not info:
            return
        if 'status' in info:
            self.status = info['status']
        if 'width' in info:
            self.width = info['width']
        if 'height' in info:
            self.height = info['height']
        if 'format' in info:
            self.format = info['format']
        if 'alt_format' in info:
            self.alt_format = info['alt_format']
        if 'bit_depth' in info:
            self.bit_depth = info['bit_depth']
        if 'bit_rate' in info:
            self.bit_rate = info['bit_rate']
        if 'duration' in info:
            self.duration = info['duration']
        if 'overall_bit_rate' in info:
            self.overall_bit_rate = info['overall_bit_rate']
    
    def from_composite( self: Self, composite: CompositeMeta ) -> None:
        comp = composite.compact()
        if not self.width:
            self.width = comp['width']
        if not self.height:
            self.height = comp['height']
        if not self.format:
            self.format = comp['format']
        if not self.alt_format:
            self.alt_format = comp['alt_format']
        if not self.bit_depth:
            self.bit_depth = comp['bit_depth']

    def json( self: Self ) -> Dict:
        return {
            "status": self.status,
            "width": self.width,
            "height": self.height,
            "format": self.format,
            "alt_format": self.alt_format,
            "bit_depth": self.bit_depth,
            "bit_rate": self.bit_rate,
            "duration": self.duration,
            "overall_bit_rate": self.overall_bit_rate,
        }

class CompositeMeta(object):
    _fields_ = ['width','height','format','alt_format','bit_depth']
    width: List[ str ] = []
    height: List[ str ] = []
    format: List[ str ] = []
    alt_format: List[ str ] = []
    bit_depth: List[ str ] = []

    def __init__( self: Self ) -> None:
        self.width = []
        self.height = []
        self.format = []
        self.alt_format = []
        self.bit_depth = []
    
    def from_meta( self: Self, meta: Meta ) -> None:
        if meta.width:
            self.width.append( meta.width )
        if meta.height:
            self.height.append( meta.height )
        if meta.format:
            self.format.append( meta.format )
        if meta.alt_format:
            self.alt_format.append( meta.alt_format )
        if meta.bit_depth:
            self.bit_depth.append( meta.bit_depth )
    
    def compact( self: Self ) -> Dict[ str, str ]:
        return {
            'width': next( iter( list( set( self.width ) ) ), '' ),
            'height': next( iter( list( set( self.height ) ) ), '' ),
            'format': next( iter( list( set( self.format ) ) ), '' ),
            'alt_format': next( iter( list( set( self.alt_format ) ) ), '' ),
            'bit_depth': next( iter( list( set( self.bit_depth ) ) ), '' ),
        }


class Anime:
    path: str = ""
    folder: str = ""
    name: str = ""
    eng_name: str = ""
    covers: List[ str ] = []
    studios: List[ str ] = []
    genres: List[ str ] = []
    voices: List[ str ] = []
    seasons: Dict[ str, AnimeSeason ] = {}
    #
    filename: str = ""
    filesize: int = 0
    #
    meta: Meta

    def __init__( self: Self ) -> None:
        self.path = ""
        self.folder = ""
        self.name = ""
        self.eng_name = ""
        self.covers = []
        self.studios = []
        self.genres = []
        self.voices = []
        self.seasons = {}
        #
        self.filename = ""
        self.filesize = 0
        self.meta = Meta()

    def json( self: Self ) -> Dict:
        return {
            "path": self.path,
            "folder": self.folder,
            "name": self.name,
            "eng_name": self.eng_name,
            "covers": self.covers,
            "studios": self.studios,
            "genres": self.genres,
            "voices": self.voices,
            "seasons": { x:y.json() for x,y in self.seasons.items() },
            "filename": self.filename,
            "filesize": self.filesize,
            "meta": self.meta.json(),
        }

    def __repr__( self: Self ) -> str:
        return ujson.dumps( self.json(), indent=4, ensure_ascii=False)

    def loadData( self: Self ) -> None:
        data = {}
        data_file = ''
        if self.filename:
            filename, _ = os.path.splitext( self.filename )
            data_file = os.path.join( self.path, f"{filename}.json" )
        if self.folder:
            data_file = os.path.join( self.path, "anime.json" )
        
        if os.path.exists( data_file ):
            with open( data_file, "r", encoding="utf-8" ) as f:
                data = ujson.loads( f.read() )

        if "name" in data and data["name"]:
            self.name = data["name"]

        if "eng_name" in data and data["eng_name"]:
            self.eng_name = data["eng_name"]

        if "studios" in data and data["studios"]:
            self.studios = list( set( [ *self.studios, *data["studios"] ] ) )

        if "genres" in data and data["genres"]:
            self.genres = list( set( [ *self.genres, *data["genres"] ] ) )

        if "voices" in data and data["voices"]:
            self.voices = list( set( [ *self.voices, *data["voices"] ] ) )

        if "status" in data and data["status"]:
            self.meta.status = data["status"]
    
    def checkCovers( self: Self ) -> None:
        cover_files = []
        if self.filename:
            filename, _ = os.path.splitext( self.filename )
            cover_files = glob.glob( escape_glob(f"{filename}.cover.*"), root_dir=self.path )
        if self.folder:
            cover_files = glob.glob(".cover.*", root_dir=self.path )

        if len( cover_files ) > 0:
            for cover_file in cover_files:
                _, ext = os.path.splitext( cover_file )
                if ext in models.COVERS_EXTS:
                    self.covers.append( os.path.join( self.path, cover_file ) )
    
    def generateSlug( self: Self ) -> None:
        slug = re.sub("\W", "-", self.eng_name)
        slug = re.sub("\-+", "-", slug)
        slug = slug.strip("-").lower()
        self.slug = slug

class AnimeSeason:
    path: str = ""
    folder: str = ""
    number: float = 99
    name: str = ""
    eng_name: str = ""
    covers: List[ str ] = []
    studios: List[ str ] = []
    genres: List[ str ] = []
    voices: List[ str ] = []
    series: Dict[ str, AnimeSeria ] = {}
    series_names: Dict[ str, Dict[ str, str ] ] = {}
    #
    filename: str = ""
    filesize: int = 0
    meta: Meta

    def __init__( self: Self ) -> None:
        self.path = ""
        self.folder = ""
        self.number = 99
        self.name = ""
        self.eng_name = ""
        self.covers = []
        self.studios = []
        self.genres = []
        self.voices = []
        self.series = {}
        self.series_names = {}
        #
        self.filename = ""
        self.filesize = 0
        self.meta = Meta()

    def json( self: Self ) -> Dict:
        return {
            "path": self.path,
            "folder": self.folder,
            "number": self.number,
            "name": self.name,
            "eng_name": self.eng_name,
            "covers": self.covers,
            "studios": self.studios,
            "genres": self.genres,
            "voices": self.voices,
            "series": { x:y.json() for x,y in self.series.items() },
            "series_names": self.series_names,
            "filename": self.filename,
            "filesize": self.filesize,
            "meta": self.meta.json(),
        }

    def loadData( self: Self ) -> None:
        data = {}
        if self.filename:
            filename, _ = os.path.splitext( self.filename )
            data_file = os.path.join( self.path, f"{filename}.json" )
        if self.folder:
            data_file = os.path.join( self.path, "season.json" )

        if os.path.exists( data_file ):
            with open( data_file, "r", encoding="utf-8" ) as f:
                data = ujson.loads( f.read() )
        
        if "name" in data and data["name"]:
            self.name = data["name"]

        if "eng_name" in data and data["eng_name"]:
            self.eng_name = data["eng_name"]

        if "number" in data and data["number"]:
            self.number = float( data["number"] )

        if "studios" in data and data["studios"]:
            self.studios = list( set( [ *self.studios, *data["studios"] ] ) )

        if "genres" in data and data["genres"]:
            self.genres = list( set( [ *self.genres, *data["genres"] ] ) )

        if "voices" in data and data["voices"]:
            self.voices = list( set( [ *self.voices, *data["voices"] ] ) )

        if "series_names" in data and data["series_names"]:
            self.series_names = data["series_names"]

        if "status" in data and data["status"]:
            self.meta.status = data["status"]
        
        self.name = self.name.replace("Season","Сезон").replace("part","часть")
    
    def checkCovers( self: Self ) -> None:
        cover_files = []
        if self.filename:
            filename, _ = os.path.splitext( self.filename )
            cover_files = glob.glob( escape_glob(f"{filename}.cover.*"), root_dir=self.path )
        if self.folder:
            cover_files = glob.glob(".cover.*", root_dir=self.path )
        if len( cover_files ) > 0:
            for cover_file in cover_files:
                _, ext = os.path.splitext( cover_file )
                if ext in models.COVERS_EXTS:
                    self.covers.append( os.path.join( self.path, cover_file ) )
    
    def generateSlug( self: Self ) -> None:
        slug = re.sub("\W", "-", self.eng_name)
        slug = re.sub("\-+", "-", slug)
        slug = slug.strip("-").lower()
        self.slug = slug


class AnimeSeria:
    number: float = 99
    name: str = ""
    eng_name: str = ""
    filename: str = ""
    filesize: int = 0
    meta: Meta

    def __init__( self: Self ) -> None:
        self.number = 99
        self.name = ""
        self.eng_name = ""
        self.filename = ""
        self.filesize = 0
        self.meta = Meta()

    def json( self: Self ) -> Dict:
        return {
            "number": self.number,
            "name": self.name,
            "eng_name": self.eng_name,
            "filename": self.filename,
            "filesize": self.filesize,
            "meta": self.meta.json(),
        }
