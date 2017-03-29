<div class="container" ng-controller="TabCtrl as vm">
	<ul class="tabs">
		<li ui-sref=".all" ui-sref-opts="{location: 'replace'}" ui-sref-active="active" translate>Все друзья</li>
		<li ng-if="vm.requests" ui-sref=".requests" ui-sref-opts="{location: 'replace'}" ui-sref-active="active" translate>Новые заявки</li>
	</ul>

	<ui-view></ui-view>
</div>
