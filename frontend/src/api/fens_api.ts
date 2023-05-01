
export const FetchDummyFens = (): Promise<string[]> => {
    return fetch("/api/dummy-game-fens").then(
        response => response.json()
    ).catch(err => {
        console.log("Unable to fetch fens:")
        console.log(err)
    });
}