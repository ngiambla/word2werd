CREATE TABLE submissions(
    date_time TEXT,
    word TEXT,
    score FLOAT,
    PRIMARY KEY (date_time)
);

CREATE TABLE daily_word (
    date_time TEXT,
    word TEXT,
    PRIMARY KEY (date_time)
);

