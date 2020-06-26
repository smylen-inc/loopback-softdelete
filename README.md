Loopback SoftDelete
=============

This module is designed for the [Strongloop Loopback](https://github.com/strongloop/loopback) framework (Version 3). 
It allows entities of any Model to be "soft deleted" by adding `deletedAt` and `isDeleted` attributes to their schema. 
Queries following the standard format will not return these entities; they can only be accessed by adding 
`{ isDeleted: true }` to the query object (at the same level as `where`, `include` etc).

Install
-------

##### NPM
```bash
  npm install --save loopback-softdelete
```

##### YARN
```bash
  yarn add loopback-softdelete
```

Configure
----------

Add the `mixins` property to your `server/model-config.json`:

```json
{
  "_meta": {
    "sources": [
      "loopback/common/models",
      "loopback/server/models",
      "../common/models",
      "./models"
    ],
    "mixins": [
      "loopback/common/mixins",
      "../node_modules/loopback-softdelete",
      "../common/mixins"
    ]
  }
}
```

To use with your Models add the `mixins` attribute to the definition object of your model config.

```json
  {
    "name": "project",
    "plural": "projects",
    "base": "PersistedModel",
    "properties": {
      "name": {
        "type": "string",
        "required": true
      }
    },
    "mixins": {
      "SoftDelete" : true,
    },
  },
```

Add the attributes to your Model's schema
----------

The following is an example for MySQL. Edit accordingly depending on the Database connector of your choice:

```sql
`isDeleted` tinyint(4) NOT NULL DEFAULT '0',
`deletedAt` datetime DEFAULT NULL,
```

Retrieving soft-deleted entities
---------------------------

To run queries that include deleted items in the response, add `{ isDeleted: true }` to the query object (at the same level as `where`, `include` etc).

Testing
---------------------------

Run tests using this command.

```bash
  npm test
```
