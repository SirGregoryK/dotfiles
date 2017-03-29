<div ng-if="!message.action" id="message-{{message.id}}" class="message-item-container" ng-class="{out: message.out, unread: !message.read_state}">
	<div user-ava profile-id="message.from_id" ng-if="vm.isGroup() && message.out === 0 && message.from_id !== vm.currentMessMap.items[$index+1].from_id"></div>

	<div class="space" ng-if="vm.isGroup() && message.out === 0 && message.from_id === vm.currentMessMap.items[$index+1].from_id"></div>

	<div class="message-item">
		<b user-name profile-id="message.from_id" ng-if="vm.isGroup() && message.out === 0 && message.from_id !== vm.currentMessMap.items[$index+1].from_id"></b>
		<div ng-bind-html="message.body | linkify | emoji"></div>
		<attachment ng-repeat="attachment in message.attachments"></attachment>
	</div>

	<div class="message-date">
		{{message.date*1000 | date:'HH:mm'}}
	</div>
</div>

<div ng-if="message.action" ng-switch="message.action" id="message-{{message.id}}" class="message-item-container action {{message.action}}">
	<b user-name profile-id="message.from_id"></b>

	<span ng-switch-when="chat_create">
		<translate>создал беседу</translate>
		<br>
		«<b>{{message.action_text}}</b>»
	</span>

	<span ng-switch-when="chat_title_update">
		<translate>изменил название беседы на</translate>
		<br>
		«<b>{{message.action_text}}</b>»
	</span>

	<span ng-switch-when="chat_photo_update">
		<translate>обновил фотографию беседы</translate>
	</span>

	<span ng-switch-when="chat_photo_remove">
		<translate>удалил фотографию беседы</translate>
	</span>

	<span ng-switch-when="chat_kick_user">
		<translate>исключил</translate>
		<b user-name profile-id="message.action_mid"></b>
	</span>

	<span ng-switch-when="chat_invite_user">
		<translate>пригласил</translate>
		<b user-name profile-id="message.action_mid"></b>
	</span>

</div>
