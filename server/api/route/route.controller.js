/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/routes              ->  index
 * POST    /api/routes              ->  create
 * GET     /api/routes/:id          ->  show
 * PUT     /api/routes/:id          ->  upsert
 * PATCH   /api/routes/:id          ->  patch
 * DELETE  /api/routes/:id          ->  destroy
 */

'use strict';

import jsonpatch from 'fast-json-patch';
import Route from './route.model';
import Event from '../event/event.model';
import Volunteer from '../volunteer/volunteer.model';
import _ from 'lodash';
import mongoose from 'mongoose';
Route.schema.tree.state.enum

function saveUpdates(updates) {
  return function (route) {
    if (!route) {
      return null;
    }
    var updated    = _.merge(route, updates);
    let families   = [],
        volunteers = [];
    updates.families && updates.families.forEach(f => {
      families.push(mongoose.Types.ObjectId(f._id))
    })
    updates.volunteers && updates.volunteers.forEach(v => {
      volunteers.push(mongoose.Types.ObjectId(v._id))
    })
    return updated.save()
      .then(updated => {
        return updated.update({
          $set: {
            families: families,
            volunteers: volunteers
          }
        });
      });
  };
}

function respondWithResult(res, statusCode) {
  statusCode = statusCode || 200;
  return function (entity) {
    if (entity) {
      return res.status(statusCode).json(entity);
    }
    return null;
  };
}

function patchUpdates(patches) {
  return function (entity) {
    try {
      jsonpatch.apply(entity, patches, /*validate*/ true);
    } catch (err) {
      return Promise.reject(err);
    }

    return entity.save();
  };
}

function removeEntity(res) {
  return function (entity) {
    if (entity) {
      return entity.remove()
        .then(() => {
          res.status(204).end();
        });
    }
  };
}

function handleEntityNotFound(res) {
  return function (entity) {
    if (!entity) {
      res.status(404).end();
      return null;
    }
    return entity;
  };
}

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function (err) {
    console.error('err', err);
    res.status(statusCode).send(err);
  };
}

// Gets a list of Routes
export function index(req, res) {
  return Route.find().exec()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets a single Route from the DB
export function show(req, res) {
  return Route.findById(req.params.id)
    .populate('volunteers')
    .populate('families')
    .exec()
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Creates a new Route in the DB
export function create(req, res) {
  return Route.create(req.body)
    .then(respondWithResult(res, 201))
    .catch(handleError(res));
}

// Upserts the given Route in the DB at the specified ID
export function upsert(req, res) {
  if (req.body._id) {
    delete req.body._id;
  }
  return Route.findOneAndUpdate(req.params.id, req.body, {
    upsert: true,
    setDefaultsOnInsert: true,
    runValidators: true
  }).exec()
    .then(e => {
      console.log('after', e);
      return e;
    })
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Updates an existing Route in the DB
export function patch(req, res) {
  if (req.body._id) {
    delete req.body._id;
  }
  return Route.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(patchUpdates(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Deletes a Route from the DB
export function destroy(req, res) {
  return Route.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(removeFromEvent)
    .then(removeEntity(res))
    .catch(handleError(res));
}

export function showByParent(req, res) {
  return Route.find({
    parent: req.params.id
  }).exec()
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

export function addToSet(req, res) {
  return Route.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(validateState(req.body, res))
    .then(saveUpdates(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

export function showNoAuthRoute(req, res) {
  if (req.params.phone) {
    return Volunteer.findOne({
      phoneNumber: req.params.phone
    })
      .exec()
      .then(handleEntityNotFound(res))
      .then(findRouteForVolunteerId)
      .then(handleEntityNotFound(res))
      .then(respondWithResult(res))
  }
  else if (req.params.id) {
    return Route.findById(req.params.id)
      .populate('volunteers')
      .populate('families')
      .exec()
      .then(handleEntityNotFound(res))
      .then(respondWithResult(res))
      .catch(handleError(res));
  }
  respondWithResult(res)({})
}

function validateState(updates, res) {
  const enumeration = (Route.schema.tree && Route.schema.tree.state &&
                       Route.schema.tree.state.enum) ? Route.schema.tree.state.enum : undefined;
  return function (entity) {
    if (updates.state && enumeration &&
        enumeration.indexOf(updates.state) >= enumeration.indexOf(entity.state)) {
      return entity;
    }
    res.status(401).end();
    return null;
  }
}

function removeFromEvent(routeToRemove) {
  if (!routeToRemove) {
    return null
  }

  return Event.update({
    _id: mongoose.Types.ObjectId(routeToRemove.parent)
  }, {
    $pull: {
      routes: mongoose.Types.ObjectId(routeToRemove._id)
    }
  })
    .then(_ => {
      return routeToRemove
    })
}


function findRouteForVolunteerId(volunteer) {
  if (!volunteer) {
    return null;
  }
  return Route.findOne({
    volunteers: {
      $in: [
        mongoose.Types.ObjectId(volunteer._id)
      ]
    }
  })
    .populate('volunteers')
    .populate('families')
    .exec()
}
