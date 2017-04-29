'use strict'

const positions = require('./positions')
const route = require('./route')
const util = require('util')

positions()
.then((trains) => {
	console.log(trains[0])

	return route(trains[0].id)
})
.then((route) => {
	console.log(route)
})
.catch(console.error)
