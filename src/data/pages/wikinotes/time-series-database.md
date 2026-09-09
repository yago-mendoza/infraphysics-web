---
slug: time-series-database
uid: "E6FbKpqD"
address: "infrastructure//storage//time-series database"
name: "time-series database"
date: "2026-09-06"
aliases: ["TSDB", "InfluxDB", "TimescaleDB"]
---
A database designed for data indexed by time: measurements with a timestamp, tags or labels that describe the source, and the fields that carry values. InfluxDB and TimescaleDB are the usual examples; the model appears everywhere from server observability to IIoT.
- InfluxDB is built for time series from the ground up. TimescaleDB extends PostgreSQL, keeping the whole relational and SQL ecosystem while storing series efficiently. That second design answers a real need: "give me the vibration of every pump from manufacturer X that was producing product Y when a fault occurred" is a time-series question joined with relational context ([[3xSClPzE|data contextualization]]).
- In plants these databases coexist with the older industrial [[OShEuklQ|historian]] rather than replacing it: historian, data lake or cloud, TSDB and SQL each keep a role.

## Interactions

- [[TsrsP0bb|Time Series]] : : The ML note treats a time series as a signal to model; the database is where the raw one lives, and its labels and retention policy decide which questions the model can even be asked
- [[Yr7mSt4N|managed database]] : : A managed relational database optimizes rows and transactions; a time-series store optimizes append-only writes and range scans over time, and TimescaleDB is the attempt to have both in one engine
