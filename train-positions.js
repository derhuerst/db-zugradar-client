'use strict'

const moment = require('moment-timezone')
const qs = require('querystring')
const {fetch} = require('fetch-ponyfill')()
const {parse} = require('content-type')
const {decode} = require('iconv-lite')

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
		const {type} = parse(res.headers.get('content-type'))
		if (type !== 'application/json') {
			throw new Error('invalid response type: ' + type)
		}

		return res.buffer()
	})
	.then((raw) => JSON.parse(decode(raw, 'ISO-8859-1')))
}

module.exports = positions
