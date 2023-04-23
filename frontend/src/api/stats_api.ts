
export const FetchBasicEloGameStats = (): Promise<{ "elo_min": number, "elo_max": number, "nr_games": number }[]> => {
    return fetch("/api/basic-elo-game-stats").then(
        response => response.json()
    ).catch(err => {
        console.log("Unable to fetch basic elo game:")
        console.log(err)
    });
}