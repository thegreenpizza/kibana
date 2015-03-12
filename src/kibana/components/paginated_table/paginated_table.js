define(function (require) {
  require('modules')
  .get('kibana')
  .directive('paginatedTable', function ($filter, config, Private) {
    var _ = require('lodash');
    var orderBy = $filter('orderBy');

    return {
      restrict: 'E',
      template: require('text!components/paginated_table/paginated_table.html'),
      transclude: true,
      scope: {
        rows: '=',
        columns: '=',
        perPage: '=?',
        sortHandler: '=?',
        showSelector: '=?'
      },
      controllerAs: 'paginatedTable',
      controller: function ($scope) {
        var self = this;
        self.sort = {
          columnIndex: null,
          direction: null
        };

        self.sortColumn = function (colIndex) {
          var col = $scope.columns[colIndex];

          if (!col) return;
          if (col.sortable === false) return;

          var sortDirection;

          if (self.sort.columnIndex !== colIndex) {
            sortDirection = 'asc';
          } else {
            var directions = {
              null: 'asc',
              'asc': 'desc',
              'desc': null
            };
            sortDirection = directions[self.sort.direction];
          }

          self.sort.columnIndex = colIndex;
          self.sort.direction = sortDirection;
          self._setSortGetter(colIndex);
        };

        self._setSortGetter = function (index) {
          if (_.isFunction($scope.sortHandler)) {
            // use custom sort handler
            self.sort.getter = $scope.sortHandler(index);
          } else {
            // use generic sort handler
            self.sort.getter = function (row) {
              var value = row[index];
              if (value && value.value != null) return value.value;
              return value;
            };
          }
        };

        // update the sordedRows result
        $scope.$watch('rows', rowSorter);
        $scope.$watchCollection('paginatedTable.sort', rowSorter);

        function rowSorter() {
          if (self.sort.direction == null) {
            $scope.sortedRows = $scope.rows.slice(0);
            return;
          }

          $scope.sortedRows = orderBy($scope.rows, self.sort.getter, self.sort.direction === 'desc');
        }
      }
    };
  });
});
