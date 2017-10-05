(function () {
	var myApp = angular.module("myModule", ['gridster']);

myApp.controller("myController", function ($scope, $element, $attrs) {
	$scope.message = "This is AngularJS";
	$scope.gridsterOptions = {
		margins: [20, 20],
		columns: 2,
		dynamicColumns: true,
		width: 'auto',
		resizable: {
			enabled: true,
			handles: ['n', 'e', 's', 'w', 'ne', 'se', 'sw', 'nw'],
			start: function(event, $element, widget) {}, // optional callback fired when resize is started,
			resize: function(event, $element, widget) {}, // optional callback fired when item is resized,
			stop: function(event, $element, widget) {} // optional callback fired when item is finished resizing
		},
		draggable: {
			enabled: false
		}
	};
	$scope.dashboard = {
		widgets: [
			{
				col: 2,
				row: 1,
				sizeY: 2,
				sizeX: 2,
				name: "Widget 1"
			}
		]
	};
	$scope.clear = function() {
		$scope.dashboard.widgets = [];
	};
	$scope.remove = function(widget) {
		$scope.dashboard.widgets.splice($scope.dashboard.widgets.indexOf(widget), 1);
	};
	$scope.addWidget = function() {
		$scope.dashboard.widgets.push({
			name: "New Widget",
			sizeX: 1,
			sizeY: 1
		});
	};
	$scope.addWidget = function(e) {
		$scope.dashboard.widgets.push({
			name: "New Widget",
			sizeX: 1,
			sizeY: 1
		});
		var value=e.target.attributes.id.value;
		console.log(value);
	};


	$scope.standardItems = [
		{ sizeX: 2, sizeY: 1, row: 0, col: 0 },
		{ sizeX: 2, sizeY: 2, row: 0, col: 2 },
		{ sizeX: 1, sizeY: 1, row: 0, col: 4 },
		{ sizeX: 1, sizeY: 1, row: 0, col: 5 },
		{ sizeX: 2, sizeY: 1, row: 1, col: 0 },
		{ sizeX: 1, sizeY: 1, row: 1, col: 4 },
		{ sizeX: 1, sizeY: 2, row: 1, col: 5 },
		{ sizeX: 1, sizeY: 1, row: 2, col: 0 },
		{ sizeX: 2, sizeY: 1, row: 2, col: 1 },
		{ sizeX: 1, sizeY: 1, row: 2, col: 3 },
		{ sizeX: 1, sizeY: 1, row: 2, col: 4 }
	];
});
myApp.controller('CustomWidgetCtrl', ['$scope', '$modal',
	function($scope, $modal) {



		$scope.openSettings = function(widget) {
			$modal.open({
				scope: $scope,
				//templateUrl: 'demo/dashboard/widget_settings.html',
				controller: 'WidgetSettingsCtrl',
				resolve: {
					widget: function() {
						return widget;
					}
				}
			});
		};

	}
]);

myApp.controller('WidgetSettingsCtrl', ['$scope', '$timeout', '$rootScope', '$modalInstance', 'widget',
	function($scope, $timeout, $rootScope, $modalInstance, widget) {
		$scope.widget = widget;

		$scope.form = {
			name: widget.name,
			sizeX: widget.sizeX,
			sizeY: widget.sizeY,
			col: widget.col,
			row: widget.row
		};

		$scope.sizeOptions = [{
			id: '1',
			name: '1'
		}, {
			id: '2',
			name: '2'
		}, {
			id: '3',
			name: '3'
		}, {
			id: '4',
			name: '4'
		}];

		$scope.dismiss = function() {
			$modalInstance.dismiss();
		};

		$scope.remove = function() {
			$scope.dashboard.splice($scope.dashboard.indexOf(widget), 1);
			$modalInstance.close();
		};

		$scope.submit = function() {
			angular.extend(widget, $scope.form);

			$modalInstance.close(widget);
		};

	}
]);
	angular.module('app')
			.directive('nsWidget', ['$compile', function($compile) {
				return {
					restrict: 'AE',
					scope: {
						widget: '='
					},
					link: function(scope, element, attrs) {
						var build = function (html) {
							element.empty().append($compile(html)(scope));
						};
						scope.$watch('widget.template', function (newValue, oldValue){
							if (newValue) {
								build(newValue);
							}
						});
					}
				};
			}]);
})();