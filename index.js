import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "movies",
    password: "posthaski",
    port: 5432,
});
db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// Function to retrieve the items from the database
async function retrieveMovies() {
    const result = await db.query(
        "SELECT * FROM watched_movies ORDER BY id ASC;"
    );
    return result.rows;
}

// GET REQUEST
app.get("/", async (req, res) => {
    const movies = await retrieveMovies();
    res.render("index.ejs", {
        listMovies: movies,
    });
});

// GET REQUEST
app.get("/new", async (req, res) => {
    res.render("new.ejs");
});

// ADD FUNCTION
app.post("/add", async (req, res) => {
    const newEntry = req.body;
    console.log(newEntry);

    try {
        await db.query(
            "INSERT INTO watched_movies (name, rating, comment) VALUES ($1,$2,$3)",
            [newEntry.movieName, newEntry.movieRating, newEntry.movieComment]
        );
        res.redirect("/");
    } catch (err) {
        console.log(err);
        return res.status(400).send({
            message: "Something went wrong.",
        });
    }
});

// EDIT FUNCTION
app.post("/edit", async (req, res) => {
    const editEntry = req.body;

    try {
        await db.query(
            "UPDATE watched_movies SET name = ($1), rating = ($2), comment = ($3) WHERE id = ($4) ",
            [
                editEntry.movieName,
                editEntry.movieRating,
                editEntry.movieComment,
                editEntry.id,
            ]
        );
        res.redirect("/");
    } catch (err) {
        console.log(err);
    }
});

// DELETE FUNCTION
app.post("/delete", async (req, res) => {
    const deleteItem = req.body.deleteMovieId;
    try {
        await db.query("DELETE FROM watched_movies WHERE id = ($1); ", [
            deleteItem,
        ]);
        res.redirect("/");
    } catch (err) {
        console.log(err);
    }
});

// LISTEN FUNCTION
app.listen(port, () => {
    console.log(`Server running on port: ${port}`);
});
