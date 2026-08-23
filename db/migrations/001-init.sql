--------------------------------------------------------------------------------
-- Up
--------------------------------------------------------------------------------

CREATE TABLE PubGame (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  provider    TEXT NOT NULL,
  game_id     TEXT NOT NULL,
  game_name   TEXT NOT NULL,
  end_date    INTEGER NOT NULL DEFAULT 0,
  pub_status  INTEGER NOT NULL,
  in_future   INTEGER NOT NULL
);

--------------------------------------------------------------------------------
-- Down
--------------------------------------------------------------------------------

DROP TABLE PubGame
