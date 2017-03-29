<div id="newmess" ng-controller="NewMessCtrl as vm">

  <div id="dialogs-list" class="can-move-bottom">
		<div class="scroller">
			<vk-dialog ng-repeat="dialog in vm.stg.dialogs"></vk-dialog>
		</div>
  </div>

	<div ng-if="vm.stateParams.peer_id" ui-view ng-controller="ChatCtrl as vm" class="flex messages-list-container" ></div>

	<div class="empty-messages-list-container" ng-if="!vm.stateParams.peer_id">
		<i class="fa fa-comments" aria-hidden="true"></i>
		<translate>Пожалуйста, выберите диалог</translate>
	</div>
</div>
