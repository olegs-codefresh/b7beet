'use strict';

export function routeConfig($urlRouterProvider, $locationProvider) {
  'ngInject';

  $urlRouterProvider.otherwise('/');

  $locationProvider.html5Mode(true);
}


export function cacheConfig(CacheFactoryProvider) {
  'ngInject';
  angular.extend(CacheFactoryProvider.defaults, {
    maxAge: 15 * 60 * 1000,
    storageMode: 'sessionStorage'
  });
}

