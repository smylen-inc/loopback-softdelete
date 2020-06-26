/**
 * Tests inspired by https://github.com/clarkbw/loopback-ds-timestamp-mixin
 */

let test = require('tap').test;

const app = require('loopback');

// https://github.com/strongloop/loopback-boot/blob/master/lib/executor.js#L57-L71
// the loopback-boot module patches in the loopback attribute so we can assume the same
app.loopback = require('loopback');

let dataSource = app.createDataSource({
    connector: app.Memory
});

// import soft delete mixin
require('../')(app);

test('loopback soft delete', function (tap) {
    'use strict';

    tap.test('deletedAt', function (t) {

        let Book = dataSource.createModel('Book',
            { name: String, type: String },
            { mixins: { SoftDelete: true } }
        );

        t.test('there should be no records found on database', function (tt) {
            Book.create({ name: 'book 1', type: 'fiction' }, function (err, book) {
                Book.destroyAll(function () {
                    Book.count(function (err, count) {
                        tt.equal(0, count);
                        tt.end();
                    });
                });
            });
        });

        t.test('should be records found on database', function (tt) {
            Book.create({ name: 'book 1', type: 'fiction' }, function (err, book) {
                Book.destroyAll(function () {
                    Book.find({ isDeleted: true }, function (err, records) {
                        tt.notEqual(records.length, 0);
                        tt.end();
                    });
                });
            });
        });

        t.test('should be no records on database when where is undefined', function (tt) {
            Book.create({ name: 'book 1', type: 'fiction' }, function (err, book) {
                Book.destroyAll(function () {
                    Book.find(function (err, records) {
                        tt.equal(records.length, 0);
                        tt.end();
                    });
                });
            });
        });

        t.test('should be records found on database when explicitly using the isDeleted parameter in the query', function (tt) {
            Book.create({ name: 'book 1', type: 'fiction' }, function (err, book) {
                Book.destroyAll(function () {
                    Book.find({ where: { isDeleted: true } }, function (err, records) {
                        tt.notEqual(records.length, 1);
                        tt.end();
                    });
                });
            });
        });

        t.end();

    });

    tap.test('isDeleted', function (t) {

        let Book = dataSource.createModel('Book',
            { name: String, type: String },
            { mixins: { SoftDelete: true } }
        );

        t.test('should be with isDeleted false', function (tt) {
            Book.create({ name: 'book 1', type: 'fiction' }, function (err, book) {
                tt.equal(book.isDeleted, false);
                tt.end();
            });
        });

        t.test('should be with isDeleted true', function (tt) {
            Book.create({ name: 'book 1', type: 'fiction' }, function (err, book) {
                var bookId = book.id;
                Book.destroyAll(function () {
                    Book.findById(bookId, function (err, b) {
                        tt.equal(b.isDeleted, true);
                        tt.end();
                    });
                });
            });
        });

        t.test('destroyById should set isDeleted to true', function (tt) {
            Book.create({ name: 'book 1', type: 'fiction' }, async function (err, book) {
                var bookId = book.id;
                await Book.destroyById(bookId);
                let b = await Book.findById(bookId);
                tt.equal(b.isDeleted, true);
                tt.end();
            });
        });

        t.test('should be with isDeleted true after destroyAll', async function (tt) {
            let book = await Book.create({ name: 'book 1', type: 'fiction' });
            let bookId = book.id;

            await Book.destroyAll();

            let records = await Book.find({ where: { id: bookId, isDeleted: true } });
            records = records.shift();
            tt.equal(records.isDeleted, true);

            let singleRecord = await Book.findOne({ where: { id: bookId, isDeleted: true } });
            tt.equal(singleRecord.isDeleted, true);

            singleRecord = await Book.findById(bookId);
            tt.equal(singleRecord.isDeleted, true);

            tt.end();
        });

        t.end();

    });

    tap.end();

});