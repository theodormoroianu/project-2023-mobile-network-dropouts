"""
This module stores data. It basically acts like a cache between the memory and the API.

For caching, we use the `get_entry` object, which returns the apropriate item from memory if it is already
loaded, or first loads it and then returns it otherwise.
"""
import pickle
from typing import Dict
import os

# path where data is stored
DATA_PATH = "data/"
# path where downloads are placed
DOWNLOAD_PATH = f"{DATA_PATH}downloads/"
# path where computed stuff is placed
STORE_PATH = f"{DATA_PATH}generated/"

# entries stored in memory
in_memory_entries: Dict[type, object] = dict()

def get_entry(class_type: type, create_if_absent=False):
    """
    Loads the class item from disk if not in memory, and then returns it.
    """
    if class_type in in_memory_entries:
        return in_memory_entries[class_type]
    else:
        class_name = class_type.__name__
        try:
            class_obj = pickle.load(open(f"{STORE_PATH}{class_name}", "rb"))
            in_memory_entries[class_type] = class_obj
            return class_obj
        except Exception as e:
            if create_if_absent:
                in_memory_entries[class_type] = class_type()
                return in_memory_entries[class_type]
            print(f"Unable to extract entry (maybe file does not exist?)!")
            raise e

def save_all_entries():
    """
    Dumps all entries which are in-memory into disk.
    """
    os.makedirs(STORE_PATH, exist_ok=True)
    for class_type in in_memory_entries:
        class_name = class_type.__name__
        pickle.dump(in_memory_entries[class_type], open(f"{STORE_PATH}{class_name}", "wb"))


class BasicStats:
    """
    Stores basic stats
    """
    # list of dicts of type { "elo_min", "elo_max", "nr_games" }
    elo_average_to_nr_games = []