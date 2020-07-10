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
            columnName: 'deletedAt',
            dataType: 'timestamp',
            dataLength: null,
            dataPrecision: null,
            dataScale: null,
            nullable: 'Y'
        }
    });

    Model.defineProperty('isDeleted', {
        type: Boolean,
        required: true,
        default: false,
        mysql: {
            columnName: 'isDeleted',
            dataType: 'tinyint',
            dataLength: null,
            dataPrecision: 1,
            dataScale: 0,
            nullable: 'Y'
        }
    });

    /**
     * Watches destroyAll(), deleteAll(), destroyById() , deleteById(), prototype.destroy(), prototype.delete() methods
     * and instead of deleting object, sets properties deletedAt and isDeleted.
     */
    Model.observe('before delete', async function (ctx, next) {
        return Model.updateAll(ctx.where, { deletedAt: new Date(), isDeleted: true });
    });

    Model.deleteById = async function (id) {
        return Model.updateAll({ id }, { deletedAt: new Date(), isDeleted: true });
    };

    Model.destroyById = async function (id) {
        return Model.updateAll({ id }, { deletedAt: new Date(), isDeleted: true });
    };

    /**
     * Intercepts the data access request and modifies the query to either include or exclude deleted records.
     * Deleted records will be included if "isDeleted" is set to the boolean TRUE at the root level of the query object.
     * The query will not be modified if the "isDeleted" property has been added to the query already.
     * In all other cases, deleted records will be excluded.
     *
     * Note: a record is said to be deleted <=> it's isDeleted property is set to a truthy value.
     */
    Model.observe('access', function logQuery(ctx, next) {
        if (ctx.query.isDeleted === true) {
            return next();
        }

        if (typeof ctx.query.where === 'undefined') {
            ctx.query.where = {};
        }

        let whereString = JSON.stringify(ctx.query.where);

        if (whereString.indexOf('isDeleted') !== -1) {
            return next();
        }

        // If the ID is provided, then direct access is assumed and we let it go through.
        if (typeof ctx.query.where.id !== 'undefined') {
            return next();
        }

        if (ctx.query.where.and) {
            ctx.query.where.and.push({ isDeleted: false });
        } else {
            ctx.query.where.isDeleted = false;
        }

        return next();
    });
};
