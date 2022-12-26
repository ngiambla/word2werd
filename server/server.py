
# A very simple flask app to query Google's N-Gram API.
from flask import Flask
from flask import request

import requests
import json
import time
import math
from datetime import datetime

from random_word import RandomWords
from PyDictionary import PyDictionary

app = Flask(__name__)

hi_score_by_date = dict()
word_of_the_day = dict()

@app.after_request
def apply_caching(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    return response

@app.route('/get_word_of_the_day', methods=['POST'])
def get_random_word():
    global word_of_the_day

    date = datetime.today().strftime('%Y-%m-%d')
    if date not in word_of_the_day:
        r = RandomWords()
        while True:
            word = r.get_random_word()
            if len(word) >= 5 and len(word) <=7:
                word_of_the_day[date] = word
                break

    return {"word-of-the-day" : word_of_the_day[date]}

@app.route('/get_current_topscoring_word', methods=['POST'])
def get_current_topscoring_word():
    dictionary = PyDictionary()
    date = datetime.today().strftime('%Y-%m-%d')
    valid = False
    if date in hi_score_by_date:
        valid=True
        score = hi_score_by_date[date][0]
        word = hi_score_by_date[date][1]        
        return {"valid" : valid, "hiscore" : score, "word" : word, "definition" : dictionary.meaning(word)}
    return {"valid" : valid}


@app.route('/get_word_freq', methods=['POST'])
def get_word_freq():
    global hi_score_by_date
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

    newchars = int(request.form.get('newchars'))

    score = -10*math.log10(score)
    if newchars > 0:
        score *= (1.0/(2*newchars))

    date = datetime.today().strftime('%Y-%m-%d')
    if date not in hi_score_by_date:
        hi_score_by_date[date] = [score, word]
    if score > hi_score_by_date[date][0]:
        hi_score_by_date[date] = [score, word]

    return {"valid" : valid, "score" : score, "hiscore" : hi_score_by_date[date][0]}
