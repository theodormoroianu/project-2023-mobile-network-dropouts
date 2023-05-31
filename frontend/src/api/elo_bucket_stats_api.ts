export type EloBucketListItem = {
  elo_bucket: number;
  elo_min: number;
  elo_max: number;
};

export type EloBucketList = EloBucketListItem[];

/** Returns the list of buckets the backend can offer */
export const FetchEloBucketList = (): Promise<EloBucketList> => {
  return fetch("/api/per-elo-stats/get-elo-buckets")
    .then((response) =>
      response.json().then((eloBucketList) => {
        eloBucketList.sort(
          (a: EloBucketListItem, b: EloBucketListItem) =>
            a.elo_bucket - b.elo_bucket
        );
        return eloBucketList;
      })
    )
    .catch((err) => {
      console.log("Unable to fetch elo buckets:");
      console.log(err);
    });
};

export type GamesWonHeatmapType = {
  games_won: number;
  games_lost: number;
  sample_game: string[];
}[][];

export type PiecesPosHeatmapType = Map<string, number[][]>;

export type MostUsedOpeningsAndFrqType = Map<
  string,
  { nr_games: number; sample_game: string[] }
>;

export type MostUsedTimecontrolsAndFrqType = Map<string, number>;

export type PlayerStatsType = [
  string,
  string,
  string,
  string,
  number,
  number,
  number,
  string
][];

export interface EloBucketStats {
  elo_min: number;
  elo_max: number;
  total_nr_games_in_elo_bucket: number;
  nr_games: number;
  sample_game: string[];
  average_length: number;
  frq_games_by_nr_moves: number[];
  most_used_openings_and_frq: MostUsedOpeningsAndFrqType;
  most_used_timecontrols_and_frq: MostUsedTimecontrolsAndFrqType;
  games_won_heatmap: GamesWonHeatmapType;
  pieces_pos_heatmap: PiecesPosHeatmapType;
  individual_player_stats: PlayerStatsType;
}

/** Given a bucket ID (which is usually the minimal elo / 100),
 * returns a more complete object with the bucket's stats.
 * Some field might overlap with other API endpoints.
 */
export const FetchEloBucketStats = (
  elo_bucket: number
): Promise<EloBucketStats> => {
  return fetch(`/api/per-elo-stats/get-stats/${elo_bucket}`)
    .then((response) => {
      return response.json().then((data) => {
        data["most_used_openings_and_frq"] = new Map(
          Object.entries(data["most_used_openings_and_frq"])
        );
        data["most_used_timecontrols_and_frq"] = new Map(
          Object.entries(data["most_used_timecontrols_and_frq"])
        );
        data["pieces_pos_heatmap"] = new Map(
          Object.entries(data["pieces_pos_heatmap"])
        );
        return data;
      });
    })
    .catch((err) => {
      console.log("Unable to fetch elo buckets stats:");
      console.log(err);
    });
};
