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

        self.games_by_average_elo_buckets[elo_bucket] += 1
        if elo_bucket not in self.sample_game_for_average_elo_buckets:
            self.sample_game_for_average_elo_buckets[elo_bucket] = generate_game_fens(game)


    def dump_stats(self):
        # generate basic stats
        basic_stats: storage.BasicStats = storage.get_entry(storage.BasicStats, True)

        a = sorted([(i, self.games_by_average_elo_buckets[i]) for i in self.games_by_average_elo_buckets])
        basic_stats.elo_average_to_nr_games = [{
            "elo_min": i[0] * 100,
            "elo_max": i[0] * 100 + 99,
            "nr_games": i[1] / self.nr_played_games * 100,
            "sample_game": self.sample_game_for_average_elo_buckets[i[0]]
        } for i in a]




def compute_stats_for_chunk(chunk: str):
    """
    Tries to compute game stats for a single chunk.
    """

    compute_games_by_avg_bucket = ComputeGamesByAverageBucket()
    
    DISCARD_THRESHOLD = 100
    BUCKET_SIZE = 100

    db = open(chunk, "r")

    print(f"Parsing chunk {chunk}...")
    for _ in tqdm(range(generate_data.GAMES_PER_CHUNK // 20)):
        game = pgn.read_game(db)
        # finished reading the chunk
        if game is None:
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
    compute_stats_for_chunk(chunks[0])

    # save to disk
    storage.save_all_entries()
