define(function (require) {
  require('elasticsearch');
  var _ = require('lodash');

  var es; // share the client amoungst all apps
  require('modules')
    .get('kibana', ['elasticsearch', 'kibana/config'])
    .service('es', function (esFactory, configFile, $q) {
      if (es) return es;

      es = esFactory({
        host: configFile.elasticsearch,
        log: 'info',
        requestTimeout: 0,
        apiVersion: '1.4',
        plugins: [function (Client, config) {

          // esFactory automatically injects the AngularConnector to the config
          // https://github.com/elastic/elasticsearch-js/blob/master/src/lib/connectors/angular.js
          _.class(CustomAngularConnector).inherits(config.connectionClass);
          function CustomAngularConnector(host, config) {
            CustomAngularConnector.Super.call(this, host, config);

            this.request = _.wrap(this.request, function (request, params, cb) {
              if (String(params.method).toUpperCase() === 'GET') {
                params.query = _.defaults({ _: Date.now() }, params.query);
              }

              return request.call(this, params, cb);
            });
          }

          config.connectionClass = CustomAngularConnector;

        }]
      });

      return es;
    });
});
