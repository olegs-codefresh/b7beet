'use strict';

export class RouteDataController {
  constructor(navbarService, routeService, $stateParams, $state, $window) {
    navbarService.disableNavbar();
    const ctrl = this;
    ctrl.$window = $window;
    ctrl.route = {};
    if($stateParams.route){
      ctrl.route = $stateParams.route;
    }
    else {
      // TODO: in case that route not found return to search page
      if (!$stateParams.id)
        return $state.go('route.search')
      routeService.getRouteWithId($stateParams.id)
        .then(route => {
          ctrl.route = route;
        })
    }
  }

  waze(family){
    this.$window.location.href ='http://waze.to/?ll=' + family.address.latlng.lat + ',' + family.address.latlng.lng +  '&navigate=yes'
  }
}

export default {
  component: {
    template: require('./routeData.html'),
    controller: ['navbarService', 'routeService', '$stateParams', '$state', '$window', RouteDataController],
    bindings: {}
  },
  name: 'routeData'
}
