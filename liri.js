
//Requiring my packages and external files
require("dotenv").config();
var keys = require("./keys.js");
var fs = require("fs");
var Spotify = require("node-spotify-api");
var axios = require("axios");
var moment = require("moment");

//Storing my keys, command operators, and search queries
var spotify = new Spotify(keys.spotify);
var bandsKey = keys.bands.key;
var omdbKey = keys.omdb.key;
var command = process.argv[2];
var search = process.argv.slice(3).join(" ");


//Running the function that runs the function that the command line calls for 
liriOperator(command);

//Switch/Case function that tells LIRI what function to run in order to get the desired results, depending on what command was given
function liriOperator(command) {
    switch (command) {
        case "concert-this":
            searchBands(search);
            break;
        case "spotify-this-song":
            searchSpotify(search);
            break;
        case "movie-this":
            searchOmdb(search);
            break;
        case "do-what-it-says":
            readRandom();
            break;
        default:
            console.log("Sorry, try again.")
            break;
    }
};

//API call to Bands-In-Town returning an artist's upcoming concert information for one-word artists only ***
function searchBands(search){
    axios.get("http://rest.bandsintown.com/artists/" + search + "/events?app_id=" + bandsKey)
        .then(function(response){
            if (response.data[0]===undefined){
                console.log("Either the artist you entered is not on tour, or does not exist. Check your spelling.")
            } else {
                console.log(search + " is performing the following shows:");
                for (var i=0;i<response.data.length; i++) {
                    console.log("-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-");
                    console.log(moment(response.data[i].datetime).format("MM/DD/YYYY"));
                    console.log(response.data[i].venue.name);
                    console.log(response.data[i].venue.city + ", " + response.data[i].venue.region + ", " + response.data[i].venue.country);
            }
        }
    })
}



//API call to OMDB that returns movie information for one-word movie titles only ***
function searchOmdb(search){
    axios.get("http://www.omdbapi.com/?t=" + search + "&apikey=" + omdbKey)
        .then(function(response){
        console.log("-=-=-=-=-=-=-=-=-=- " + response.data.Title + " -=-=-=-=-=-=-=-=-=-");
        console.log("• " + response.data.Title + " was released on " + response.data.Released);
        console.log("• IMDB gave " + response.data.Title + " a rating of " + response.data.Ratings[0].Value);
        console.log("• Rotten Tomatoes gave this movie a rating of " + response.data.Ratings[1].Value);
        console.log("• It was produced in " + response.data.Country);
        console.log("• The script is in " + response.data.Language);
        console.log("• Brief description: " + response.data.Plot);
        console.log("• Starring: " + response.data.Actors);
    })
        .catch(function (error) {
        console.log(error);
        searchOmdb("Mr. Nobody");
    })
        .finally(function () {
    });
}

//API call to Spotify that returns song information for one-word song titles only ***
function searchSpotify(search){
    spotify.search({type: "track", query: search, limit: 1})
        .then(function(response){
            console.log('-=-=-=-=-=-=-=-=-=- "' + response.tracks.items[0].name + '" -=-=-=-=-=-=-=-=-=-');
            console.log("• This song is performed by " + response.tracks.items[0].artists[0].name + ".");
            console.log("• Preview the song here: " + response.tracks.items[0].external_urls.spotify);
            console.log('• "' + response.tracks.items[0].name + '" is from the album, ' + response.tracks.items[0].album.name + ".");
        })
        .catch(function (error) {
        console.log(error);
        searchSpotify("The Sign Ace of Base");
    })
        .finally(function () {
    });
}

//Do-What-It-Says Function, reading the random.txt file and using it to call one of LIRI's commands
function readRandom(){
    fs.readFile("random.txt", "utf8", function (err, data) {
        if (err) {
            return console.log(err);
        };
        var array = data.split(",");
        command = array[0];
        search = array[1];
        switch (command) {
            case "spotify-this-song":
                searchSpotify(search);
                break;
            case "movie-this":
                searchOmdb(search);
                break;
            case "concert-this":
                searchBands(search);
                break;

        };
    });
}