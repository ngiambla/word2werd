'''
w2wcore.py: Modules and Utilities Required for Word2Werd's Core Game Logic.
'''

from random_word import RandomWords
from wiktionaryparser import WiktionaryParser
from datetime import datetime


import sqlite3
import math
import json
import time
import requests
import os.path

class DBHandler:
    def __init__(self, db_path = "data/database.db"):
        self.__db_path = db_path

    def query(self, query_str, args=(), one=False):
        db = sqlite3.connect(self.__db_path)
        cur = db.execute(query_str, args)

        # If we are inserting/updating into/a table, commit.
        if "insert" in query_str.lower() or "update" in query_str.lower():
            db.commit()
            return None

        rv = cur.fetchall()
        cur.close()
        db.close()
        return (rv[0] if rv else None) if one else rv

class W2WCore:
    '''
    W2WCore: The Core Logic for Word2Werd.
    '''
    def __init__(self):
        # Create a Parser for Wikitionary.
        self.__parser = WiktionaryParser()
        self.__word_generator = RandomWords()

        # sqlite3 database.
        self.__db = DBHandler()

        # Wait 2 seconds (at least) if we hit a 429 error. 
        self.__429_wait_time = 2

    def __get_date(self):
        return datetime.today().strftime("%Y-%m-%d")

    def __is_word_legal(self, word):
        word_info = self.__parser.fetch(word)
        if not word_info or not word_info[0]["definitions"]:
            # This word does not have a definition on Wiktionary.
            return False
        if len(word) < 5 or len(word) > 7:
            # Choose words between 5 and 7 letters long.
            return False
        if not word.isalpha():
            # Ensure the word ONLY contains letters.
            return False
        return True

    def get_word_of_day(self):
        date = self.__get_date()
        results = self.__db.query("SELECT date_time FROM daily_word WHERE date_time = ?", [date])
        if not results:
            while True:
                word = self.__word_generator.get_random_word()
                word_query = self.__db.query("SELECT word from daily_word WHERE word = ? ", [word])
                if self.__is_word_legal(word) and len(word_query) == 0:
                    self.__db.query("INSERT into daily_word VALUES (?,?)", [date, word])
                    break

        results = self.__db.query("SELECT word FROM daily_word WHERE date_time = ?", [date])
        return results[0][0]

    def __query_google_ngram(self, word):
        # Get Wait time.
        wait_time = self.__429_wait_time
        google_ngram_url ="https://books.google.com/ngrams/json?content="+word+"&year_start=2018&year_end=2019&corpus=26"
        resp = None
        while True:
            resp = requests.get(url = google_ngram_url)
            if resp.status_code != 429:
                break
            time.sleep(wait_time)
            wait_time *= 2

        if resp.status_code == 200 and resp.json():
            frequency = resp.json()[0]["timeseries"][0]
            if frequency > 0.0:
                return frequency           
        return None
    
    def score_submission(self, word, num_newchars):
        if not self.__is_word_legal(word):
            return None
        
        score = self.__query_google_ngram(word)
        if score is None:
            return None
        
        score = -10*math.log10(score)
        if num_newchars > 0:
            score *= (1.0/(2*num_newchars))

        date = self.__get_date()
        results = self.__db.query("SELECT date_time FROM submissions WHERE date_time = ?", [date])
        if not results:
            self.__db.query("INSERT into submissions VALUES (?, ?, ?)", [date, "", 0.0])

        results = self.__db.query("SELECT score, word FROM submissions WHERE date_time = ?", [date])
        hiscore = results[0][0]
        bestword = results[0][1]
        if score > hiscore:
            hiscore = score
            bestword = word
            self.__db.query("UPDATE submissions SET word=?, score=? WHERE date_time=?", [word, score, date])

        submission = {"hiscore" : hiscore, "score" : score, "word" : bestword}
        return submission
    
    def get_top_score_of_day(self):
        date = self.__get_date()
        results = self.__db.query("SELECT score, word FROM submissions WHERE date_time = ?", [date])
        if not results:
            return None
        return {"hiscore" : results[0][0], "word" : results[0][1]}
