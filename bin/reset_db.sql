DROP TABLE reaction_time;
DROP TABLE response;
DROP TABLE time_elapsed;
DROP TABLE ordering;
DROP TABLE timeofaction;

CREATE TABLE reaction_time(
    pid text UNIQUE
);
CREATE TABLE response(
    pid text UNIQUE
);
CREATE TABLE time_elapsed(
    pid text UNIQUE
);
CREATE TABLE ordering(
    pid text UNIQUE
);
CREATE TABLE timeofaction(
    pid text UNIQUE,
    t TIMESTAMP WITH TIME ZONE default CURRENT_TIMESTAMP
);
