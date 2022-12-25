
# A very simple flask app to query Google's N-Gram API.
from flask import Flask
from flask import request

import requests
import json
import time
import math
from datetime import datetime

app = Flask(__name__)

hi_score_by_date = dict()

@app.after_request
def apply_caching(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    return response

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

    score = 0.01
    if r.status_code == 200 and r.json():
        score = r.json()[0]["timeseries"][0]

    attempts = int(request.form.get('attempts'))
    newchars = int(request.form.get('newchars'))

    score = -1*math.log10(score)
    if attempts > 0:
        score *= (1.0/(2*attempts))
    if newchars > 0:
        score *= (1.0/(4*newchars))

    date = datetime.today().strftime('%Y-%m-%d')
    if date not in hi_score_by_date:
        hi_score_by_date[date] = score
    if score > hi_score_by_date[date]:
        hi_score_by_date[date] = score

    return {"score" : score, "hiscore" : hi_score_by_date[date]}
