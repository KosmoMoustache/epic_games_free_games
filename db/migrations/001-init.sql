--------------------------------------------------------------------------------
-- Up
--------------------------------------------------------------------------------

CREATE TABLE PublishedEntry (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  provider    TEXT NOT NULL,
  game_id     TEXT NOT NULL,
  game_name   TEXT NOT NULL,
  published   INTEGER NOT NULL,
  in_future   INTEGER NOT NULL,
  end_date    INTEGER NOT NULL DEFAULT 0
);

--------------------------------------------------------------------------------
-- Down
--------------------------------------------------------------------------------

DROP TABLE PublishedEntry