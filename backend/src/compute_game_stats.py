"""
Name is really bad. Should change it.

This module tries to replicate what "stats.py" did.
"""

from typing import List
import chess.pgn as pgn
from collections import defaultdict
from tqdm import tqdm
import generate_data
import storage


BUCKET_SIZE = 100
# Cap value for maximum number of moves played in a game in an elo bucket
# If moves >= ..._CAPPED then it is replaced with CAPPED
MAXIMAL_GAME_MOVES_CAPPED = 200

def generate_game_fens(game) -> List[str]:
    fens = []
    while game is not None:
        fens.append(game.board().fen())
        game = game.next()
    return fens

class ComputeGamesByAverageBucket:
    def __init__(self):
        self.timecontrol = defaultdict(lambda: 0)
        self.games_by_average_elo_buckets = defaultdict(lambda: 0)
        self.sample_game_for_average_elo_buckets = defaultdict(lambda: [])

        # total length of the games played for an ELO range
        self.total_length_game_by_elo_bucket = defaultdict(lambda: 0)
        # total_nr_games...[elo_bucket][nr_moves] = nr of games played in the elo bucket 
        #                                           that lasted nr_moves 
        self.total_nr_of_games_by_length_by_elo_bucket = defaultdict(lambda: [0 for i in range(MAXIMAL_GAME_MOVES_CAPPED)])

        self.openings_frequency = defaultdict(lambda: 0)
        # (#white win, #black win, #draw)
        self.openings_outcomes = defaultdict(lambda: (0, 0, 0))
        self.nr_played_games = 0

    def process_new_game(self, game: pgn.Game, elo_bucket: int):
        h = game.headers
        result = h["Result"]

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



    def dump_stats(self):
        # generate basic stats
        basic_stats: storage.BasicStats = storage.get_entry(storage.BasicStats, True)

        a = sorted([(i, self.games_by_average_elo_buckets[i]) for i in self.games_by_average_elo_buckets])
        basic_stats.elo_average_to_nr_games = [{
            "elo_min": i[0] * BUCKET_SIZE,
            "elo_max": i[0] * BUCKET_SIZE + BUCKET_SIZE - 1,
            "nr_games": i[1] / self.nr_played_games * BUCKET_SIZE,
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
    for _ in tqdm(range(4 * generate_data.GAMES_PER_CHUNK)):
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
