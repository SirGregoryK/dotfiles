<section class="flex">
	<aside ng-controller="SidebarCtrl as sidebar">
		<li>
			<a ng-href="https://vk.com/id{{sidebar.stg.user_id}}" >
				<i class="left_icon l_pr" aria-hidden="true"></i>
				<translate>Моя Страница</translate>
			</a>
		</li>
		<li>
			<a ng-href="https://vk.com/feed" >
				<i class="left_icon l_nwsf" aria-hidden="true"></i>
				<translate>Новости</translate>
			</a>
		</li>
		<li>
			<a vk-href="https://vk.com/im" ui-sref="dialogs">
				<i class="left_icon l_msg" aria-hidden="true"></i>
				<translate>Сообщения</translate>
				<span class="counter" ng-if="sidebar.stg.counter.messages">+{{sidebar.stg.counter.messages|kFilter}}</span>
			</a>
		</li>
		<li>
			<a ng-if="!sidebar.stg.counter.friends" vk-href="https://vk.com/friends" ui-sref="friends.all">
				<i class="left_icon l_fr" aria-hidden="true"></i>
				<translate>Друзья</translate>
			</a>
			<a ng-if="sidebar.stg.counter.friends" vk-href="https://vk.com/friends?section=all_requests" ui-sref="friends.requests">
				<i class="left_icon l_fr" aria-hidden="true"></i>
				<translate>Друзья</translate>
				<span class="counter">+{{sidebar.stg.counter.friends|kFilter}}</span>
			</a>
		</li>
		<li>
			<a ng-href="https://vk.com/groups" >
				<i class="left_icon l_gr" aria-hidden="true"></i>
				<translate>Группы</translate>
				<span class="counter" ng-if="sidebar.stg.counter.groups">+{{sidebar.stg.counter.groups|kFilter}}</span>
			</a>
		</li>
		<li>
			<a ng-href="https://vk.com/albums" >
				<i class="left_icon l_ph" aria-hidden="true"></i>
				<translate>Фотографии</translate>
				<span class="counter" ng-if="sidebar.stg.counter.photos">+{{sidebar.stg.counter.photos|kFilter}}</span>
			</a>
		</li>
		<li>
			<a ng-href="https://vk.com/audio" >
				<i class="left_icon l_aud" aria-hidden="true"></i>
				<translate>Аудиозаписи</translate>
			</a>
		</li>
		<li>
			<a ng-href="https://vk.com/video" >
				<i class="left_icon l_vid" aria-hidden="true"></i>
				<translate>Видеозаписи</translate>
				<span class="counter" ng-if="sidebar.stg.counter.videos">+{{sidebar.stg.counter.videos|kFilter}}</span>
			</a>
		</li>
		<li>
			<a ng-href="{{sidebar.stg.counter.app_requests ? 'https://vk.com/apps?tab=notifications' : 'https://vk.com/apps'}}" >
				<i class="left_icon l_ap" aria-hidden="true"></i>
				<translate>Игры</translate>
				<span class="counter" ng-if="sidebar.stg.counter.app_requests">+{{sidebar.stg.counter.app_requests|kFilter}}</span>
			</a>
		</li>
	</aside>

	<div id="friends-list" ng-controller="FriendsCtrl as vm">
		<a
			ng-repeat="user in vm.friends.items | limitTo : (vm.friends.count > 20 ? 19 : 20)"
			class="item"
			title="{{user.first_name}} {{user.last_name}}"
			ui-sref="dialogs.chat({peer_id: user.id})"
			href="https://vk.com/im?sel={{user.id}}"
			vk-href="https://vk.com/im?sel={{user.id}}"
		>
			<div class="overlay"><i class="fa fa-comment"></i></div>
			<user-ava src="user.photo_50"></user-ava>
			<div class="online-indicator ng-scope" ng-if="user.online"></div>
		</a>

		<a
			ng-if="vm.friends.count > 20"
			class="item next"
			title="{{'Все друзья' | translate}}"
			ui-sref="friends.all"
			href="https://vk.com/friends"
			vk-href="https://vk.com/friends"
		>
			<div class="next"><i class="fa fa-arrow-right"></i></div>
		</a>
	</div>
</section>
