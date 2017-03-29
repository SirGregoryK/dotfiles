
	<div id="messages-list">
		<div class="preloader" ng-if="!vm.currentMessMap.items || vm.currentMessMap.items.length < 1"></div>
		<vk-message ng-repeat="message in vm.currentMessMap.items track by message.id"></vk-message>
		<div ng-if="vm.currentMessMap.isMore" class="loadMore"><button ng-click="vm.loadMore(vm.currentMessMap.peer_id)" translate>Загрузить ещё</button></div>
	</div>

	<form class="sendMess" ng-submit="vm.sendMessage($event)">
		<textarea type="text" rows="1" ng-model="vm.message" required placeholder="{{'Введите ваше сообщение'|translate}}" ng-keydown="$event.keyCode == 13 && !$event.shiftKey && vm.sendMessage($event)" focus-if msd-elastic></textarea>
		<button type="submit"><i class="fa fa-paper-plane" aria-hidden="true"></i></button>
	</form>
