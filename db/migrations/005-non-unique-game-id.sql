--------------------------------------------------------------------------------
-- Up
--------------------------------------------------------------------------------

-- Remove UNIQUE constraint from game_id in PublishedEntry
CREATE TABLE PublishedEntry_new (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  game_id     TEXT NOT NULL,
  game_name   TEXT NOT NULL,
  published   INTEGER NOT NULL,
  in_future   INTEGER NOT NULL,
  end_date    INTEGER NOT NULL DEFAULT 0
);

-- Copy data from the old table to the new table
INSERT INTO PublishedEntry_new (id, game_id, game_name, published, in_future, end_date)
SELECT id, game_id, game_name, published, in_future, end_date FROM PublishedEntry;

-- Drop the old table
DROP TABLE PublishedEntry;

-- Rename the new table to the original table name
ALTER TABLE PublishedEntry_new RENAME TO PublishedEntry;

--------------------------------------------------------------------------------
-- Down
--------------------------------------------------------------------------------

-- ! Will probably fail if there are duplicates in game_id

-- Recreate the original table with the UNIQUE constraint on game_id
CREATE TABLE PublishedEntry_old (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  game_id     TEXT NOT NULL UNIQUE,
  game_name   TEXT NOT NULL,
  published   INTEGER NOT NULL,
  in_future   INTEGER NOT NULL,
  end_date    INTEGER NOT NULL DEFAULT 0
);

-- Copy data back to the original table
INSERT INTO PublishedEntry_old (id, game_id, game_name, published, in_future, end_date)
SELECT id, game_id, game_name, published, in_future, end_date FROM PublishedEntry;

-- Drop the modified table
DROP TABLE PublishedEntry;

-- Rename the old table back to the original name
ALTER TABLE PublishedEntry_old RENAME TO PublishedEntry;
