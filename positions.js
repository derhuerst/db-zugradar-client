'use strict'

const moment = require('moment-timezone')
const qs = require('querystring')
const {fetch} = require('fetch-ponyfill')()
const ct = require('content-type')
const {decode} = require('iconv-lite')

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
				delay: parseInt(c[18]) * 60 // in seconds
			},
			delay: parseInt(c[6]) * 60, // in seconds
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

const positions = (when = Date.now()) => {
	const date = moment(when).tz('Europe/Berlin').format('YYYYMMDD')
	const time = moment(when).tz('Europe/Berlin').format('HH:mm:ss')

	const target = 'https://www.apps-bahn.de/bin/livemap/query-livemap.exe/dny?'
		+ qs.stringify({
			livemapRequest: 'yes',
			L: 'vs_livefahrplan',
			performLocating: '1',
			performFixedLocating: '1',
			look_requesttime: time,
			ts: date
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
	.then((raw) => {
		const data = JSON.parse(decode(raw, 'ISO-8859-1'))
		if (data.error) throw new Error(`error ${data.error}`)
		return parse(data)
	})
}

module.exports = positions
