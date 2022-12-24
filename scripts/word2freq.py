'''
word2freq.py: 
Using Google's N-Gram API, we query a words frequency of usage in modern day literature sources.
The frequency is recorded alongside the word in a JSON file.
'''
import requests
import json
import time


def worker(session, word):
    status = "Reading: "+word
    # sending get request and saving the response as response object
    URL="https://books.google.com/ngrams/json?content="+word+"&year_start=2018&year_end=2019&corpus=26"
    r = session.get(url = URL)
    timeToWait = 1
    while r.status_code == 429:
        time.sleep(timeToWait)
        r = session.get(url = URL)
        timeToWait*=2

    if r.status_code != 200 or not r.json():
        # Defaulting here...
        print(status+" ... Default: "+str(r))
        return 1E-10

    print(status+" ... Ok.")
    # Extract Data from Resp in JSON format.
    data = r.json()[0]
    time.sleep(1)
    return data["timeseries"][0]


def main():
    word_freq_dict = dict()
    words = list()
    with open("../data/words.txt", "r") as word_file:
        for word in word_file:
            word = word.strip()
            if len(word) >= 4:
                words.append(word)

    s = requests.Session()
    for word in words:
        word_freq_dict[word] = worker(s, word)
    print("\n")

    with open('../data/word-freq.json', 'w+') as fp:
        json.dump(word_freq_dict, fp)


if __name__ == "__main__":
    main()
