# db-zugradar-client

**Get live departures of [DB](https://bahn.de/) trains.** With help from [*I like trains*](https://media.ccc.de/v/MRMCD15-6986-i_like_trains).

[![npm version](https://img.shields.io/npm/v/db-zugradar-client.svg)](https://www.npmjs.com/package/db-zugradar-client)
[![build status](https://img.shields.io/travis/derhuerst/db-zugradar-client.svg)](https://travis-ci.org/derhuerst/db-zugradar-client)
![ISC-licensed](https://img.shields.io/github/license/derhuerst/db-zugradar-client.svg)
[![chat on gitter](https://badges.gitter.im/derhuerst.svg)](https://gitter.im/derhuerst)


## Installing

```shell
npm install db-zugradar-client
```


## Usage

Note that **you can only query for positions during the current day** (in the `Europe/Berlin` timezone).

```js
const {positions, route} = require('db-zugradar-client')
```

`positions([when], [useHTTPS])` returns a [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/promise) that will resolve with an array of trains, each looking like this:

```js
{
	name: 'IC   842',
	id: '84/260080/18/19/80',
	previousStation: {
		type: 'station',
		id: '8503000',
		name: 'Zürich HB',
		departure: 1493416947 // UNIX timestamp
	},
	nextStation: {
		type: 'station',
		id: '8500218',
		name: 'Olten',
		arrival: 1493416947, // UNIX timestamp
		delay: 0
	},
	delay: 360,
	direction: {
		type: 'station',
		name: 'Bern'
	}
}
```

`previousStation` and `nextStation` are [*Friendly Public Transport Format*](https://github.com/public-transport/friendly-public-transport-format) `station` objects.

Given an `id` of a single train, `route(id, [when], [useHTTPS])` returns a [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/promise) that will resolve with a [GeoJSON `GeometryCollection`](https://tools.ietf.org/html/rfc7946#section-3.1.8), containing [`Point`s](https://tools.ietf.org/html/rfc7946#section-3.1.2) and [`LineString`s](https://tools.ietf.org/html/rfc7946#section-3.1.4).

```js
route('84/260080/18/19/80') // id property from above
.then(console.log, console.error)
```


## Contributing

If you **have a question**, **found a bug** or want to **propose a feature**, have a look at [the issues page](https://github.com/derhuerst/db-zugradar-client/issues).
