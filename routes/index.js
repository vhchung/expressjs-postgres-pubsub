'use strict';

let express = require('express');
let router = express.Router();
let conString = "postgres://vhchung@localhost/cinema";
let pg = require('pg');
let Promise = require('bluebird');

/* GET home page. */
router.get('/', function (req, res) {
    let query = 'SELECT * FROM room';
    pg.connect(conString, function (err, client, done) {
        if (err) {
            console.log(err);
        }
        let q = new Promise(function (fulfill, reject) {
            client.query(query, function (err, result) {
                if (err) {
                    reject(err)
                } else fulfill(result);
            });
        }).then(function (room) {
                client.end();
                res.render('index', {
                    title: 'Cinema',
                    rooms: room.rows
                });
            }).catch(function (err) {
                console.error('error running query', err);
                res.sendStatus(500);
            });
    });
});

router.get('/room/:roomId', function (req, res) {
    let query1 = 'SELECT * FROM room WHERE id=' + req.params.roomId;
    let query2 = 'SELECT * FROM book_ticket WHERE room_id=' + req.params.roomId;
    pg.connect(conString, function (err, client) {
        if (err) {
            console.log(err);
        }
        Promise.all([
            new Promise(function (fulfill, reject) {
                client.query(query1, function (err, result) {
                    if (err) {
                        reject(err)
                    } else fulfill(result);
                });
            }),
            new Promise(function (fulfill, reject) {
                client.query(query2, function (err, result) {
                    if (err) {
                        reject(err)
                    } else fulfill(result);
                });
            })
        ]).then(function (results) {
            client.end();
            let seats = results[1].rows,
                booked = [];
            seats.forEach(function (s) {
                booked.push(s.row + '-' + s.seat_number);
            });
            res.render('book-ticket', {
                title: 'Book ticket',
                room: results[0].rows[0],
                booked: booked
            });
        }).catch(function (err) {
            console.error('error running query', err);
            res.sendStatus(500);
        });
    });
});

module.exports = router;
