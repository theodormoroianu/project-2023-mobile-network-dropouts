#! /bin/sh

BASEDIR="$(dirname "$0")/data/"
mkdir $BASEDIR
echo "Changing directory to $BASEDIR"
cd "$BASEDIR"
DATASET_NAME="lichess_db_standard_rated_2017-04.pgn"

# stop if dataset exists
if [ -e $DATASET_NAME ]
then
    echo "Some data seems to already exist."
    # delete the archive if user wants to
    while true; do
        read -p "Do you wish to delete previously generated ${DATASET_NAME} dataset (Y/N)? " yn
        case $yn in
            [Yy]* ) rm $(find . -type f); break;;
            [Nn]* ) echo "Quitting."; exit;;
            * ) echo "Please answer yes or no.";;
        esac
    done
fi

# download the archive if it doesn't already exist
if [ -e ${DATASET_NAME}.zst ]
then
    echo "Archive already downloaded. Skipping the download."
else
    echo "Downloading dataset..."
    wget https://database.lichess.org/standard/${DATASET_NAME}.zst
fi

# install pzst if it doesn't exist
if [ ! -e /usr/bin/pzstd ]
then
    if [ -e /usr/bin/dnf ]
    then
        echo "Installing zstd. Might require sudo password."
        sudo dnf install zstd -y
    else
        echo "You are not running Fedora. TODO: add install for debian."
    fi
fi

# extract the archive
pzstd -d ${DATASET_NAME}.zst

# split the archive
echo "Splitting the archive..."
python3 ../src/pgn_splitter.py "$DATASET_NAME" . 30000 "${DATASET_NAME}-chunk"

# delete the archive if user wants to
while true; do
    read -p "Do you wish to delete the archive ${DATASET_NAME}.zst (Y/N)? " yn
    case $yn in
        [Yy]* ) rm ${DATASET_NAME}.zst; break;;
        [Nn]* ) break;;
        * ) echo "Please answer yes or no.";;
    esac
done
