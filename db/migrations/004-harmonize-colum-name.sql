--------------------------------------------------------------------------------
-- Up
--------------------------------------------------------------------------------

ALTER TABLE PublishedEntry RENAME inFuture to in_future;
ALTER TABLE PublishedEntry RENAME endDate to end_date;

--------------------------------------------------------------------------------
-- Down
--------------------------------------------------------------------------------

ALTER TABLE PublishedEntry RENAME in_future to inFuture;
ALTER TABLE PublishedEntry RENAME end_date to endDate;
