'use strict';

export class SearchRouteController {
  constructor(navbarService, routeService, $state, $rootScope, Notification) {
    this.routeService = routeService;
    this.$state       = $state;
    navbarService.disableNavbar();
    $rootScope.$on('404', (rejection) => {
      Notification
        .error({
          message: `
          <div dir="rtl">
          לא נמצא מסלול
          </div>
        `
        });
    })
  }

  find() {
    return this.routeService.searchRouteByVolunteerPhone(this.phone)
      .then((route) => {
        if (!route) {
          this.notFound = true;
          return;
        }
        return this.$state.go('route.id', { route: route });
      })
  }
}

export default {
  component: {
    template: require('./searchRoute.html'),
    controller: ['navbarService', 'routeService', '$state', '$rootScope', 'Notification', SearchRouteController],
    bindings: {}
  },
  name: 'searchRoute'
}
