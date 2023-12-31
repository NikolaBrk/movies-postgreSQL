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

// Initializing global veriables
let sortingBy = "id";
let sortingOrder = "ASC";
let searchInput = "";

// Function to saerch for all movie names that fit the user search input with the
// sorting type and order
async function searchMovies() {
    const querrySearchString =
        "SELECT * FROM watched_movies WHERE LOWER(name) LIKE '%' || $1 || '%' ORDER BY " +
        sortingBy +
        " " +
        sortingOrder +
        ";";
    const result = await db.query(querrySearchString, [searchInput]);
    return result.rows;
}

// GET REQUEST FOR MAIN PAGE
app.get("/", async (req, res) => {
    const movies = await searchMovies();
    console.log(movies);
    res.render("index.ejs", {
        listMovies: movies,
    });
});

app.get("/new", async (req, res) => {
    res.render("new.ejs");
});

// Sort function to retrieve the user desired type (between id and rating)
app.post("/sort", async (req, res) => {
    sortingBy = req.body.sortMovieByType;
    res.redirect("/");
});

// Sort function to retrieve the user desired sort order (ascending or descending)
app.post("/sort-order", async (req, res) => {
    sortingOrder = req.body.sortMovieByOrder;
    res.redirect("/");
});

// Search function to retrieve the user input from the search bar
app.post("/search-input", async (req, res) => {
    const input = req.body.movieName;
    searchInput = input.toLowerCase();
    res.redirect("/");
});

// ADD FUNCTION
app.post("/add", async (req, res) => {
    const newEntry = req.body;

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
