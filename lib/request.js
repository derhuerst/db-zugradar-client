'use strict'

const {stringify} = require('querystring')
const {fetch} = require('fetch-ponyfill')({Promise: require('pinkie-promise')})
const ct = require('content-type')
const {decode} = require('iconv-lite')

const endpoint = '//www.apps-bahn.de/bin/livemap/query-livemap.exe/dny'

const request = (query, https) => {
	const target = (https ? 'https:' : 'http:') + endpoint + '?' + stringify(query)

	return fetch(target, {
		cache: 'no-store',
		headers: {
			'user-agent': 'https://github.com/derhuerst/db-zugradar-client'
		},
		json: true
	})
	.then((res) => {
		if (!res.ok) {
			const err = new Error('response not ok: ' + res.status)
			err.statusCode = res.status
			throw err
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
		return data
	})
}

module.exports = request
