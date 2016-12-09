'use strict';
function routeService(networkService) {

  this.getRouteWithId = function(id){
    return networkService.GET('routes/noAuthWithRouteId/'+ id)
  }

  this.searchRouteByVolunteerPhone = function(phone){
    return networkService.GET(`routes/noAuthWithPhone/${phone}`);
  }
}

export default {
  service: ['networkService', routeService],
  name: 'routeService'
}
