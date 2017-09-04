'use strict'

const moment = require('moment-timezone')

const request = require('./lib/request')

const parseTime = (time) => {
	const m = moment().tz('Europe/Berlin')
	m.hour(parseInt(time.slice(0, 2)))
	m.minute(parseInt(time.slice(3, 5)))
	return Math.round(m / 1000)
}

const parse = ([coords]) => {
	const trains = []
	for (let c of coords) {
		if (!c[10] || !c[12]) continue
		trains.push({
			name: c[0],
			id: c[3] + '',
			previousStation: {
				type: 'station',
				id: c[10],
				name: c[9],
				departure: c[17] ? parseTime(c[17]) : null
			},
			nextStation: {
				type: 'station',
				id: c[12],
				name: c[11],
				arrival: c[16] ? parseTime(c[16]) : null,
				delay: c[18] ? parseInt(c[18]) * 60 : null // in seconds
			},
			delay: c[6] ? parseInt(c[6]) * 60 : null, // in seconds
			direction: {
				type: 'station',
				// todo: id
				name: c[7]
			}
		})
	}
	// const c = coords.find((c) => c[0].indexOf('278') >= 0 && c[0].indexOf('ICE') >= 0)

	return trains
}

const positions = (when = Date.now(), useHTTPS = true) => {
	const date = moment(when).tz('Europe/Berlin').format('YYYYMMDD')
	const time = moment(when).tz('Europe/Berlin').format('HH:mm:ss')

	return request({
		livemapRequest: 'yes',
		L: 'vs_livefahrplan',
		performLocating: '1',
		performFixedLocating: '1',
		look_requesttime: time,
		ts: date
	})
	.then(parse)
}

module.exports = positions
