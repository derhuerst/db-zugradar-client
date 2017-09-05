'use strict'

const moment = require('moment-timezone')

const request = require('./lib/request')

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
	const w = moment(when).tz('Europe/Berlin')
	const date = w.format('YYYYMMDD')
	const currentDate = moment().tz('Europe/Berlin').format('YYYYMMDD')
	if (date !== currentDate) {
		throw new Error('when must be the current day in Berlin timezone')
	}
	const time = w.format('HH:mm:ss')

	return request({
		L: 'vs_livefahrplan',
		look_trainid: id,
		tpl: 'chain2json3',
		performLocating: '16', // todo
		format_xy_n: '', // todo
		look_requesttime: time,
		ts: date
	})
	.then(parse)
}

module.exports = route
