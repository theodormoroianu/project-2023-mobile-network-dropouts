"""
Name is really bad. Should change it.

This module tries to replicate what "stats.py" did.
"""

import os
import random
from typing import List
import chess.pgn as pgn
from collections import defaultdict
from tqdm import tqdm
import generate_data
import storage


BUCKET_SIZE = 100

# size of subbuckets, used when making heatmaps
SUBBUCHET_SIZE = 10

# Cap value for maximum number of moves played in a game in an elo bucket
# If moves >= ..._CAPPED then it is replaced with CAPPED
MAXIMAL_GAME_MOVES_CAPPED = 200

# Cap the value of openings analyzed
MAXIMUM_OPENINGS_CAPPED = 30

# Cap the value of timecontrol games
MAXIMUM_TIMECONTROLS = 5

# Proportion of games we compute the moves of, for heatmaps
PROBABILITY_COMPUTE_ALL_MOVES_FOR_HEATMAP = 0.1

# Probability of tracking a player's games
PROBABILITY_TRACK_PLAYER = 0.1

def generate_game_fens(game) -> List[str]:
    fens = []
    while game is not None:
        fens.append(game.board().fen())
        game = game.next()
    return fens

class FrequencyOfOpeningByEloBucket:
    def __init__(self):
        self.nr_games = 0
        self.sample_game = []

class ComputeGamesByAverageBucket:
    def __init__(self):
        self.elo_buckets = set()
        self.timecontrol = defaultdict(lambda: 0)
        self.games_by_average_elo_buckets = defaultdict(lambda: 0)
        self.sample_game_for_average_elo_buckets = defaultdict(lambda: [])

        # total length of the games played for an ELO range
        self.total_length_game_by_elo_bucket = defaultdict(lambda: 0)
        # total_nr_games...[elo_bucket][nr_moves] = nr of games played in the elo bucket 
        #                                           that lasted nr_moves 
        self.total_nr_of_games_by_length_by_elo_bucket = defaultdict(lambda: [0 for i in range(MAXIMAL_GAME_MOVES_CAPPED)])
        # frequency_of_openings...[elo_bucket] = Specifc opening and its frequency 
        #                                        and a sample game
        self.frequency_of_openings_by_elo_bucket = defaultdict(lambda: defaultdict(lambda: FrequencyOfOpeningByEloBucket()))

        self.openings_frequency = defaultdict(lambda: 0)
        # (#white win, #black win, #draw)
        self.openings_outcomes = defaultdict(lambda: (0, 0, 0))
        self.nr_played_games = 0

        # used to create a heatmap of how players of slighly different ELO beat each others.
        self.games_won_heatmap = defaultdict(lambda: [
            [{ "games_won": 0, "games_lost": 0, "sample_game": [] } for i in range(SUBBUCHET_SIZE)]
            for j in range(SUBBUCHET_SIZE)
        ])

        # used to create a heatmap of piece placement throught a game
        self.piece_pos_heatmap = defaultdict(lambda: dict()) 

        # timecontrol_per_elo_bucket[elo_bucket] = specifc trimecontrol and its frequency
        self.timecontrol_per_elo_bucket = defaultdict(lambda: defaultdict(lambda: 0))

        # track games of players, store (outcome, color, oponent_raring, opening, rating_change)
        self.player_stats = defaultdict(lambda: dict())

        # player list per elo bucket
        self.list_of_players_per_elo_bucket = defaultdict(lambda: set())

    def process_new_game(self, game: pgn.Game, elo_bucket: int):
        h = game.headers
        result = h["Result"]

        self.elo_buckets.add(elo_bucket)
        self.nr_played_games += 1

        self.timecontrol[h["TimeControl"]] += 1
        self.openings_frequency[h["Opening"]] += 1

        outcome = (1 if result == "1-0" else 0,
                1 if result == "0-1" else 0,
                1 if result == "1/2-1/2" else 0)
        try:
            assert outcome[0] + outcome[1] + outcome[2] == 1
        except:
            print("Error:")
            print(outcome)
            print(result)
            return

        old_outcomes = self.openings_outcomes[h["Opening"]]
        self.openings_outcomes[h["Opening"]] = (
            outcome[0] + old_outcomes[0],
            outcome[1] + old_outcomes[1],
            outcome[2] + old_outcomes[2]
        )

        # number of games for a given ELO bucket
        self.games_by_average_elo_buckets[elo_bucket] += 1

        # if we don't already have a sample game, just store this game
        if elo_bucket not in self.sample_game_for_average_elo_buckets:
            self.sample_game_for_average_elo_buckets[elo_bucket] = generate_game_fens(game)

        nr_moves = len(list(game.mainline()))
        # store the total sum of the number of moves over all games of a given ELO bucket
        self.total_length_game_by_elo_bucket[elo_bucket] += nr_moves
        # increase the nr of games with this specific nr of moves
        self.total_nr_of_games_by_length_by_elo_bucket[elo_bucket][min(nr_moves, MAXIMAL_GAME_MOVES_CAPPED - 1)] += 1
        # increase the nr of games with this specific opening
        self.frequency_of_openings_by_elo_bucket[elo_bucket][h["Opening"]].nr_games += 1
        # include a list of fens for a sample game with the speicifc opening
        if len(self.frequency_of_openings_by_elo_bucket[elo_bucket][h["Opening"]].sample_game) == 0:
            self.frequency_of_openings_by_elo_bucket[elo_bucket][h["Opening"]].sample_game = generate_game_fens(game)
        # increase the nr of games for a specifc timecontrol
        self.timecontrol_per_elo_bucket[elo_bucket][h["TimeControl"]] += 1

        # compute heatmap data
        b1, b2 = int(h["WhiteElo"]) % BUCKET_SIZE // SUBBUCHET_SIZE, int(h["BlackElo"]) % BUCKET_SIZE // SUBBUCHET_SIZE
        if outcome[0] == 1 or outcome[1] == 1:
            # one of them beat the other
            if outcome[1] == 1:
                # black beat white, reverse b1 and b2 so that b1 beats b2
                b1, b2 = b2, b1
            self.games_won_heatmap[elo_bucket][b1][b2]["games_won"] += 1
            self.games_won_heatmap[elo_bucket][b2][b1]["games_lost"] += 1
            if self.games_won_heatmap[elo_bucket][b1][b2]["sample_game"] == []:
                # add sample game
                self.games_won_heatmap[elo_bucket][b1][b2]["sample_game"] = generate_game_fens(game)

		# compute piece positions heatmap data
        def process_board(board, move_no):
            board_list = str(board).split()
            piece_mapping = {
                "P": ("white", "pawn"),
                "N": ("white", "knight"),
                "B": ("white", "bishop"),
                "R": ("white", "rook"),
                "Q": ("white", "queen"),
                "K": ("white", "king"),
                "p": ("black", "pawn"),
                "n": ("black", "knight"),
                "b": ("black", "bishop"),
                "r": ("black", "rook"),
                "q": ("black", "queen"),
                "k": ("black", "king")
            }

            for row in range(8):
                for col in range(8):
                    piece = board_list[row * 8 + col]
                    if piece != '.':
                        player_color, piece_type = piece_mapping[piece]
                        string_key = player_color + "|" +  piece_type + "|" + str(move_no)

                        if string_key not in self.piece_pos_heatmap[elo_bucket]:
                            self.piece_pos_heatmap[elo_bucket][string_key] = \
                                    [[0] * 8 for _ in range(8)]
                        self.piece_pos_heatmap[elo_bucket][string_key][row][col] += 1

        if random.random() < PROBABILITY_COMPUTE_ALL_MOVES_FOR_HEATMAP:
            board = game.board()
            process_board(board, 0)

            move_no = 1
            for move in game.mainline_moves():
                board.push(move)
                process_board(board, move_no)
                move_no += 1


        # track game stats for both players
        for color in ["White", "Black"]:
            player = game.headers[color]
            if player in self.player_stats[elo_bucket] or random.random() < PROBABILITY_TRACK_PLAYER:
                if game.headers["Result"] == "1/2-1/2":
                    outcome = "draw"
                else:
                    winning_outcome = "1-0" if color == "White" else "0-1"
                    outcome = "win" if game.headers["Result"] == winning_outcome else "loss"

                elo = game.headers[f"{color}Elo"]
                if f"{color}RatingDiff" in game.headers:
                    elo_change = game.headers[f"{color}RatingDiff"]
                else:
                    elo_change = 0
                player_name = game.headers[color]
                opening = game.headers["Opening"]
                oponent = "Black" if color == "White" else "White"
                oponent_rating = game.headers[f"{oponent}Elo"]
                utc_date = game.headers["UTCDate"] + "|" + game.headers["UTCTime"]

                data_to_store = (player_name, color, outcome, opening, elo, elo_change, oponent_rating, utc_date)
                if player not in self.player_stats[elo_bucket]:
                    self.player_stats[elo_bucket][player] = []
                self.player_stats[elo_bucket][player].append(data_to_store)

        # add new player found
        if game.headers["White"] not in self.list_of_players_per_elo_bucket[elo_bucket]:
            self.list_of_players_per_elo_bucket[elo_bucket].add(game.headers["White"])
        if game.headers["Black"] not in self.list_of_players_per_elo_bucket[elo_bucket]:
            self.list_of_players_per_elo_bucket[elo_bucket].add(game.headers["Black"])

    def dump_stats(self):
        # generate basic stats
        basic_stats: storage.BasicStats = storage.get_entry(storage.BasicStats, True)
        per_elo_stats: storage.PerEloStats = storage.get_entry(storage.PerEloStats, True)

        a = sorted([(i, self.games_by_average_elo_buckets[i]) for i in self.games_by_average_elo_buckets])
        basic_stats.elo_average_to_nr_games = [{
            "elo_min": i[0] * BUCKET_SIZE,
            "elo_max": i[0] * BUCKET_SIZE + BUCKET_SIZE - 1,
            "nr_games": i[1] / self.nr_played_games * 100,
            "sample_game": self.sample_game_for_average_elo_buckets[i[0]]
        } for i in a]


        sorted_elo_buckets = sorted([i for i in self.total_length_game_by_elo_bucket])
        basic_stats.elo_average_to_length_of_game = [{
            "elo_min": elo_bucket * BUCKET_SIZE,
            "elo_max": elo_bucket * BUCKET_SIZE + BUCKET_SIZE - 1,
            "average_length": self.total_length_game_by_elo_bucket[elo_bucket] 
                    / self.games_by_average_elo_buckets[elo_bucket],
            "frq_games_by_nr_moves": self.total_nr_of_games_by_length_by_elo_bucket[elo_bucket]
        } for elo_bucket in sorted_elo_buckets]

        # Compute most used openings per elo bucket stats
        sorted_elo_buckets_openings = sorted([i for i in self.frequency_of_openings_by_elo_bucket])
        basic_stats.elo_average_to_frequency_of_opening = []
        most_used_openings_per_elo_bucket = dict()
        for elo_bucket in sorted_elo_buckets_openings:
            frequency_by_name = self.frequency_of_openings_by_elo_bucket[elo_bucket]
            most_used_openings = sorted([(frequency_by_name[i].nr_games, frequency_by_name[i].sample_game, i) for i in frequency_by_name])[::-1]
            if len(most_used_openings) > MAXIMUM_OPENINGS_CAPPED:
                most_used_openings = most_used_openings[:MAXIMUM_OPENINGS_CAPPED]
            most_used_openings_per_elo_bucket[elo_bucket] = {
                opening: { "nr_games": frq, "sample_game": fens }
                for frq, fens, opening in most_used_openings
            }

        for elo_bucket in sorted_elo_buckets_openings:
            item = {
                "elo_min": elo_bucket * BUCKET_SIZE,
                "elo_max": elo_bucket * BUCKET_SIZE + BUCKET_SIZE - 1,
                "most_used_openings_and_frq": most_used_openings_per_elo_bucket[elo_bucket]
            }
            basic_stats.elo_average_to_frequency_of_opening.append(item)

        # Compute the most used timecontrols per elo bucket stats
        sorted_elo_buckets_timecontrols = sorted([i for i in self.timecontrol_per_elo_bucket])
        most_used_timecontrols_per_elo_bucket = dict()
        for elo_bucket in sorted_elo_buckets_timecontrols:
            frequency_by_timecontrol = self.timecontrol_per_elo_bucket[elo_bucket]
            most_used_timecontrols = sorted([(frequency_by_timecontrol[i], i) for i in frequency_by_timecontrol])[::-1]
            if len(most_used_timecontrols) > MAXIMUM_TIMECONTROLS:
                most_used_timecontrols = most_used_timecontrols[:MAXIMUM_TIMECONTROLS]
            most_used_timecontrols_per_elo_bucket[elo_bucket] = {
                timecontrol: frq 
                for frq, timecontrol in most_used_timecontrols
            }

        # Populate "elo_min", "elo_max", "nr_games", "sample_game": ["fen"]"average_length", "frq_games_by_nr_moves": [], "most_used_openings_and_frq": { str: int }
        for elo_bucket in self.elo_buckets:
            if elo_bucket not in per_elo_stats.per_elo_stats:
                per_elo_stats.per_elo_stats[elo_bucket] = dict()
            elo_stats = per_elo_stats.per_elo_stats[elo_bucket]

            elo_stats["elo_min"] = elo_bucket * BUCKET_SIZE
            elo_stats["elo_max"] = elo_bucket * BUCKET_SIZE + BUCKET_SIZE - 1
            elo_stats["total_nr_games_in_elo_bucket"] = self.games_by_average_elo_buckets[elo_bucket]
            elo_stats["nr_games"] = self.games_by_average_elo_buckets[elo_bucket] / self.nr_played_games * 100
            elo_stats["sample_game"] = self.sample_game_for_average_elo_buckets[elo_bucket]
            elo_stats["average_length"] = self.total_length_game_by_elo_bucket[elo_bucket] / self.games_by_average_elo_buckets[elo_bucket],
            elo_stats["frq_games_by_nr_moves"] = self.total_nr_of_games_by_length_by_elo_bucket[elo_bucket]
            elo_stats["most_used_openings_and_frq"] = most_used_openings_per_elo_bucket[elo_bucket]
            elo_stats["most_used_timecontrols_and_frq"] = most_used_timecontrols_per_elo_bucket[elo_bucket]
            elo_stats["games_won_heatmap"] = self.games_won_heatmap[elo_bucket]
            elo_stats["pieces_pos_heatmap"] = self.piece_pos_heatmap[elo_bucket]
            elo_stats["nr_of_players"] = len(self.list_of_players_per_elo_bucket[elo_bucket])

            # select the player with most games and display his/her stats
            player_games = [(len(self.player_stats[elo_bucket][player]), player) for player in self.player_stats[elo_bucket]]
            player_to_show = max(player_games)[1]
            elo_stats["individual_player_stats"] = self.player_stats[elo_bucket][player_to_show]


def compute_stats_for_chunk(chunks: list[str]):
    """
    Tries to compute game stats for a single chunk.
    """

    compute_games_by_avg_bucket = ComputeGamesByAverageBucket()
    
    DISCARD_THRESHOLD = 100

    active_chunk = chunks[0]
    chunks = chunks[1:]
    db = open(active_chunk, "r")

    print(f"Parsing chunk {active_chunk}...")
    GAMES_TO_PARSE = 11348506
    if os.getenv("GENERATE_DATA_IGNORE_DOWNLOAD"):
        GAMES_TO_PARSE = 11348506
        
    for _ in tqdm(range(GAMES_TO_PARSE)):
        game = pgn.read_game(db)
        # finished reading the chunk
        if game is None:
            # open a new chunk
            if chunks != []:
                active_chunk = chunks[0]
                chunks = chunks[1:]
                db = open(active_chunk, "r")
                continue
            else:
                break

        h = game.headers
        ELO_W, ELO_B = int(h["WhiteElo"]), int(h["BlackElo"])
        result = h["Result"]

        # ELO too different. Skip game
        if abs(ELO_W - ELO_B) > DISCARD_THRESHOLD:
            continue

        if result == "*":
            # game is outgoing, silent ignore
            continue

        elo_bucket = (ELO_W + ELO_B) // (2 * BUCKET_SIZE)

        compute_games_by_avg_bucket.process_new_game(game, elo_bucket)
        

    compute_games_by_avg_bucket.dump_stats()


def compute_game_stats():
    """
    TODO: What does this do?
    """
    chunks = generate_data.get_chunks_names()
    compute_stats_for_chunk(chunks)

    # save to disk
    storage.save_all_entries()
