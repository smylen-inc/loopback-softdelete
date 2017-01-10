/**
 * Loopback SoftDelete
 *
 * To implement, add "SoftDelete": true in mixins section on YourModel.json file
 *
 * To run queries that include deleted items in the response,
 * add { isDeleted: true } to the query object (at the same level as where, include etc).
 */

module.exports = function (Model, options) {
    Model.defineProperty('deletedAt', {
        type: Date,
        required: false,
        mysql: {
            columnName: "deleted_at",
            dataType: "timestamp",
            dataLength: null,
            dataPrecision: null,
            dataScale: null,
            nullable: "Y"
        }
    });

    Model.defineProperty('isDeleted', {
        type: Boolean,
        required: true,
        default: false,
        mysql: {
            columnName: "is_deleted",
            dataType: "tinyint",
            dataLength: null,
            dataPrecision: 1,
            dataScale: 0,
            nullable: "Y"
        }
    });

    /**
     * Watches destroyAll(), deleteAll(), destroyById() , deleteById(), prototype.destroy(), prototype.delete() methods
     * and instead of deleting object, sets properties deletedAt and isDeleted.
     */
    Model.observe('before delete', function (ctx, next) {
        if (ctx.where === undefined) {
            ctx.where = {'isDeleted': false};
        } else {
            ctx.where = {and: [ctx.where, {'isDeleted': false}]};
        }

        Model.updateAll(ctx.where, {deletedAt: new Date(), isDeleted: true}).then(function (result) {
            next(null);
        }).catch(function (error) {
            next(error);
        });
    });

    /**
     * When ever model tries to access data, we add by default isDeleted: false to where query
     * if there is already in query isDeleted property, then we do not modify query
     */
    Model.observe('access', function logQuery(ctx, next) {
        if (JSON.stringify(ctx.query.where).indexOf('isDeleted') == -1) {
            ctx.query.where.isDeleted = false;
        }
        next();
    });
};
