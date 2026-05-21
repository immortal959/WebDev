CREATE DATABASE web;

\c web

CREATE EXTENSION postgis;

CREATE SCHEMA IF NOT EXISTS d;

CREATE TABLE d.buildings (
    id SERIAL PRIMARY KEY,
    name TEXT,
    description TEXT,
    area DOUBLE PRECISION,
    height DOUBLE PRECISION,
    category TEXT,
    visitedAt DATE,
    geom GEOMETRY(POLYGON, 25830)
);

CREATE TABLE d.streets (
    id SERIAL PRIMARY KEY,
    name TEXT,
    description TEXT,
    length DOUBLE PRECISION,
    lanes INTEGER,
    category TEXT,
    visitedAt DATE,
    geom GEOMETRY(LINESTRING, 25830)
);

CREATE TABLE d.points (
    id SERIAL PRIMARY KEY,
    name TEXT,
    description TEXT,
    category TEXT,
    rating INTEGER,
    priority INTEGER,
    visitedAt DATE,
    geom GEOMETRY(POINT, 25830)
);