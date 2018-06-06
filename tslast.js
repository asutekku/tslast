#!/usr/bin/env node
var request = require('request');
var cli_arg = process.argv.slice(2);
var api_url = "http://ws.audioscrobbler.com/2.0/?method=";
var config = {
    api_key: '429b2b5ad60a619b6762518140652943'
};
function main() {
    var arguments = parseArgs(cli_arg);
    var method = arguments.method;
    var username = arguments.username;
    getQuery(method, username);
}
function parseArgs(args) {
    var uname = args[1];
    var meth = getMethod(args);
    return { username: uname, method: meth };
}
function getMethod(args) {
    var range;
    var action;
    if (args[0][0] == '-') {
        range = getQueryRange(args[0][1]);
        action = getAction(args[0][1], args[0][2]);
        return range + "." + action;
    }
    return 'error';
}
function getQueryRange(input) {
    return {
        a: 'album',
        A: 'artist',
        c: 'chart',
        g: 'geo',
        T: 'tag',
        t: 'track',
        u: 'user'
    }[input];
}
function getAction(range, input) {
    if (range == 'u') {
        return {
            f: 'getfriends',
            i: 'getinfo',
            l: 'getlovedtracks',
            p: 'getpersonaltracks',
            r: 'getrecenttracks',
            a: 'gettopalbums',
            A: 'gettopartists',
            t: 'gettoptracks',
            T: 'gettoptags'
        }[input];
    }
}
function get_JSON(url) {
    return new Promise(function (resolve, reject) {
        return request(url, { json: true }, function (err, res, body) {
            if (err) {
                return console.log(err);
            }
            resolve(body);
        });
    });
}
function getQuery(method, user) {
    switch (method) {
        case 'user.getrecenttracks':
            Calls.getRecentTracksUser(method, user);
            break;
        case 'user.gettoptracks':
            Calls.getTopTracksUser(method, user);
            break;
        case 'user.getinfo':
            Calls.getInfoUser(method, user);
            break;
    }
}
var Calls = /** @class */ (function () {
    function Calls() {
    }
    Calls.getRecentTracksUser = function (method, user, limit) {
        var api_call = api_string_builder(method, user);
        get_JSON(api_call).then(function (data) {
            try {
                var tracks = data.recenttracks.track.map(function (obj) {
                    return new Track(obj.name, obj.artist['#text'], obj.album['#text'], obj.hasOwnProperty('@attr') ? true : false);
                });
                var count = isNaN(parseInt(limit)) ? 5 : parseInt(limit);
                for (var i = 0; i < count; i++) {
                    var nowPlaying = tracks[i].nowPlaying == true ? '[Now playing]' : '';
                    console.log(">" + tracks[i].toString() + " " + nowPlaying);
                }
            }
            catch (err) {
                console.log('User not found');
            }
        });
    };
    Calls.getTopTracksUser = function (method, user, limit) {
        var api_call = api_string_builder(method, user);
        get_JSON(api_call).then(function (data) {
            try {
                var tracks = data.toptracks.track.map(function (obj) {
                    var track = new Track(obj.name, obj.artist.name);
                    track.playcount = obj.playcount;
                    return track;
                });
                var count = isNaN(parseInt(limit)) ? 5 : parseInt(limit);
                for (var i = 0; i < count; i++) {
                    console.log(">" + tracks[i].toString() + " [" + tracks[i].playcount + " plays]");
                }
            }
            catch (err) {
                console.log("User not found: " + user);
            }
        });
    };
    Calls.getInfoUser = function (method, user, limit) {
        var api_call = api_string_builder(method, user);
        get_JSON(api_call).then(function (data) {
            try {
                var user_1 = new User(data.user.name, parseInt(data.user.playcount), data.user.country, data.user.registered.unixtime, data.user.realname);
                user_1.toString();
            }
            catch (err) {
                console.log("User not found: " + user);
            }
        });
    };
    return Calls;
}());
function api_string_builder(method, user, params) {
    return "" + api_url + method + "&user=" + user + "&api_key=" + config.api_key + "&format=json";
}
var Track = /** @class */ (function () {
    function Track(name, artist, album, nowPlaying) {
        this.name = name;
        this.artist = artist;
        this.album = album;
        this.nowPlaying = nowPlaying;
    }
    Track.prototype.toString = function () {
        return this.artist + " - " + this.name;
    };
    return Track;
}());
var User = /** @class */ (function () {
    function User(username, playcount, country, registered, realname) {
        this.username = username;
        this.playcount = playcount;
        this.country = country;
        this.registered = new Date(registered * 1000);
        this.realname = realname;
    }
    User.prototype.toString = function () {
        console.log(">Username: " + this.username);
        console.log(">Real name: " + this.realname);
        console.log(">From: " + this.country);
        console.log(">Playcount: " + this.playcount);
        console.log(">Registered: " + this.registered.getDate() + "/" + this.registered.getMonth() + "/" + this.registered.getFullYear());
    };
    return User;
}());
main();
