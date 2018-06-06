# TSlast

### Last.fm command line client written in Typescript
TSlast is a simple tool to query last.fm api on command line. The client is designed to be as easy to use as possible but versatible at the same time.

## Building
To build the client and install the dependencies, run following commands:

```
cd tslast
npm install
```

## Commands
TSlast is designed to be as easy to use as possible. You need to only provide two arguments for the client to print the information. For an example, the command `tslast -ur asutekku` prints the 5 most recent tracks played by the user asutekku.

The first argument consists of two parts and starts with a `-`. The first character defines the range and the second one defines the action assigned to that range. As of now, it's only possible to query some user stats with the client.

### Actions
```
User:
-ui username : Get user information
-ur username : Get 5 most recent tracks
-ut username : Get 5 most played tracks
```

## License
Feel free to do anything you want to.
