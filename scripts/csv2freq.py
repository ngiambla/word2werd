import csv
with open("../data/word-freq.csv","rb") as source:
    rdr= csv.reader( source )
    with open("../data/word-freq-clean.csv","wb") as result:
        wtr= csv.writer( result )
        for r in rdr:
            wtr.writerow( (r[0], r[2]))


import json

csvfile = open('../data/word-freq-clean.csv', 'r')
jsonfile = open('../data/word-freq-clean.json', 'w')

fieldnames = ("ngram","cumshare")
reader = csv.DictReader( csvfile, fieldnames)
dc = dict()
skip = False
for row in reader:
    if not skip:
        skip = True
        continue
    dc[row["ngram"]] = float(row["cumshare"])

json.dump(dc, jsonfile)

# print([ row for row in reader ])
# out = json.dumps( [ row for row in reader ] )
# jsonfile.write(out)