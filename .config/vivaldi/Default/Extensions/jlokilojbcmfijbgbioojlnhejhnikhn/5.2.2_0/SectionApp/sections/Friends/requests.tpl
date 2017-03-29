<div id="newfriends" ng-controller="NewFriendsCtrl as vm" class="flex">
	<request user-id="{{user_id}}" ng-repeat="user_id in vm.stg.newfriends"></request>
</div>
