from flask import Blueprint
import storage
import dummy_game_fen_generator

api = Blueprint('api', __name__)

@api.route("/test")
def test():
    return "Test Passed"

@api.route("/basic-elo-game-stats")
def basic_elo_game_stats():
    basic_stats: storage.BasicStats = storage.get_entry(storage.BasicStats)
    return basic_stats.elo_average_to_nr_games

@api.route("/dummy-game-fens")
def dummy_game_fens():
    return dummy_game_fen_generator.generate_game_fens()

@api.route("/average-game-length-stats")
def average_game_length_stats():
    basic_stats: storage.BasicStats = storage.get_entry(storage.BasicStats)
    return basic_stats.elo_average_to_length_of_game

@api.route("/most-frequent-openings-stats")
def most_frequent_openings_stats():
    basic_stats: storage.BasicStats = storage.get_entry(storage.BasicStats)
    return basic_stats.elo_average_to_frequency_of_opening

@api.route("/per-elo-stats/get-elo-buckets")
def get_elo_buckets():
    per_elo_stats: storage.PerEloStats = storage.get_entry(storage.PerEloStats)
    return [{
        "elo_bucket": elo_bucket,
        "elo_min": per_elo_stats.per_elo_stats[elo_bucket]["elo_min"],
        "elo_max": per_elo_stats.per_elo_stats[elo_bucket]["elo_max"]
    } for elo_bucket in per_elo_stats.per_elo_stats]

@api.route("/per-elo-stats/get-stats/<elo_bucket>")
def get_stats_per_elo_bucket(elo_bucket: str):
    elo_bucket = int(elo_bucket)
    per_elo_stats: storage.PerEloStats = storage.get_entry(storage.PerEloStats)
    print(type(elo_bucket))
    return per_elo_stats.per_elo_stats[elo_bucket]