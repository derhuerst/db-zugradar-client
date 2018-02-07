'use strict'

const {DateTime} = require('luxon')

const zone = 'Europe/Berlin'

const formatDateTime = (when) => {
	when = DateTime.fromMillis(when, {zone})
	return {
		date: when.toFormat('yyyyMMdd'),
		time: when.toFormat('HH:mm:ss')
	}
}

module.exports = formatDateTime
