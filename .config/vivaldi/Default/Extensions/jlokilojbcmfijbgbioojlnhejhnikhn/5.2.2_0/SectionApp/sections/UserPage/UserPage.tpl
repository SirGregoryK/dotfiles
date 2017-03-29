<div id="user-page-root" ng-controller="UserPageCtrl as vm">
	<div class="preloader" ng-if="!vm.user"></div>

	<div ng-if="vm.user" id="user-page">
		<div class="user-info-container">
			<a class="avatar-container" ng-href="{{vm.user.photo_max_orig}}">
				<img ng-src="{{vm.user.photo_100}}" />
			</a>
			<div class="user-info">
			<div class="header">
				<div class="top">
					<a ng-href="https://vk.com/id{{vm.user.id}}">{{vm.user.first_name}} {{vm.user.last_name}}</a>
					<span class="online-status">
						<span ng-if="vm.user.online">Online</span>
						<span ng-if="!vm.user.online">Offline</span>
					</span>
				</div>
				<div class="status">{{vm.user.status}}</div>
			</div>

			<main>
				<item ng-if="vm.user.bdate">
					<translate class="title">День рождения:</translate>
					<a class="value" ng-href="https://vk.com/search?c[section]=people&c[bday]={{vm.user.bdate_obj.bday}}&c[bmonth]={{vm.user.bdate_obj.bmonth}}&c[byear]={{vm.user.bdate_obj.byear}}">
						{{vm.user.bdate_obj.bday}}
						<span ng-switch="vm.user.bdate_obj.bmonth">
							<translate ng-switch-when="1">января</translate>
							<translate ng-switch-when="2">февраля</translate>
							<translate ng-switch-when="3">марта</translate>
							<translate ng-switch-when="4">апреля</translate>
							<translate ng-switch-when="5">мая</translate>
							<translate ng-switch-when="6">июня</translate>
							<translate ng-switch-when="7">июля</translate>
							<translate ng-switch-when="8">августа</translate>
							<translate ng-switch-when="9">сентября</translate>
							<translate ng-switch-when="10">октября</translate>
							<translate ng-switch-when="11">ноября</translate>
							<translate ng-switch-when="12">декабря</translate>
						</span>
						<span ng-if="vm.user.bdate_obj.byear">{{vm.user.bdate_obj.byear}}</span>
					</a>
				</item>
				<item ng-if="vm.user.country">
					<translate class="title">Страна:</translate>
					<a class="value" ng-href="https://vk.com/search?c[section]=people&c[country]={{vm.user.country.id}}">
						{{vm.user.country.title}}
					</a>
				</item>
				<item ng-if="vm.user.city">
					<translate class="title">Город:</translate>
					<a class="value" ng-href="https://vk.com/search?c[section]=people&c[country]={{vm.user.country.id}}&c[city]={{vm.user.city.id}}">
						{{vm.user.city.title}}
					</a>
				</item>
				<item ng-if="vm.user.relation">
					<translate class="title">Семейное положение:</translate>

					<span class="value" ng-switch="vm.user.relation">
						<span ng-switch-when="1" ng-switch="vm.user.sex">
							<translate class="value" ng-switch-when="1">не замужем</translate>
							<translate class="value" ng-switch-when="2">не женат</translate>
						</span>

						<span ng-switch-when="2" ng-switch="vm.user.sex">
							<translate class="value" ng-switch-when="1">есть друг</translate>
							<translate class="value" ng-switch-when="2">есть подруга</translate>
						</span>

						<span ng-switch-when="3" ng-switch="vm.user.sex">
							<translate class="value" ng-switch-when="1" ng-if="!vm.user.relation_partner">помолвлена</translate>
							<translate class="value" ng-switch-when="1" ng-if="vm.user.relation_partner">помолвлена c</translate>
							<translate class="value" ng-switch-when="2" ng-if="!vm.user.relation_partner">помолвлен</translate>
							<translate class="value" ng-switch-when="2" ng-if="vm.user.relation_partner">помолвлен c</translate>
						</span>

						<span ng-switch-when="4" ng-switch="vm.user.sex">
							<translate class="value" ng-switch-when="1" ng-if="!vm.user.relation_partner">замужем</translate>
							<translate class="value" ng-switch-when="1" ng-if="vm.user.relation_partner">замужем за</translate>
							<translate class="value" ng-switch-when="2" ng-if="!vm.user.relation_partner">женат</translate>
							<translate class="value" ng-switch-when="2" ng-if="vm.user.relation_partner">женат на</translate>
						</span>

						<span ng-switch-when="5">
							<translate class="value">всё сложно</translate>
						</span>

						<span ng-switch-when="6">
							<translate class="value">в активном поиске</translate>
						</span>

						<span ng-switch-when="7" ng-switch="vm.user.sex">
							<translate class="value" ng-switch-when="1" ng-if="!vm.user.relation_partner">влюблена</translate>
							<translate class="value" ng-switch-when="1" ng-if="vm.user.relation_partner">влюблена в</translate>
							<translate class="value" ng-switch-when="2" ng-if="!vm.user.relation_partner">влюблён</translate>
							<translate class="value" ng-switch-when="2" ng-if="vm.user.relation_partner">влюблён в</translate>
						</span>

						<a
						class="relation_partner"
						ui-sref="user({user_id: vm.user.relation_partner.id})"
						href="https://vk.com/id{{vm.user.relation_partner.id}}"
						vk-href="https://vk.com/id{vm.user.relation_partner.id}}"
						ng-if="vm.user.relation_partner && (vm.user.relation == 3 || vm.user.relation == 4 || vm.user.relation == 7)"
						>
							{{vm.user.relation_partner.first_name}} {{vm.user.relation_partner.last_name}}
						</a>
					</span>
				</item>
			</main>
		</div>
		</div>
		<div class="counters">
			<a class="counter" ng-if="vm.user.counters.mutual_friends" ng-href="https://vk.com/friends?id={{vm.user.id}}&section=common">
				<span class="number">{{vm.user.counters.mutual_friends | kFilter}}</span>
				<translate>Общих друзей</translate>
			</a>
			<a class="counter" ng-if="vm.user.counters.friends" ng-href="https://vk.com/friends?id={{vm.user.id}}&section=all">
				<span class="number">{{vm.user.counters.friends | kFilter}}</span>
				<translate>Друзей</translate>
			</a>
			<a class="counter" ng-if="vm.user.counters.followers" ng-href="https://vk.com/friends?id={{vm.user.id}}&section=subscribers">
				<span class="number">{{vm.user.counters.followers | kFilter}}</span>
				<translate>Подписчиков</translate>
			</a>
			<a class="counter" ng-if="vm.user.counters.photos" ng-href="https://vk.com/photos{{vm.user.id}}">
				<span class="number">{{vm.user.counters.photos | kFilter}}</span>
				<translate>Фото</translate>
			</a>
			<a class="counter" ng-if="vm.user.counters.videos" ng-href="https://vk.com/videos{{vm.user.id}}">
				<span class="number">{{vm.user.counters.videos | kFilter}}</span>
				<translate>Видео</translate>
			</a>
			<a class="counter" ng-if="vm.user.counters.audios" ng-href="https://vk.com/audios{{vm.user.id}}">
				<span class="number">{{vm.user.counters.audios | kFilter}}</span>
				<translate>Аудио</translate>
			</a>
		</div>

		<div class="buttons">
			<a class="btn" ng-if="vm.user.can_write_private_message" ui-sref="dialogs.chat({peer_id: vm.user.id})" translate>Написать</a>

			<button ng-if="vm.user.friend_status == 0" ng-switch="vm.user.can_send_friend_request" ng-click="vm.action('add', vm.user.id)">
				<translate ng-switch-when="0">Подписаться</translate>
				<translate ng-switch-when="1">Добавить в друзья</translate>
			</button>

			<button class="simple" ng-if="vm.user.friend_status == 1" ng-switch="vm.user.can_send_friend_request" ng-click="vm.action('delete', vm.user.id)">
				<translate ng-switch-when="0">Отписаться</translate>
				<translate ng-switch-when="1">Отменить заявку</translate>
			</button>

			<button ng-if="vm.user.friend_status == 2" ng-click="vm.action('add', vm.user.id)" translate>Принять</button>
			<button class="simple" ng-if="vm.user.friend_status == 2" ng-click="vm.action('delete', vm.user.id)" translate>Скрыть</button>
			<button class="simple" ng-if="vm.user.friend_status == 2" ng-click="vm.action('ban', vm.user.id)" translate>Заблокировать</button>

			<button class="simple" ng-if="vm.user.friend_status == 3" ng-click="vm.action('delete', vm.user.id)" translate>Удалить из друзей</button>
		</div>
		<!-- <pre style="    text-overflow: ellipsis; overflow: hidden;   max-width: 460px;">{{vm.user|json}}</pre> -->
	</div>

</div>
