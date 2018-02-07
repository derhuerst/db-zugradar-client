'use strict'

const {DateTime} = require('luxon')
const test = require('tape')
const isRoughlyEqual = require('is-roughly-equal')

const positions = require('./positions')
const route = require('./route')



const minute = 60 * 1000
const hour = 60 * minute

const in2H = Date.now() + 2 * hour
const tomorrow = DateTime.fromMillis(Date.now(), {
	zone: 'Europe/Berlin',
	locale: 'de-DE'
})
.plus({days: 1})
.startOf('day')
.valueOf()

// don't buble up to the next day
const when = new Date(Math.min(in2H, tomorrow - minute))
const tomorrow10am = new Date(tomorrow + 10 * hour)

const isValidWhen = t => isRoughlyEqual(30 * hour, +when, t * 1000)



test('positions & routes throw with date other than current', (t) => {
	t.plan(2)
	t.throws(() => positions(tomorrow10am))
	t.throws(() => route('some-id', tomorrow10am))
})



test('positions', (t) => {
	positions(when)
	.then((trains) => {
		for (let train of trains) {
			t.equal(typeof train.name, 'string')
			t.ok(train.name)

			t.equal(typeof train.id, 'string')
			t.ok(train.id)

			if (train.previousStation) {
				const p = train.previousStation
				t.equal(p.type, 'station')

				t.equal(typeof p.id, 'string')
				t.ok(p.id)

				t.equal(typeof p.name, 'string')
				t.ok(p.name)

				if (p.departure) {
					t.equal(typeof p.departure, 'number')
					t.ok(isValidWhen(p.departure))
				}
			}

			if (train.nextStation) {
				const n = train.previousStation
				t.equal(n.type, 'station')

				t.equal(typeof n.id, 'string')
				t.ok(n.id)

				t.equal(typeof n.name, 'string')
				t.ok(n.name)

				if (n.arrival) {
					t.equal(typeof n.arrival, 'number')
					t.ok(isValidWhen(n.arrival))
				}
			}

			if (train.delay) t.equal(typeof train.delay, 'number')

			t.equal(train.direction.type, 'station')
			t.equal(typeof train.direction.name, 'string')
			t.ok(train.direction.name)
		}
		t.end()
	})
	.catch(t.ifError)
})



test('route', (t) => {
	positions(when)
	.then((trains) => route(trains[0].id, when))
	.then((route) => {
		// todo: properly lint the GeoJSON

		t.equal(route.type, 'GeometryCollection')

		for (let g of route.geometries) {
			t.ok(g.type === 'Point' || g.type === 'LineString')
		}

		t.end()
	})
	.catch(t.ifError)
})
