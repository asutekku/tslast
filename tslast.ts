#!/usr/bin/env node

const request = require('request');
const cli_arg = process.argv.slice(2);
let api_url: string = `http://ws.audioscrobbler.com/2.0/?method=`;

const config = {
    api_key: '429b2b5ad60a619b6762518140652943'
};

function main() {
    const arguments = parseArgs(cli_arg);
    const method = arguments.method;
    const username = arguments.username;
    getQuery(method, username);
}

function parseArgs(args) {
    let uname: string = args[1];
    let meth: string = getMethod(args);
    return { username: uname, method: meth };
}

function getMethod(args: string[]) {
    let range: string;
    let action: string;
    if (args[0][0] == '-') {
        range = getQueryRange(args[0][1]);
        action = getAction(args[0][1], args[0][2]);
        return `${range}.${action}`;
    }
    return 'error';
}

function getQueryRange(input: string) {
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

function getAction(range: string, input: string) {
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

function get_JSON(url: string) {
    return new Promise((resolve, reject) =>
        request(url, { json: true }, (err, res, body) => {
            if (err) {
                return console.log(err);
            }
            resolve(body);
        })
    );
}

function getQuery(method: string, user: string) {
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

class Calls {
    static getRecentTracksUser(method: string, user: string, limit?: string) {
        const api_call: string = api_string_builder(method, user);
        get_JSON(api_call).then(function(data) {
            try {
                const tracks = data.recenttracks.track.map(obj => {
                    return new Track(
                        obj.name,
                        obj.artist['#text'],
                        obj.album['#text'],
                        obj.hasOwnProperty('@attr') ? true : false
                    );
                });
                const count = isNaN(parseInt(limit)) ? 5 : parseInt(limit);
                for (let i = 0; i < count; i++) {
                    let nowPlaying =
                        tracks[i].nowPlaying == true ? '[Now playing]' : '';
                    console.log(`>${tracks[i].toString()} ${nowPlaying}`);
                }
            } catch (err) {
                console.log('User not found');
            }
        });
    }

    static getTopTracksUser(method: string, user: string, limit?: string) {
        const api_call: string = api_string_builder(method, user);
        get_JSON(api_call).then(function(data) {
            try {
                const tracks = data.toptracks.track.map(obj => {
                    let track = new Track(obj.name, obj.artist.name);
                    track.playcount = obj.playcount;
                    return track;
                });
                const count = isNaN(parseInt(limit)) ? 5 : parseInt(limit);
                for (let i = 0; i < count; i++) {
                    console.log(
                        `>${tracks[i].toString()} [${
                            tracks[i].playcount
                        } plays]`
                    );
                }
            } catch (err) {
                console.log(`User not found: ${user}`);
            }
        });
    }

    static getInfoUser(method: string, user: string, limit?: string) {
        const api_call: string = api_string_builder(method, user);
        get_JSON(api_call).then(function(data) {
            try {
                const user = new User(
                    data.user.name,
                    parseInt(data.user.playcount),
                    data.user.country,
                    data.user.registered.unixtime,
                    data.user.realname
                );
                user.toString();
            } catch (err) {
                console.log(`User not found: ${user}`);
            }
        });
    }
}

function api_string_builder(method: string, user: string, params?: string[]) {
    return `${api_url}${method}&user=${user}&api_key=${
        config.api_key
    }&format=json`;
}

class Track {
    public name: string;
    public artist: string;
    public album: string;
    public nowPlaying: boolean;
    public playcount: number;
    constructor(
        name: string,
        artist: string,
        album?: string,
        nowPlaying?: boolean
    ) {
        this.name = name;
        this.artist = artist;
        this.album = album;
        this.nowPlaying = nowPlaying;
    }
    toString() {
        return `${this.artist} - ${this.name}`;
    }
}

class User {
    public username: string;
    public playcount: number;
    public country: string;
    public registered: Date;
    public realname: string;
    constructor(
        username: string,
        playcount: number,
        country: string,
        registered: number,
        realname: string
    ) {
        this.username = username;
        this.playcount = playcount;
        this.country = country;
        this.registered = new Date(registered * 1000);
        this.realname = realname;
    }
    toString() {
        console.log(`>Username: ${this.username}`);
        console.log(`>Real name: ${this.realname}`);
        console.log(`>From: ${this.country}`);
        console.log(`>Playcount: ${this.playcount}`);
        console.log(
            `>Registered: ${this.registered.getDate()}/${this.registered.getMonth()}/${this.registered.getFullYear()}`
        );
    }
}

main();
