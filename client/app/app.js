'use strict';

import angular from 'angular';
import ngAnimate from 'angular-animate';
import ngCookies from 'angular-cookies';
import ngResource from 'angular-resource';
import ngSanitize from 'angular-sanitize';
import 'angular-socket-io';
import ngMap from 'ngmap';
import uiRouter from 'angular-ui-router';
import uiBootstrap from 'angular-ui-bootstrap';
// import ngMessages from 'angular-messages';
//import ngValidationMatch from 'angular-validation-match';
import angularFx from 'ng-fx';
import notification from 'angular-ui-notification';
import mdIcons from 'angular-material-icons';
import clipBoard from 'ngclipboard';
import {
  routeConfig,
  cacheConfig
} from './app.config';

import angularCache from 'angular-cache';
import 'ng-autocomplete';
import _Auth from '../components/auth/auth.module';
import account from './account';
import admin from './admin';
import navbar from '../components/navbar/navbar.component';
import footer from '../components/footer/footer.component';
import main from './main/main.component';
import constants from './app.constants';
import util from '../components/util/util.module';
import socket from '../components/socket/socket.service';
import accordion from 'v-accordion';

import family from './family/family.module';
import volunteer from './volunteer/volunteer.module';
import eventModule from './event/event.module';
import routeModule from './route/route.module';
import cardModule from '../components/card/card.module';
import stickyIcon from '../components/stickyIcon/stickyIcon.module';
import loaderModule from '../components/loader/loader.module';

import './app.scss';

angular.module('b7beetApp', [
  ngAnimate,
  ngCookies,
  ngResource,
  ngSanitize,
  'btford.socket-io',
  uiRouter,
  uiBootstrap,
  // ngMessages,
  ngMap,
  'ngAutocomplete',
  accordion,
  cardModule,
  angularFx,
  mdIcons,
  notification,
  clipBoard,
  angularCache,
  // ngValidationMatch,
  _Auth,
  account,
  admin,
  navbar,
  footer,
  main,
  constants,
  socket,
  util,
  family,
  volunteer,
  eventModule,
  loaderModule,
  stickyIcon,
  routeModule
])
  .config(($httpProvider) => {
    'ngInject';
    $httpProvider.interceptors.push("httpRequestInterceptorFactory");
  })
  .factory('httpRequestInterceptorFactory', function ($rootScope) {
    'ngInject';
    return {
      'responseError': function (rejection) {
        // do something on error
        if (rejection.status === 404) {
          $rootScope.$broadcast('404', rejection)
        }
        return;
      }
    };
  })
  .config(routeConfig)
  .config(cacheConfig)
  .run(function ($rootScope, $location, Auth) {
    'ngInject';
    // Redirect to login if route requires auth and you're not logged in

    $rootScope.$on('$stateChangeStart', function (event, next) {
      Auth.isLoggedIn(function (loggedIn) {
        if (next.authenticate && !loggedIn) {
          $location.path('/login');
        }
      });
    });
  });

angular.element(document)
  .ready(() => {
    angular.bootstrap(document, ['b7beetApp'], {
      strictDi: true
    });
  });

