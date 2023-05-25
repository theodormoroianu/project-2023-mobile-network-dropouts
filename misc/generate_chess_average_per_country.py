import os
from collections import defaultdict

try:
    data = open("standard_rating_list.txt", "r").readlines()[1:]
except:
    os.system("wget http://ratings.fide.com/download/standard_rating_list.zip")
    os.system("unzip standard_rating_list.zip")
    data = open("standard_rating_list.txt", "r").readlines()[1:]


def parse_line(line):
    # returns name, country code, rating
    return line[15:76].strip(), line[76:79], int(line[113:117])

countries = defaultdict(lambda: [])

for player, country, rating in [parse_line(i) for i in data]:
    countries[country].append((rating, player))

OUTPUT_FILE = "country_code_to_rating.csv"
data = []

for country in countries:
    max_rating = max(countries[country])
    data.append((country, max_rating[0], max_rating[1].replace(',', '')))

data.sort(key=lambda x: x[1], reverse=True)

with open(OUTPUT_FILE, "w") as fout:
    fout.write("code,best_rating,best_player\n")
    for country, rating, name in data:
        fout.write(f"{country},{rating},{name}\n")

PUBLIC_PATH = f"{os.path.dirname(os.path.dirname(__file__))}/frontend/public/map/{OUTPUT_FILE}"
store = input(f"Store to {PUBLIC_PATH} (Y/N)? ")
if store[0] == 'Y' or store[0] == 'y':
    os.system(f"cp {OUTPUT_FILE} {PUBLIC_PATH}")