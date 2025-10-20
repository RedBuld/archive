import re
import os
import json
import hashlib
import shutil
import filecmp
from xxhash import xxh3_128
from sqlalchemy import select
from urllib import parse
from typing import Any
from datetime import datetime
from PIL import Image
from app import models
from app import schemas
from app.db import DB
from app.db import RD

parse_query_brackets_query = re.compile(r"(\[([^\]]*)\])")

def pretty_elastic(response):
    if len(response["hits"]["hits"]) == 0:
        print("Your search returned no results.")
    else:
        for hit in response["hits"]["hits"]:
            es_id = hit["_id"]
            es_score = hit["_score"]
            id = hit["_source"]["id"]
            type = hit["_source"]["type"]
            fuzzy = hit["_source"]["fuzzy"]
            print(json.dumps({
                'es_id': es_id,
                'es_score': es_score,
                'id': id,
                'type': type,
                'fuzzy': fuzzy
            }, indent=4))

def escape_glob(
    name: str
) -> str:

    name = name.translate(
        str.maketrans(
            {
                "[":  r"[[]",
                "]":  r"[]]"
            }
        )
    )
    return name

def format_float( num: float ) -> str:
    if num % 1 == 0:
        return str( int(num) )
    else:
        return str( num )

def save_cover(
    source_file: str,
    filename: str
) -> bool:
    
    sub = filename[0:2]

    full_target_folder = os.path.join( models.COVERS_FS_PATH, 'full', sub )
    mini_target_folder = os.path.join( models.COVERS_FS_PATH, 'mini', sub )

    full_target_file = os.path.join( full_target_folder, filename )
    mini_target_file = os.path.join( mini_target_folder, filename )

    if not os.path.exists( full_target_folder ):
        os.makedirs( full_target_folder, exist_ok=True )

    if not os.path.exists( mini_target_folder ):
        os.makedirs( mini_target_folder, exist_ok=True )

    full = True

    source_file_size = os.path.getsize( source_file )
    target_file_size = 0

    if os.path.exists( full_target_file ):
        target_file_size = os.path.getsize( full_target_file )

    if target_file_size != source_file_size:
        try:
            shutil.copy( source_file, full_target_file )
        except:
            full = False
    
    if full and not ( os.path.exists( mini_target_file ) and target_file_size == source_file_size ):

        with Image.open( full_target_file ) as img_src:
            img_src.thumbnail( ( 350, 500 ) )
            try:
                img_src.save( mini_target_file, optimize=True )
            except:
                pass

    return full

def calculate_file_hash(
    path: str
) -> str:
    hash = xxh3_128(b'',seed=1)
    try:
        with open( path, 'rb' ) as f:
            while chunk := f.read( 1048576 ):
                hash.update(chunk)
    except:
        pass
    return hash.hexdigest()

def calculate_hash(
    string: str
) -> str:
    hash = xxh3_128(b'',seed=1)
    try:
        hash.update(string)
    except:
        pass
    return hash.hexdigest()

def parse_query(
    payload: Any,
    ignore: list[str] = []
) -> dict:
    data = {}
    query = parse.parse_qs( str(payload) )

    def parse_level( key, value, data ):

        if '[' in key:
            level_key, nested_key = key.split('[', 1) # `level_key[nested_key...`
            nested_key = ''.join( nested_key.split(']', 1) )

            if level_key in ignore:
                return data

            if level_key.startswith("'") or level_key.startswith('"'):
                level_key = level_key[1:]

            if level_key.endswith("'") or level_key.endswith('"'):
                level_key = level_key[:-1]

            if level_key not in data:
                if nested_key == '':
                    data[level_key] = []
                else:
                    data[level_key] = {}

            if '[' in nested_key:
                data[level_key] = parse_level( nested_key, value, data[level_key] )
            else:
                if nested_key == '':
                    data[level_key] = value
                else:
                    data[level_key][nested_key] = value

        else:

            if key in ignore:
                return data

            if type(value) == list:
                data[key] = value[0]
            else:
                data[key] = value

        return data


    for key in query:
        value = query[key]
        data = parse_level( key, value, data )

    return data