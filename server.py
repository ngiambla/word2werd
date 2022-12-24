
from flask import Flask, request, render_template, g

import requests
import json

import os, sys; sys.path.append(os.path.dirname(os.path.realpath(__file__)))
from w2wcore import W2WCore

app = Flask(__name__)

def w2wcore():
    core = getattr(g, '_w2wcore', None)
    if core is None:
        core = g._w2wcore = W2WCore()
    return core

@app.route('/', methods=['GET'])
def index():
    return render_template('index.html')

@app.route('/get_word_of_the_day', methods=['POST'])
def get_random_word():
    word = w2wcore().get_word_of_day()
    return {"word-of-the-day" : word}

@app.route('/get_current_topscoring_word', methods=['POST'])
def get_current_topscoring_word():
    score_info = w2wcore().get_top_score_of_day()
    if score_info is None:
        return {"valid" : False}
    score_info["valid"] = True
    return score_info


@app.route('/get_word_freq', methods=['POST'])
def get_word_freq():
    word = request.form.get('word')
    newchars = int(request.form.get('newchars'))
    score_info = w2wcore().score_submission(word, newchars)
    if score_info is None:
        return {"valid" : False}    

    score_info["valid"] = True
    return score_info
