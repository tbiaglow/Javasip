// Each brewery needs to have its own database created with sequelize, with an average rating and a collection of reviews

// Routes
app.get("/reviews", function(req, res) {

  // If the main route is hit, then we initiate a SQL query to grab all records.
  // All of the resulting records are stored in the variable "result."
  connection.query("SELECT * FROM actors ORDER BY id", function(err, result) {
    if (err) throw err;
    // We then begin building out HTML elements for the page.
    var html = "<h1> Actors </h1>";

    // Here we begin an unordered list.
    html += "<ul>";

    // We then use the retrieved records from the database to populate our HTML file.
    for (var i = 0; i < result.length; i++) {
      html += "<li><p> ID: " + result[i].id + "</p>";
      html += "<p>Actor: " + result[i].name + " </p>";
      html += "<p>Coolness: " + result[i].coolness_points + " </p>"
      html += "<p>Attitude: " + result[i].attitude + "<p></li>"
    }

    // We close our unordered list.
    html += "</ul>";

    // Finally we send the user the HTML file we dynamically created.
    res.send(html);
  });
});

app.get("/coolness", function(req, res) {
      // If the main route is hit, then we initiate a SQL query to grab all records.
  // All of the resulting records are stored in the variable "result."
  connection.query("SELECT * FROM actors ORDER BY coolness_points DESC", function(err, result) {
    if (err) throw err;
    // We then begin building out HTML elements for the page.
    var html = "<h1> Actors </h1>";

    // Here we begin an unordered list.
    html += "<ul>";

    // We then use the retrieved records from the database to populate our HTML file.
    for (var i = 0; i < result.length; i++) {
      html += "<li><p> ID: " + result[i].id + "</p>";
      html += "<p>Actor: " + result[i].name + " </p>";
      html += "<p>Coolness: " + result[i].coolness_points + " </p>"
      html += "<p>Attitude: " + result[i].attitude + "<p></li>"
    }

    // We close our unordered list.
    html += "</ul>";

    // Finally we send the user the HTML file we dynamically created.
    res.send(html);
  })
})

app.get("/attitude-chart/:att", function(req, res) {
    // If the main route is hit, then we initiate a SQL query to grab all records.
// All of the resulting records are stored in the variable "result."
connection.query("SELECT * FROM actors WHERE attitude = ?", [req.params.att], function(err, result) {
  if (err) throw err;
  // We then begin building out HTML elements for the page.
  var html = "<h1> Actors </h1>";

  // Here we begin an unordered list.
  html += "<ul>";

  // We then use the retrieved records from the database to populate our HTML file.
  for (var i = 0; i < result.length; i++) {
    html += "<li><p> ID: " + result[i].id + "</p>";
    html += "<p>Actor: " + result[i].name + " </p>";
    html += "<p>Coolness: " + result[i].coolness_points + " </p>"
    html += "<p>Attitude: " + result[i].attitude + "<p></li>"
  }

  // We close our unordered list.
  html += "</ul>";

  // Finally we send the user the HTML file we dynamically created.
  res.send(html);
})
})