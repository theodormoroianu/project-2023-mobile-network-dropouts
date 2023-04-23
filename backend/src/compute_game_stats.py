"""
Name is really bad. Should change it.

This module tries to replicate what "stats.py" did.
"""

import chess.pgn as pgn
from collections import defaultdict
from tqdm import tqdm
import generate_data
import storage

def compute_openings_and_time_control(chunk: str):
    """
    Tries to compute game stats.
    TODO: Specify what.
    TODO: Make this function combine with other stats, instead of overwriting them
    """
    TOTAL_NR_GAMES = 11348506
    db = open(chunk, "r")

    timecontrol = defaultdict(lambda: 0)
    BUCKET_SIZE = 100
    games_by_average_elo_buckets = defaultdict(lambda: 0)

    # when we discard a game
    DISCARD_THRESHOLD = 100
    nr_discarded_games = 0

    nr_played_games = 0

    openings_frequency = defaultdict(lambda: 0)
    # (#white win, #black win, #draw)
    openings_outcomes = defaultdict(lambda: (0, 0, 0))

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
            nr_discarded_games += 1
            continue

        if result == "*":
            # game is outgoing, silent ignore
            continue

        nr_played_games += 1

        timecontrol[h["TimeControl"]] += 1
        openings_frequency[h["Opening"]] += 1

        outcome = (1 if result == "1-0" else 0,
                1 if result == "0-1" else 0,
                1 if result == "1/2-1/2" else 0)
        try:
            assert outcome[0] + outcome[1] + outcome[2] == 1
        except:
            print(outcome)
            print(result)
            break

        old_outcomes = openings_outcomes[h["Opening"]]
        openings_outcomes[h["Opening"]] = (
            outcome[0] + old_outcomes[0],
            outcome[1] + old_outcomes[1],
            outcome[2] + old_outcomes[2]
        )

        games_by_average_elo_buckets[(ELO_W + ELO_B) // (2 * BUCKET_SIZE)] += 1

    THRESHOLD_BULLET = 180
    THRESHOLD_BLITZ = 5*60
    THRESHOLD_RAPID = 30*60

    # generate basic stats
    basic_stats: storage.BasicStats = storage.get_entry(storage.BasicStats, True)


    a = sorted([(i, games_by_average_elo_buckets[i]) for i in games_by_average_elo_buckets])
    basic_stats.elo_average_to_nr_games = [{
        "elo_min": i[0] * 100,
        "elo_max": i[0] * 100 + 99,
        "nr_games": i[1] / nr_played_games * 100
    } for i in a]


    # a = sorted([(timecontrol[i], i) for i in timecontrol])[::-1][:10]
    # for i in a:
    #     print(f"| {i[0] / nr_played_games * 100:.4f}% | {i[1]} |")

 
    # a = sorted([(openings_frequency[i], i) for i in openings_frequency])[::-1][:15]
    # for i in a:
    #     print(f"| {i[0] / nr_played_games * 100:.4f}% | {i[1]} |")


    # a = sorted(
    #     [(openings_outcomes[i][0] / sum(openings_outcomes[i]) * 100, openings_outcomes[i], i)
    #     for i in openings_outcomes if sum(openings_outcomes[i]) > 20]
    # )[::-1][:15]
    # for i in a:
    #     print(f"| {i[2]} | {i[0]:.4f}% |")


    # a = sorted(
    #     [(openings_outcomes[i][1] / sum(openings_outcomes[i]) * 100, openings_outcomes[i], i)
    #     for i in openings_outcomes if sum(openings_outcomes[i]) > 20]
    # )[::-1][:15]
    # for i in a:
    #     print(f"| {i[2]} | {i[0]:.4f}% |")


def compute_game_stats():
    """
    TODO: What does this do?
    """
    chunks = generate_data.get_chunks_names()
    compute_openings_and_time_control(chunks[0])

    # save to disk
    storage.save_all_entries()
