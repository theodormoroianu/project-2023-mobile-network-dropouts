from flask import Flask
import os
from dotenv import load_dotenv
import api
import argparse
import sys
import generate_data
import shutil
import storage

def start_flask_app():
    print(f"Starting flask app...")
    load_dotenv(verbose=True)

    # disable flask warnings
    cli = sys.modules['flask.cli']
    cli.show_server_banner = lambda *x: None

    app = Flask(__name__)
    app.register_blueprint(api.api, url_prefix='/api')

    app.run(
        host=os.getenv("BACKEND_HOST"),
        port=os.getenv("BACKEND_PORT")
    )

def main():
    parser = argparse.ArgumentParser(
        prog='ChessViz Backend',
        description='Run the ChessViz backend.'
    )
    # clean -> deletes the data/ folder
    # run-api -> runs the Flask API
    # generate-and-run -> generates the data
    parser.add_argument('command', help="What do do.", choices=["clean", "run-api", "generate-data"])
    args = parser.parse_args()

    # change working dir to backend/ for making file manipulation easier
    backend_path = os.path.dirname(os.path.dirname(os.path.realpath(__file__)))
    print(f"Changing project CWD to '{backend_path}'")
    os.chdir(backend_path)

    if args.command == "run-api":
        start_flask_app()
    elif args.command == "generate-data":
        generate_data.generate_data()
    elif args.command == "clean":
        try:
            shutil.rmtree(storage.DATA_PATH)
            print("Data deleted.")
        except:
            print("Unable to delete data (maybe it is already clean?).")
    else:
        raise "Unexpected command."
    

if __name__ == "__main__":
    main()