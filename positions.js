'use strict'

const {DateTime} = require('luxon')

const formatDateTime = require('./lib/format-date-time')
const request = require('./lib/request')

const parseWhen = (date, time) => {
	date = date.split('.') // DD.MM.YYYY
	if (date.length !== 3) throw new Error('invalid date: ' + date)

	date = [
		('20' + date[2]).slice(-4),
		date[1],
		date[0]
	].join('-')
	time = [
		time.slice(0, 2),
		time.slice(3, 5)
	].join(':')

	const m = DateTime.fromISO(date + 'T' + time, {zone: 'Europe/Berlin'})
	return Math.round(m / 1000)
}

const parse = ([coords]) => {
	const trains = []
	for (let c of coords) {
		if (!c[10] || !c[12]) continue
		trains.push({
			name: c[0] && c[0].replace(/\s+/, ' ') || null,
			id: c[3] + '',
			previousStation: {
				type: 'station',
				id: c[10],
				name: c[9],
				departure: c[17] ? parseWhen(c[13], c[17]) : null
			},
			nextStation: {
				type: 'station',
				id: c[12],
				name: c[11],
				arrival: c[16] ? parseWhen(c[13], c[16]) : null,
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
	// todo

	return trains
}

const positions = (when = Date.now(), useHTTPS = true) => {
	const {date, time} = formatDateTime(+when)
	const currentDate = formatDateTime(Date.now()).date
	if (date !== currentDate) {
		throw new Error('when must be the current day in Berlin timezone')
	}

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
