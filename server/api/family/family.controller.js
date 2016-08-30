/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/families              ->  index
 * POST    /api/families              ->  create
 * GET     /api/families/:id          ->  show
 * PUT     /api/families/:id          ->  upsert
 * PATCH   /api/families/:id          ->  patch
 * DELETE  /api/families/:id          ->  destroy
 */

'use strict';

import _ from 'lodash';
import jsonpatch from 'fast-json-patch';
import Family from './family.model';

function respondWithResult(res, statusCode) {
  statusCode = statusCode || 200;
  return function(entity) {
    if(entity) {
      res.status(statusCode).json(entity);
    }
  };
}

function saveUpdates(updates) {
  return function(entity) {
    var updated = _.merge(entity, updates);
    return updated.save()
      .then(updated => {
        return updated;
      });
  };
}

function patchUpdates(patches) {
  return function(entity) {
    try {
      jsonpatch.apply(entity, patches, /*validate*/ true);
    } catch(err) {
      return Promise.reject(err);
    }

    return entity.save();
  };
}

function removeEntity(res) {
  return function(entity) {
    if(entity) {
      return entity.remove()
        .then(() => {
          res.status(204).end();
        });
    }
  };
}

function handleEntityNotFound(res) {
  return function(entity) {
    if(!entity) {
      res.status(404).end();
      return null;
    }
    return entity;
  };
}

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function(err) {
    res.status(statusCode).send(err);
  };
}


// Gets a list of Familys
export function index(req, res) {
  return Family.find().exec()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets a single Family from the DB
export function show(req, res) {
  return Family.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Creates a new Family in the DB
export function create(req, res) {
  req.body.addedBy = req.user._id;
  return Family.create(req.body)
    .then(respondWithResult(res, 201))
    .catch(handleError(res));
}

// Upserts the given Family in the DB at the specified ID
export function upsert(req, res) {
  if(req.body._id) {
    delete req.body._id;
  }
  req.body.updatedBy = req.user._id;
  console.log(req.body);
  // return Family.findOneAndUpdate(req.params.id, req.body, {upsert: true, setDefaultsOnInsert: true, runValidators: true}).exec()
    return Family.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(saveUpdates(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Updates an existing Family in the DB
export function patch(req, res) {
  if(req.body._id) {
    delete req.body._id;
  }
  return Family.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(patchUpdates(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Deletes a Family from the DB
export function destroy(req, res) {
  return Family.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
}
