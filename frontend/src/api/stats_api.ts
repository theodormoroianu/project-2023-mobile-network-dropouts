
export interface BasicEloGameStat {
    "elo_min": number,
    "elo_max": number,
    "nr_games": number,
    "sample_game": string[]
}

export const FetchBasicEloGameStats = (): Promise<BasicEloGameStat[]> => {
    return fetch("/api/basic-elo-game-stats").then(
        response => response.json()
    ).catch(err => {
        console.log("Unable to fetch basic elo game:")
        console.log(err)
    });
}