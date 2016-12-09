'use strict';

export default function routes($stateProvider) {
  'ngInject';
  $stateProvider
  .state('route', {
    url: '/route',
    template: '<route></route>',
  })
  .state('route.search', {
    url: '/search',
    template: '<search-route></search-route>',
  })
  .state('route.id', {
    url: '/:id',
    template: '<route-data></route-data>',
    params: {
      route: null
    }
  });
};
