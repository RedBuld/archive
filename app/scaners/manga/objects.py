from __future__ import annotations

import re
import os
import glob
import ujson
from typing import Self, List, Dict
from app import models

class Manga:
    path: str = ""
    folder: str = ""
    name: str = ""
    eng_name: str = ""
    status: str = ""
    covers: List[ str ] = []
    authors: List[ str ]
    genres: List[ str ]
    volumes: Dict[ str, MangaVolume ] = {}

    def __init__( self: Self ) -> None:
        self.path = ""
        self.folder = ""
        self.name = ""
        self.eng_name = ""
        self.status = ""
        self.covers = []
        self.authors = []
        self.genres = []
        self.volumes = {}

    def __repr__( self: Self ) -> str:
        return ujson.dumps({
            "path": self.path,
            "folder": self.folder,
            "name": self.name,
            "eng_name": self.eng_name,
            "status": self.status,
            "covers": self.covers,
            "authors": self.authors,
            "genres": self.genres,
            "volumes": { x:y.json() for x,y in self.volumes.items() },
        }, indent=4, ensure_ascii=False)

    def loadData( self: Self ) -> None:
        data = {}
        data_file = os.path.join( self.path, "data.json" )
        if os.path.exists( data_file ):
            with open( data_file, "r", encoding="utf-8" ) as f:
                data = ujson.loads( f.read() )
        
        if "name" in data and data["name"]:
            self.name = data["name"]

        if "eng_name" in data and data["eng_name"]:
            self.eng_name = data["eng_name"]

        if "status" in data and data["status"]:
            self.status = data["status"]
        
        if "authors" in data and data["authors"]:
            self.authors = data["authors"]

        if "genres" in data and data["genres"]:
            self.genres = data["genres"]
    
    def checkCovers( self: Self ) -> None:
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

class MangaVolume:
    path: str = ""
    folder: str = ""
    number: float = 99
    name: str = ""
    eng_name: str = ""
    status: str = ""
    covers: List[ str ] = []
    chapters: Dict[ str, MangaChapter ] = {}
    filename: str = ""
    filesize: int = 0
    # recompressor
    chapters_hashes: List[ str ] = []

    def __init__( self: Self ) -> None:
        self.path = ""
        self.folder = ""
        self.number = 99
        self.name = ""
        self.eng_name = ""
        self.covers = []
        self.status = ""
        self.chapters = {}
        self.filename = ""
        self.filesize = 0
        # recompresor
        self.chapters_hashes = []

    def json( self: Self ) -> Dict:
        return {
            "path": self.path,
            "folder": self.folder,
            "number": self.number,
            "name": self.name,
            "eng_name": self.eng_name,
            "status": self.status,
            "covers": self.covers,
            "filename": self.filename,
            "filesize": self.filesize,
            "chapters_hashes": self.chapters_hashes,
            "chapters": { x:y.json() for x,y in self.chapters.items() },
        }

    def loadData( self: Self ) -> None:
        data = {}
        data_file = os.path.join( self.path, "data.json" )

        if os.path.exists( data_file ):
            with open( data_file, "r", encoding="utf-8" ) as f:
                data = ujson.loads( f.read() )
        
        if "name" in data and data["name"]:
            self.name = data["name"]

        if "eng_name" in data and data["eng_name"]:
            self.eng_name = data["eng_name"]

        if "number" in data and data["number"]:
            self.number = float( data["number"] )

        if "status" in data and data["status"]:
            self.status = data["status"]
        
        self.name = self.name.replace("Volume","Том")
    
    def checkCovers( self: Self ) -> None:
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

    def loadRC( self: Self ) -> None:
        rc_file = os.path.join( self.path, ".recompressor" )
        if os.path.exists( rc_file ):
            with open( rc_file, "r", encoding="utf-8" ) as f:
                try:
                    data = ujson.loads( f.read() )
                    if "chapters_hashes" in data:
                        try:
                            self.chapters_hashes = list( set( data["chapters_hashes"] ) )
                        except:
                            pass
                except:
                    pass

    def saveRC( self: Self ) -> None:
        rc_file = os.path.join( self.path, ".recompressor" )
        with open( rc_file, "w", encoding="utf-8" ) as f:
            data = {
                "chapters_hashes": list( set( self.chapters_hashes ) )
            }
            f.write( ujson.dumps( data, indent=4 ) )


class MangaChapter:
    number: float = 99
    name: str = ""
    eng_name: str = ""
    filename: str = ""
    filesize: int = 0
    # recompressor
    hash: str = ""
    recompressed: bool = False

    def __init__( self: Self ) -> None:
        self.number = 99
        self.name = ""
        self.eng_name = ""
        self.filename = ""
        self.filesize = 0
        # recompressor
        self.hash = ""
        self.recompressed = False

    def json( self: Self ) -> Dict:
        return {
            "number": self.number,
            "name": self.name,
            "eng_name": self.eng_name,
            "filename": self.filename,
            "filesize": self.filesize,
            "recompressed": self.recompressed,
        }
