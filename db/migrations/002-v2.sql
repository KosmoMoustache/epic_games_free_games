--------------------------------------------------------------------------------
-- Up
--------------------------------------------------------------------------------

CREATE TABLE PublishedEntry (
  id   			INTEGER PRIMARY KEY AUTOINCREMENT,
  game_id 	TEXT NOT NULL UNIQUE,
  game_name TEXT NOT NULL,
  published INTEGER NOT NULL,
  inFuture  INTEGER NOT NULL
);

--------------------------------------------------------------------------------
-- Down
--------------------------------------------------------------------------------

DROP TABLE PublishedEntry