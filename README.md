# word2werd

A word game, where your objective is to spell a word that is as infrequently used as possible!

## Background
I made this game for my wife; it began as a weird thing I did:

> Hey, if you change these letters of this 'word' it forms this other 'werd' ...

Eventually, I did it enough that she would also play along. For Christmas this year, I decided
to make this into an actual game for her (and our friends/family and maybe YOU to play it).

# Where to Play

Head [here](ngiambla.pythonanywhere.com)!

# Rules
* You are provided with a word.
* You are to form a new word of the same size (same number of characters as the provided word)
* You can use any characters of the English alphabet to form the new word
* The new word cannot be the provided word!
* You get three trys per day!

# Scoring
1. Less frequently used words in modern english provide a higher score (i.e., `grapple` is higher in value than `through`).
2. Try to reuse the characters from the provided word. Every _new_ character in your new word halves your score!

Scores are computed by asking [Google's N-Gram Viewer](https://books.google.com/ngrams/) for the frequency of occurence of the word
you submitted. The frequency (which is generally _very, very_ small) is then mapped to a logarithmic scale (Base 10), and multiplied by -10.
For those non-mathy individuals reading this: this is only to provide a score that is _somewhat_ comprehensible and comparable to others.
Therefore, after scaling, the range of scores are from [0, +INF)! If you want to "cheat" you could look up the word using the N-Gram viewer, and find
out if the frequency of the word is _very_ small... :)

Try to get a high scoring word (i.e., an infrequently used word which reuses (some or all) of the provided word)!

# Installation

Intended for Python 3.10!

```
pip install -r requirements.txt
```

## DB Initialization

```bash
mkdir data;
cat init.sql | sqlite3 data/database.db;
```

NOTE: If you are serving this web app from this directory and have used a different working directory,
then you should replace `data/database.db` with the appropriate root prefixed atop of this!

# Contributor(s)

* Nicholas V. Giamblanco: Core Work
