# Project of Data Visualization (COM-480)

| Student's name | SCIPER |
| -------------- | ------ |
| Emma-Andreea Chirlomez | 352433 |
| Ioan-Alexandru Tifui | 367493 |
| Theodor-Pierre Moroianu | 352351 |

[Milestone 1](#milestone-1) • [Milestone 2](#milestone-2) • [Milestone 3](#milestone-3)

## Milestone 1 (7th April, 5pm)

**10% of the final grade**

This is a preliminary milestone to let you set up goals for your final project and assess the feasibility of your ideas.
Please, fill the following sections about your project.

*(max. 2000 characters per section)*

### Dataset

> Find a dataset (or multiple) that you will explore. Assess the quality of the data it contains and how much preprocessing / data-cleaning it will require before tackling visualization. We recommend using a standard dataset as this course is not about scraping nor data processing.
>
> Hint: some good pointers for finding quality publicly available datasets ([Google dataset search](https://datasetsearch.research.google.com/), [Kaggle](https://www.kaggle.com/datasets), [OpenSwissData](https://opendata.swiss/en/), [SNAP](https://snap.stanford.edu/data/) and [FiveThirtyEight](https://data.fivethirtyeight.com/)), you could use also the DataSets proposed by the ENAC (see the Announcements section on Zulip).

For our project, we decided to use a dataset of chess games played on the [Lichess](https://database.lichess.org/) website, which are publicly available at database.lichess.org. For each of the ***100,000,000*** games played monthly, the dataset contains information about the players (name and ranking), the outcome of the game, and the moves made by the two players throughout the game.

The games are given in the ***PGN*** (Portable Game Notation) format, the standard in chess games encoding, which allows us to easily parse them using online libraries and tools such as PyPGN, providing the handling of such complexly serializable objects out of the box.

To prepare the data for analysis, we had to download the ***30GB*** archive off the website, containing games from November 2022, unzip it, and extract a subset of the games, as working on ***100,000,000*** different games would be close to impossible due to hardware limitations. One potential limitation of our dataset is a bias towards experienced players, as those tend to play more, and the fact that the dataset only includes games played on the [lichess](https://lichess.org/) website, which may not be representative of all chess games played. We do not plan to address the second issue, as we believe that chess players play quite similarly across different chess communities (like [chess.com](http://chess.com/), [lichess](http://lichess.org/), or [chessbase](https://play.chessbase.com/)).

To address the first limitation mentioned above, we plan on carefully handling different "*buckets*" of ***ELO*** (the rating system used to rank chess players), essentially counteracting the varying number of players across ***ELO*** ratings. We plan to test different ways to solve the issue, and to  consider the potential impact of these factors on our analyses and interpretations.

Despite these limitations, we believe our chosen dataset is suitable for our analysis, as it includes a large number of games, which will allow for a wide variety of different analyses and visualizations. By exploring this dataset, we hope to gain insights into the strategies and patterns that are most effective in chess at different skill levels.


### Problematic

> Frame the general topic of your visualization and the main axis that you want to develop.
> - What am I trying to show with my visualization?
> - Think of an overview for the project, your motivation, and the target audience.

The problem we aim to address with our project is discovering patterns and trends in chess games, how they relate to player skill levels, and how different strategies might be or not be effective against others. Specifically, we want to explore whether there are any common opening moves or strategies more frequent at different ***ELO*** ratings, and to try to find a correlation between openings, player ***ELOs***, and the games' outcomes.

We believe that this problem is important for better understanding common pitfalls in the game of chess, and could have practical applications in areas such as chess training or game analysis. By identifying the strategies and patterns that are most and least effective against players at different skill levels, we can help players of all levels improve their game and make more informed decisions during play.

There are several challenges we anticipate facing during our analysis. Firstly, analyzing openings or moves sequences, and being able to determine the type of opening or strategy to use is quite challenging. Secondly, as chess is a complex game, in addition to ***ELO***, many factors can influence the outcome of a game. This means that isolating the reason behind a game's result is highly non-trivial.

If successful, this data visualization project could provide insights into the strategies and patterns that are most effective in chess.



### Exploratory Data Analysis

> Pre-processing of the data set you chose
> - Show some basic statistics and get insights about the data

### Related work


> - What others have already done with the data?
> - Why is your approach original?
> - What source of inspiration do you take? Visualizations that you found on other websites or magazines (might be unrelated to your data).
> - In case you are using a dataset that you have already explored in another context (ML or ADA course, semester project...), you are required to share the report of that work to outline the differences with the submission for this class.

Our interest in using chess datasets for our project was sparked by the groundbreaking achievements of AlphaZero [1], Google’s deep learning algorithm that mastered the game of chess throughout self-play and without any prior human knowledge or input. While AlphaZero’s achievements in chess are impressive, we believe that there is still much to be learned from human players and their strategies.

Adam Comer conducted a similar research to what we aim for in ”Relationship Between Chess Opening Knowledge and Player Rating”.  Adam used a dataset provided by Lichess as well, analyzing the games from the month of April 2017. Since then the number of chess players has increased significantly [2], and we are planning to expand his study using post-pandemic data.
The key differences between Adam's research and our objective are the following:

 - <ins>Length of the games</ins>: Adam only studied ***blitz*** and ***bullet*** games, which typically last only a few minutes. We are planning to also include longer games, which might showcase more complex moves.
- <ins>Grouping of similar ***ELO***</ins>: Adam did not partition games according to the ELO rating of the two opponents. We plan to divide the games in buckets according to the ***ELO*** rating of the players, to better visualize how strategies change with the rating. 
- <ins>Outcome prediction</ins>: Adam does not take into consideration the outcome of the games he analyzes. We are planning to use chess engines such as stockfish to evaluate the impact of each move on the game's possible outcomes.

This study provides useful insights and techniques for analyzing and visualizing chess game data, which can be applied and expanded in our own project. However, we plan to focus more on the relationship between opening moves, win rates and ***ELO***, as well as providing a way to understand the correlation between openings, skill level, game length, and outcomes. Additionally, we plan to use a variety of visualization techniques to present our findings in an engaging and informative manner.

### References
[1] AlphaZero: Shedding new light on chess, shogi, and Go. (2018, December 6). DeepMind. Retrieved April 7, 2023, from https://www.deepmind.com/blog/alphazero-shedding-new-light-on-chess-shogi-and-go

[2] Chess Is Booming! And Our Servers Are Struggling. (2023, January 23). Chess.com. Retrieved April 7, 2023, from https://www.chess.com/blog/CHESScom/chess-is-booming-and-our-servers-are-struggling


## Milestone 2 (7th May, 5pm)

**10% of the final grade**


## Milestone 3 (4th June, 5pm)

**80% of the final grade**


## Late policy

- < 24h: 80% of the grade for the milestone
- < 48h: 70% of the grade for the milestone

