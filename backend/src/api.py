from flask import Blueprint
import storage

api = Blueprint('api', __name__)

@api.route("/test")
def test():
    return "Test Passed"

@api.route("/basic-elo-game-stats")
def basic_elo_game_stats():
    basic_stats: storage.BasicStats = storage.get_entry(storage.BasicStats)
    return basic_stats.elo_average_to_nr_games

