<div id="friends-list" ng-controller="FriendsCtrl as vm">
  <a
    ng-repeat="user in vm.friends.items | limitTo : (vm.friends.count > 32 ? 31 : 32)"
    class="item"
    title="{{user.first_name}} {{user.last_name}}"
    ui-sref="user({user_id: user.id})"
    href="https://vk.com/id{{user.id}}"
    vk-href="https://vk.com/id{{user.id}}"
  >
    <div class="overlay"><i class="fa fa-user"></i></div>
    <user-ava src="user.photo_50"></user-ava>
    <div class="online-indicator ng-scope" ng-if="user.online"></div>
  </a>

  <a
    ng-if="vm.friends.count > 32"
    class="item next"
    title="{{'Все друзья' | translate}}"
    ui-sref="friends.all"
    href="https://vk.com/friends"
    vk-href="https://vk.com/friends"
  >
    <div class="next"><i class="fa fa-arrow-right"></i></div>
  </a>
</div>
