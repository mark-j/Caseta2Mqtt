# Caseta2Mqtt
A gateway to connect a Lutron Caseta Smart Bridge Pro and MQTT.

## Installation
The application must be running on the same network as the Smart Bridge Pro.

### Docker
A docker container is available to host this application, and can be installed by running:
- `docker run -d -p 4600:4600 --mount source=caseta2mqtt,target=/usr/src/app/data markjohnson/caseta2mqtt:latest`

### Node.js
If you have Node.js installed locally, you can run the application by doing the following:
1. Clone or download this repo into a folder.
2. Run `npm run build` to build the application.
3. Run `npm start` to run the application.

### Manually
Running `npm run build`, will compile the source into `./dist`.
The contents of that folder can be copied and run independently.
Executing `index.js` with Node.js will start the application.

## Other Resources
I originally created this for use with [Home Assistant](https://www.home-assistant.io/)
via MQTT. If just want to integrate a Smart Bridge and don't need MQTT, check out this
custom Home Assistant component:
> https://github.com/upsert/lutron-caseta-pro

In my case I wanted to control my Caseta devices over MQTT. There didn't seem to be anything
like this out there at the time, so I decided to build it. It wasn't until after I we nearly
finished that I discovered Zach Wily had started a similar project shortly after that.
Check that project out here:
> https://github.com/zwily/lutron-pro-hub-mqtt

The overall design for this application was heavily inspired by Zwave2Mqtt, which
accomplishes the same thing with Z-Wave. If you've got Z-Wave devices you'd like to
communicate with via MQTT, check out this project:
> https://github.com/OpenZWave/Zwave2Mqtt

The Lutron Caseta Smart Bridge Pro exposes a telnet-based API for communication on a local
network. It's not officially supported but fortunately I didn't have to reverse engineer it,
thanks to this documentation:
> https://www.lutron.com/TechnicalDocumentLibrary/040249.pdf

## Contributing
Anyone is welcome to review the open [issues](https://github.com/mark-j/Caseta2Mqtt/issues)
and pick one to work on, or create a new one. It's a good idea to leave a comment indicating
you plan to work on an issue and discuss the change before you start.

When you're ready to merge your code, create a pull request against the `main` branch.

### Conventional Commits
Try to follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/)
specification for pull request titles. Example: `type: subject`, where `subject` describes
the change in [imperative mood](https://chris.beams.io/posts/git-commit/#imperative), and
`type` is one of the following:
- **feat** - Adding functionality. Example: `feat: support custom topics`
- **fix** - Fixing a bug. Example: `fix: update incorrect validation`
- **chore** - Maintenance or cleanup. Example: `chore: update dependency versions`
- **refactor** - Nonfunctional changes. Example: `refactor: remove unused variable`
- **docs** - Changes to documentation. Example: `docs: add example code`
