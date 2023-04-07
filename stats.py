#%%
import chess.pgn as pgn
from collections import defaultdict
from tqdm import tqdm

TOTAL_NR_GAMES = 11348506
db = open("lichess_db_standard_rated_2017-04.pgn", "r")

#%%
timecontrol = defaultdict(lambda: 0)
BUCKET_SIZE = 100
games_by_average_elo_buckets = defaultdict(lambda: 0)

# when we discard a game
DISCARD_THRESHOLD = 100
nr_discarded_games = 0

openings_frequency = defaultdict(lambda: 0)
# (#white win, #black win, #draw)
openings_outcomes = defaultdict(lambda: (0, 0, 0))

#%%
for _ in tqdm(range(TOTAL_NR_GAMES)):
    game = pgn.read_game(db)
    h = game.headers
    ELO_W, ELO_B = int(h["WhiteElo"]), int(h["BlackElo"])
    result = h["Result"]

    if abs(ELO_W - ELO_B) > DISCARD_THRESHOLD:
        nr_discarded_games += 1
        continue

    if result == "*":
        # game is outgoing, silent ignore
        continue

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

# %%
