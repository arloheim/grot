# GregoRail Open Timetable

**GregoRail Open Timetable (GROT)** is a transit feed and REST API specification that is compatible with the [GregoRail plugin](https://github.com/arloheim/gregorail) for [Paper](https://papermc.io/) Minecraft servers.

## Installation

The provided [Dockerfile](Dockerfile) builds an image that serves the app using NodeJS. An image from this Dockerfile will be built and published to the GitHub Container Registry on every push or pull request using a [GitHub action](.github/workflows/docker-publish.yml).

You can pull the current version of the image with the following command:

```bash
$ docker pull ghcr.io/arloheim/grot:master
```

Other versions of the package can be found [here](https://github.com/arloheim/grot/pkgs/container/grot).

## Local development

Install Node.js and npm, then run the following commands to install the dependencies and serve the app in a development server that watches for file changes using [Nodemon](https://nodemon.io/):

```bash
$ npm install
$ npm run dev
```

## Issues and feature requests

GROT is always open for improvement! Should you encounter a bug while using the app or have a feature request, please [create an issue](https://github.com/arloheim/grot/issues) or, if you have some coding experience, make a [pull request](https://github.com/arloheim/grot/pulls). Note that feature requests are judged on a case-by-case basis and are not guaranteed to be implemented immediately or at all.

## License

GROT is licensed under the GNU LGPL 3.0 license. See the [license file](LICENSE.txt) for more information.
