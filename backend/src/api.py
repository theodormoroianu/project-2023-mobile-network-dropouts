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
    return [
        {
            "elo_min": 200,
            "elo_max": 300,
            "average_length": 20.4
        },
        {
            "elo_min": 300,
            "elo_max": 400,
            "average_length": 18.5
        }
    ]
