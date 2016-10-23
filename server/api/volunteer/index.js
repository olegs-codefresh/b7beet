'use strict';

var express = require('express');
var controller = require('./volunteer.controller');
import * as auth from '../../auth/auth.service';

var router = express.Router();

router.get('/', auth.hasRole('user'), controller.index);
router.get('/:id', auth.hasRole('user'), controller.show);
router.post('/', auth.hasRole('user'), controller.create);
router.put('/:id', auth.hasRole('member'), controller.upsert);
router.patch('/:id', auth.hasRole('member'), controller.patch);
router.delete('/:id', auth.hasRole('manager'), controller.destroy);

module.exports = router;
