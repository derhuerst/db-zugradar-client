'use strict'

const moment = require('moment-timezone')
const qs = require('querystring')
const {fetch} = require('fetch-ponyfill')()
const ct = require('content-type')
const {decode} = require('iconv-lite')

const parse = ([coords, stations]) => {
	const features = coords.map((c, i) => {
		const point = {
			type: 'Point',
			coordinates: [c[0] / 1000000, c[1] / 1000000]
		}

		const s = stations.find((station) => station[0] === i)
		if (s) point.properties = {name: s[1]}

		return point
	})

	const line = {
		type: 'LineString',
		coordinates: []
	}
	for (let c of coords) {
		line.coordinates.push([
			c[0] / 1000000,
			c[1] / 1000000
		])
	}

	return {
		type: 'GeometryCollection',
		geometries: features.concat(line)
	}
}

const route = (id, when = Date.now()) => {
	const date = moment(when).tz('Europe/Berlin').format('YYYYMMDD')
	const time = moment(when).tz('Europe/Berlin').format('HH:mm:ss')

	const target = 'https://www.apps-bahn.de/bin/livemap/query-livemap.exe/dny?'
		+ qs.stringify({
			L: 'vs_livefahrplan',
			look_trainid: id,
			tpl: 'chain2json3',
			performLocating: '16', // todo
			format_xy_n: '' // todo
		})

	return fetch(target, {
		cache: 'no-store',
		headers: {
			'user-agent': 'https://github.com/derhuerst/db-zugradar-client'
		},
		json: true
	})
	.then((res) => {
		if (!res.ok) {
			throw new Error('response not ok: ' + res.status)
		}
		const {type} = ct.parse(res.headers.get('content-type'))
		if (type !== 'application/json') {
			throw new Error('invalid response type: ' + type)
		}

		return res.buffer()
	})
	.then((raw) => JSON.parse(decode(raw, 'ISO-8859-1')))
	.then(parse)
}

module.exports = route
