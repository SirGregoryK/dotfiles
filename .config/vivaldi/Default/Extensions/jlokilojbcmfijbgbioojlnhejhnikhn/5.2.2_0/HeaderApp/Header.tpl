<header ng-controller="HeaderCtrl as head" class="flex">
	<a ng-show="head.isHome()" class="navbar-brand" ng-href="https://vk.com/club90041499">
		<span class="fa fa-vk fa-3x"></span>
		<translate>Информер</translate>
	</a>
	<a ng-hide="head.isHome()" class="navbar-brand" ng-click="head.back()">
		<span class="fa fa-angle-left fa-3x"></span>
		<translate>Вернуться</translate>
	</a>

	<a ng-class="['notifications', {empty: !head.stg.counter.notifications}]" ng-attr-data-badge="{{head.stg.counter.notifications|kFilter}}" ng-href="https://vk.com/feed?section=notifications">
		<i class="fa fa-bell"></i>
	</a>

	<span ng-class="['dropdown navbar-right',{open: head.isDropdownOpen}]" ng-click="head.isDropdownOpen = !head.isDropdownOpen">
		<a class="profile" ng-class="{online: head.current_user.online}">
			{{head.current_user.first_name}}
			<div class="online-indicator" ng-if="head.current_user.online"></div>
			<img class="ava" ng-src="{{head.current_user.photo_50}}" width="28px" height="28px">
			<i class="caret"></i>
		</a>

		<ul class="dropdown-menu">
			<li><a href="https://vk.com/club90041499?w=page-90041499_50788371" translate>Помощь</a></li>
			<li><a href="https://vk.com/topic-90041499_31898043" translate>Оставить предложение</a></li>
			<li><a href="https://vk.com/im?sel=-90041499" translate>Сообщить об ошибке</a></li>
			<li class="divider"></li>
			<li><a ng-click="head.trackActivity('share')" ng-href="{{head.shareUrl}}" translate>Рассказать друзьям</a></li>
			<li><a ng-click="head.trackActivity('review')" ng-href="{{head.reviewUrl}}" translate>Оставить отзыв</a></li>
			<li class="divider"></li>
			<li><a ng-click="head.openOptionsPage()" translate>Настройки</a></li>
			<li><a href="#" ng-click="head.logout($event)" translate>Выйти</a></li>
		</ul>
	</span>
</header>
