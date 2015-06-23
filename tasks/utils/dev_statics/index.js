var root = require('requirefrom')('');
var kibana = root('');
var path = require('path');
var glob = require('glob');
var join = path.join;
var rel = join.bind(null, __dirname);
var ROOT = rel('../../../');
var SRC = join(ROOT, 'src');
var NODE_MODULES = join(ROOT, 'node_modules');
var APP = join(SRC, 'kibana');
var TEST = join(ROOT, 'test');
var istanbul = require('./lib/istanbul');
var amdWrapper = require('./lib/amd_wrapper');
var kibanaSrcFilter = require('./lib/kibana_src_filter');

module.exports = new kibana.Plugin({
  name: 'dev_statics',

  init: function (server, options) {


    server.ext('onPreHandler', istanbul({ root: SRC, displayRoot: SRC, filter: kibanaSrcFilter }));
    server.ext('onPreHandler', istanbul({ root: APP, displayRoot: SRC, filter: kibanaSrcFilter }));

    server.route({
      path: '/test/{paths*}',
      method: 'GET',
      handler: {
        directory: {
          path: TEST
        }
      }
    });

    server.route({
      path: '/amd-wrap/{paths*}',
      method: 'GET',
      handler: amdWrapper({ root: ROOT })
    });

    server.route({
      path: '/src/{paths*}',
      method: 'GET',
      handler: {
        directory: {
          path: SRC
        }
      }
    });

    server.route({
      path: '/node_modules/{paths*}',
      method: 'GET',
      handler: {
        directory: {
          path: NODE_MODULES
        }
      }
    });

    server.route({
      path: '/specs',
      method: 'GET',
      handler: function (request, reply) {
        var unit = join(ROOT, '/test/unit/');
        glob(join(unit, 'specs/**/*.js'), function (er, files) {
          var moduleIds = files
            .filter(function (filename) {
              return path.basename(filename).charAt(0) !== '_';
            })
            .map(function (filename) {
              return path.relative(unit, filename).replace(/\\/g, '/').replace(/\.js$/, '');
            });

          return reply(moduleIds);
        });
      }
    });


  }

});
