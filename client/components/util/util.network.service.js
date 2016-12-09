'use strict';
/**
 * This service is encapsulate all the rest requet to the server
 */
 function networkService($http, $location, Notification) {
  //  const _ = lodash;
   var Util = {
     /**
      * GET     /api/GIVIN_URL
      * POST    /api/GIVIN_URL
      * GET     /api/GIVIN_URL/GIVIN_ID
      * PUT     /api/GIVIN_URL/GIVIN_ID
      * DELETE  /api/GIVIN_URL/GIVIN_ID
      */
     buildPath: function() {
       var baseUri = ($location.$$host == 'localhost') ? "http://localhost:" + $location.port() : "";
       var path = (baseUri.slice(-1) == "/") ? "api/" : "/api/";
       return baseUri + path;
     },
     POST: function(endPoint, data) {
       return $http.post(this.buildPath() + endPoint, data).then(handleResponse)
     },
     GET: function(endPoint) {
       return $http.get(this.buildPath() + endPoint).then(handleResponse)
     },
     PUT: function(endPoint, id, data) {
       return $http({
         method: 'PUT',
         url: this.buildPath() + endPoint + "/" + id,
         data: data
       })
     },
     DELETE: function(endPoint, id, data) {
       return $http({
         method: 'DELETE',
         url: this.buildPath() + endPoint + "/" + id,
         data: data
       })
     },
     UPDATE: {},
     SHOW: {},
     make: function(opt){
       return $http(opt)
     }
   };

   return Util;
   function handleResponse(response){
     if(!response) return;
     let code = response.status;
     if      (_.inRange(code, 200, 299)) return responseSuccess(response)
     else if (_.inRange(code, 300, 399)) return redirect(response)
     else if (_.inRange(code, 400, 499)) return clientError(response)
     else if (_.inRange(code, 500, 599)) return serverError(response)
     else return handleError()

   }

   function responseSuccess(response){
     return Promise.resolve(response.data)
   }

   function handleError(type, code){
     let error = {
       type : type ? type : 'error',
       code : code
     }
     return error;
   }

   function redirect(response) {
     // TODO: implement
     return Promise.resolve(response.data);
   }

   function clientError(response) {
     return handleError('clientError', response.status)
   }

   function serverError(response) {
     return handleError('serverError', response.status)
   }
 }

export default {
  name: 'networkService',
  service: ['$http', '$location', 'Notification', networkService]
}
