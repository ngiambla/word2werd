import requests
import json

word_freq_dict = {}

# import asyncio

# def background(f):
#     def wrapped(*args, **kwargs):
#         return asyncio.get_event_loop().run_in_executor(None, f, *args, **kwargs)

#     return wrapped

# @background
def worker(session, word):
    global word_freq_dict

    # sending get request and saving the response as response object
    URL="https://books.google.com/ngrams/json?content="+word+"&year_start=2018&year_end=2019&corpus=26&smoothing=3"
    r = session.get(url = URL)
    if r.status_code != 200 or not r.json():
        return

    # extracting data in json format
    data = r.json()[0]
    word_freq_dict[word] = data["timeseries"][0]
    print("Reading: "+word)


def main():
    words = list()
    with open("words.txt", "r") as word_file:
        for word in word_file:
            word = word.strip()
            if len(word) < 4:
                continue
            words.append(word)

    s = requests.Session()
    for word in words:
        worker(s, word)
    print("\n")

    with open('word-freq.json', 'w+') as fp:
        json.dump(word_freq_dict, fp)


if __name__ == "__main__":
    main()
