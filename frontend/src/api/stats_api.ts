
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


export interface AverageGameLengthStat {
    "elo_min": number,
    "elo_max": number,
    "average_length": number
}

export const FetchAverageGameLengthStats = (): Promise<AverageGameLengthStat[]> => {
    return fetch("/api/average-game-length-stats").then(
        response => response.json()
    ).catch(err => {
        console.log("Unable to fetch average length game:")
        console.log(err)
    });
}