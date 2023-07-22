const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "moviesData.db");
let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () => {
      console.log("Server is running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
  }
};

initializeDBAndServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};

const convertDirectorDbObjectToResponseObject = (dbObject) => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  };
};

// API 1

app.get("/movies/", async (request, response) => {
  const selectMoviesQuery = `
    select movie_name
    from movie;`;
  const moviesArray = await db.all(selectMoviesQuery);
  response.send(
    moviesArray.map((eachMovie) => ({ movieName: eachMovie.movie_name }))
  );
});

// API 2
app.post("/movies/", async (request, response) => {
  const playerDetails = request.body;
  const { directorId, movieName, leadActor } = playerDetails;
  const addMovieQuery = `
    INSERT INTO movie(director_id,movie_name,lead_actor)
    VALUES(
        ${directorId},
        '${movieName}',
        '${leadActor}'
        )`;
  await db.run(addMovieQuery);
  response.send("Movie Successfully Added");
});

// API 3
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const selectMovieQuery = `
    select
    * from movie
    where movie_id = ${movieId};`;
  const movie = await db.get(selectMovieQuery);
  response.send(convertDbObjectToResponseObject(movie));
});

// API 4

app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const updateMovieQuery = `
  update movie
  SET 
  director_id = ${directorId},
  movie_name = '${movieName}',
  lead_actor = '${leadActor}'
  where movie_id = ${movieId};`;
  const movie = await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

// API 5
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `
  DELETE FROM
  movie
  where movie_id = ${movieId};`;
  await db.run(deleteMovieQuery);
  response.send("Movie Removed");
});

// API 6

app.get("/directors/", async (request, response) => {
  const selectDirectorsQuery = `
    select * from
    director;`;
  const directorsArray = await db.all(selectDirectorsQuery);
  response.send(
    directorsArray.map((eachArray) =>
      convertDirectorDbObjectToResponseObject(eachArray)
    )
  );
});

// API 7
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const selectMovieDirectorQuery = `
    select movie_name
    from movie
    where
    director_id = ${directorId};`;
  const movieDirectorArray = await db.all(selectMovieDirectorQuery);
  response.send(
    movieDirectorArray.map((eachArray) => ({ movieName: eachArray.movie_name }))
  );
});

module.exports = app;
