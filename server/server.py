
# A very simple flask app to query Google's N-Gram API.
from flask import Flask
from flask import request

import requests
import json
import time
import math
from datetime import datetime
import os.path

from random_word import RandomWords

app = Flask(__name__)


@app.after_request
def apply_caching(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    return response

@app.route('/get_word_of_the_day', methods=['POST'])
def get_random_word():
    date = datetime.today().strftime('%Y-%m-%d')
    db = dict()
    if os.path.isfile("db.json"):
        with open("db.json", 'r') as fh:
            db = json.load(fh)
    if date not in db:
        r = RandomWords()
        while True:
            word = r.get_random_word()
            if len(word) >= 5 and len(word) <=7:
                db[date] = word
                break
        with open("db.json", "w") as fh:
            json.dump(db, fh)

    return {"word-of-the-day" : db[date]}

@app.route('/get_current_topscoring_word', methods=['POST'])
def get_current_topscoring_word():
    date = datetime.today().strftime('%Y-%m-%d')
    valid = False
    db = dict()
    if os.path.isfile("score.json"):
        with open("score.json", 'r') as fh:
            db = json.load(fh)
    if date in db:
        valid=True
        score = db[date][0]
        word = db[date][1]
        return {"valid" : valid, "hiscore" : score, "word" : word}
    return {"valid" : valid}


@app.route('/get_word_freq', methods=['POST'])
def get_word_freq():

    word = request.form.get('word')
    # sending get request and saving the response as response object
    URL="https://books.google.com/ngrams/json?content="+word+"&year_start=2018&year_end=2019&corpus=26"
    r = requests.get(url = URL)
    timeToWait = 1
    while r.status_code == 429:
        time.sleep(timeToWait)
        r = session.get(url = URL)
        timeToWait*=2

    score = 0.00
    valid = False
    if r.status_code == 200 and r.json():
        score = r.json()[0]["timeseries"][0]
        valid = True

    if not valid:
        return {"valid" : valid}

    # Avoid Zero.
    score = max(score, 1e-20)

    newchars = int(request.form.get('newchars'))
    score = -10*math.log10(score)
    if newchars > 0:
        score *= (1.0/(2*newchars))

    hi_score_by_date = dict()
    if os.path.isfile("score.json"):
        with open("score.json", 'r') as fh:
            hi_score_by_date = json.load(fh)

    date = datetime.today().strftime('%Y-%m-%d')
    if date not in hi_score_by_date:
        hi_score_by_date[date] = [score, word]
    if score > hi_score_by_date[date][0]:
        hi_score_by_date[date] = [score, word]

    with open("score.json", "w") as fh:
        json.dump(hi_score_by_date, fh)

    return {"valid" : valid, "score" : score, "hiscore" : hi_score_by_date[date][0]}
