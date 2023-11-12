function handler(id) {
    document.getElementById("movie." + id).classList.toggle("hidden");
    document.getElementById("movieEdit." + id).classList.toggle("hidden");
}
