#! /usr/bin/python

"""
!!! THIS IS NOT REALLY PART OF THE PROJECT. THIS FILE IS BEING USED BY THE `GENERATE_DATASET.SH` FILE.
Splits a large pgn file into smaller chunks
"""

import sys
import argparse
import tqdm

FILE = ""
OUTPUT_FOLDER = ""
GAMES_PER_CHUNK = 0
CHUNKS_NAME_PREFIX = ""
MAX_CHUNKS = 10000

def split_pgn_file():
    # total games found so far
    total_nr_games = 0
    # initial archive file
    fin = open(FILE, "rb")
    # last line of the previous chunk, which was not printed
    last_line = b""

    # read chunks
    for chunk_nr in range(MAX_CHUNKS):
        print(f"Creating chunk #{chunk_nr}...")
        fout = open(f"{OUTPUT_FOLDER}/{CHUNKS_NAME_PREFIX}-{chunk_nr:04}.pgn", "wb")
        fout.write(last_line)

        games_left_to_read = GAMES_PER_CHUNK + (1 if last_line == b"" else 0)

        while games_left_to_read > 0:
            last_line = fin.readline()
            
            # reached end of file
            if last_line == b'':
                sys.exit()

            # reached a new game
            if last_line.startswith(b"[Event"):
                games_left_to_read -= 1
            # read all games for chunk
            if games_left_to_read == 0:
                break
                
            # just dump the line
            fout.write(last_line)





def main():
    global FILE, OUTPUT_FOLDER, GAMES_PER_CHUNK, CHUNKS_NAME_PREFIX

    parser = argparse.ArgumentParser(
        prog='pgn_splitter',
        description='Split large pgn into smaller chunks'
    )
    parser.add_argument('large_pgn_filename', help="File to split")
    parser.add_argument('output_folder', help="Folder to put output in")
    parser.add_argument('games_per_chunk', help="Number of games per file")
    parser.add_argument('chunks_name', help="Name of the chunks")

    args = parser.parse_args()


    FILE = args.large_pgn_filename
    OUTPUT_FOLDER = args.output_folder
    GAMES_PER_CHUNK = int(args.games_per_chunk)
    assert GAMES_PER_CHUNK > 0
    CHUNKS_NAME_PREFIX = args.chunks_name

    split_pgn_file()

    print("Done.")

if __name__ == "__main__":
    main()