<div class="alert alert-{{alert.type}}" ng-switch="alert.type">

	<a ng-switch-when="simple" ng-href="{{alert.url}}" ng-click="$emit('onAlertClick', alert, true);">
		<header ng-if="alert.header">{{alert.header}}</header>
		<img ng-if="alert.img" ng-src="{{alert.img}}">
		<div ng-if="alert.text">{{alert.text}}</div>
		<b ng-if="alert.ancor">{{alert.ancor}}</b>
		<span ng-if="alert.isClose !== false" translate ng-click="close($event)" translate-context="Всплывающее сообщение">Закрыть</span>
	</a>
</div>
