from flask import Flask
import os
from dotenv import load_dotenv
import api

app = Flask(__name__)
app.register_blueprint(api.api, url_prefix='/api')

def main():
    load_dotenv(verbose=True)
    print(f"Starting flask app...")
    app.run(
        host=os.getenv("BACKEND_HOST"),
        port=os.getenv("BACKEND_PORT")
    )

if __name__ == "__main__":
    main()