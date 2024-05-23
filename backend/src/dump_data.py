import api
import pathlib
import json

def dump_data():
    print("Dumping data...")
    result_path = pathlib.Path("data/api/")
    result_path.mkdir(exist_ok=True)

    print("Dumping basic-elo-game-stats")
    with open(result_path / "basic-elo-game-stats", "w") as f:
        f.write(json.dumps(api.basic_elo_game_stats()))

    print("Dumping average-game-length-stats")
    with open(result_path / "average-game-length-stats", "w") as f:
        f.write(json.dumps(api.average_game_length_stats()))
    
    print("Dumping most-frequent-openings-stats")
    with open(result_path / "most-frequent-openings-stats", "w") as f:
        f.write(json.dumps(api.most_frequent_openings_stats()))

    
    print("Dumping per-elo-stats")
    per_elo_stats = result_path / "per-elo-stats"
    per_elo_stats.mkdir(exist_ok=True)
    with open(per_elo_stats / "get-elo-buckets", "w") as f:
        f.write(json.dumps(api.get_elo_buckets()))
    buckets = api.get_elo_buckets()
    for bucket in buckets:
        file = per_elo_stats / "get-stats" / str(bucket["elo_bucket"])
        file.parent.mkdir(exist_ok=True, parents=True)
        with open(file, "w") as f:
            f.write(json.dumps(api.get_stats_per_elo_bucket(bucket["elo_bucket"])))
    print("Data dumped.")