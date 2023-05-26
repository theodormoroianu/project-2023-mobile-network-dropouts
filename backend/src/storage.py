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
    def __init__(self):
        # list of dicts of type { "elo_min", "elo_max", "nr_games", "sample_game": ["fen"] }
        self.elo_average_to_nr_games = []

        # list of dicts of type { "elo_min", "elo_max", "average_length", "frq_games_by_nr_moves": [] }
        # frq_games_by_nr_moves[i] = number of games in the specific elo bucket which lastes for i moves
        #                           i manually capped at 100 moves
        self.elo_average_to_length_of_game = []

        # list of dicts of type { "elo_min", "elo_max", "most_used_openings_and_frq": { str: int } }
        self.elo_average_to_frequency_of_opening = []


class PerEloStats:
    """
    Store statitics per ELO bucket
    """
    # dict of dicts of type elo_bucket : {
    # "elo_min", 
    # "elo_max",
    # "total_nr_games_in_elo_bucket" 
    # "nr_games",
    # "sample_game": ["fen"],
    # "average_length", 
    # "frq_games_by_nr_moves": [], 
    # "most_used_openings_and_frq": { str: {nr_games: int, sample_game: ["fen"]} } 
    # frq_games_by_nr_moves[i] = number of games in the specific elo bucket which lastes for i moves
    #                           i manually capped at 100 moves
    # "most_used_timecontrols_and_frq": {str: int}
    # games_won_heatmap: [[{games_won: int, games_lost, sample_game: ["fen"]}]]
    #       used to display a heatmap of how often players beat each other, depending on the small ELO diffs.
    # }
    # pieces_pos_heatmap: {(player_color, piece_type, move_number): [[int]]}
    #       used to display a heatmap of the positions of each piece through a game in a speciffic ELO bucket
    def __init__(self):
        self.per_elo_stats = dict()
