--------------------------------------------------------------------------------
-- Up
--------------------------------------------------------------------------------

CREATE TABLE PromoEntry (
  id   				INTEGER PRIMARY KEY AUTOINCREMENT,
  element_id 	TEXT NOT NULL UNIQUE,
	element			TEXT NOT NULL,
  published   INTEGER NOT NULL DEFAULT 0,
  inFuture    INTEGER NOT NULL DEFAULT 0
);

--------------------------------------------------------------------------------
-- Down
--------------------------------------------------------------------------------

DROP TABLE PromoEntry