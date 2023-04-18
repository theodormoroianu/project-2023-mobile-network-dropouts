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

nr_played_games = 0

openings_frequency = defaultdict(lambda: 0)
# (#white win, #black win, #draw)
openings_outcomes = defaultdict(lambda: (0, 0, 0))

#%%
for _ in tqdm(range(150000)):
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

# %%

THRESHOLD_BULLET = 180
THRESHOLD_BLITZ = 5*60
THRESHOLD_RAPID = 30*60

# PRINT STATISTICS

#%%

a = sorted([(i, games_by_average_elo_buckets[i]) for i in games_by_average_elo_buckets])
for i in a:
    print(f"| {i[0] * 100} - {i[0] * 100 + 99} | {(i[1] / nr_played_games * 100):.4f}% |")


#%%
a = sorted([(timecontrol[i], i) for i in timecontrol])[::-1][:10]
for i in a:
    print(f"| {i[0] / nr_played_games * 100:.4f}% | {i[1]} |")

# %%
#%%
a = sorted([(openings_frequency[i], i) for i in openings_frequency])[::-1][:15]
for i in a:
    print(f"| {i[0] / nr_played_games * 100:.4f}% | {i[1]} |")

# %%

a = sorted(
    [(openings_outcomes[i][0] / sum(openings_outcomes[i]) * 100, openings_outcomes[i], i)
     for i in openings_outcomes if sum(openings_outcomes[i]) > 20]
)[::-1][:15]
for i in a:
    print(f"| {i[2]} | {i[0]:.4f}% |")

# %%

a = sorted(
    [(openings_outcomes[i][1] / sum(openings_outcomes[i]) * 100, openings_outcomes[i], i)
     for i in openings_outcomes if sum(openings_outcomes[i]) > 20]
)[::-1][:15]
for i in a:
    print(f"| {i[2]} | {i[0]:.4f}% |")

# %%
