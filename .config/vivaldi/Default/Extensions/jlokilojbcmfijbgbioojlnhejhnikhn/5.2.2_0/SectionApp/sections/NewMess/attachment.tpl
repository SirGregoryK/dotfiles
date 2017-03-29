<span ng-switch="attachment.type" class="attachment attachment-{{attachment.type}}">

	<a ng-switch-when="photo" ng-href="{{attachment.photo.photo_2560 || attachment.photo.photo_1280 || attachment.photo.photo_807 || attachment.photo.photo_604 || attachment.photo.photo_130 || attachment.photo.photo_75}}">
		<img ng-src="{{attachment.photo.photo_130}}">
	</a>


	<a ng-switch-when="video" ng-href="{{attachment.video.player || 'https://vk.com/video'+attachment.video.owner_id+'_'+attachment.video.id }}">
		<img ng-src="{{attachment.video.photo_130}}">
		{{attachment.video.player}}
	</a>


	<a ng-switch-when="link" ng-href="{{attachment.link.url}}">
		<i class="fa fa-external-link fa-lg" aria-hidden="true"></i> {{attachment.link.title || attachment.link.url}}
	</a>


	<a ng-switch-when="wall" ng-href="https://vk.com/wall{{attachment.wall.to_id}}_{{attachment.wall.id}}">
		<translate>Запись</translate>
	</a>


	<a ng-switch-when="wall_reply" ng-href="https://vk.com/wall{{attachment.wall_reply.owner_id}}_{{attachment.wall_reply.post_id}}?reply={{attachment.wall_reply.id}}">
		<i class="fa fa-comment fa-lg" aria-hidden="true"></i> <translate>Комментарий</translate>
	</a>


	<a ng-switch-when="market" ng-href="https://vk.com/market{{attachment.market.owner_id}}?w=product{{attachment.market.owner_id}}_{{attachment.market.id}}">
		<i class="fa fa-shopping-cart fa-lg" aria-hidden="true"></i> {{attachment.market.title}}
	</a>


	<a ng-switch-when="doc" ng-href="{{attachment.doc.url}}">
		<i class="fa fa-lg" ng-class="{
			'file-text-o':  attachment.doc.type === 1,
			'file-zip-o':   attachment.doc.type === 2,
			'file-video-o': attachment.doc.type === 3,
			'file-photo-o': attachment.doc.type === 4,
			'file-audio-o': attachment.doc.type === 5,
			'file-video-o': attachment.doc.type === 6,
			'file-pdf-o':   attachment.doc.type === 7,
			'file-o':       attachment.doc.type === 8,
		}"></i>
		{{attachment.doc.title}}
	</a>


	<a ng-switch-when="audio" ng-href="{{attachment.audio.url}}">
		<i class="fa fa-music fa-lg" aria-hidden="true"></i>
		{{attachment.audio.artist}} — {{attachment.audio.title}}
	</a>


	<img ng-switch-when="sticker" ng-src="{{attachment.sticker.photo_64}}">


	<img ng-switch-when="gift" ng-src="{{attachment.gift.thumb_96}}">


	<a ng-switch-when="fwd_messages">
		<i class="fa fa-comment fa-lg" aria-hidden="true"></i>
		<translate translate-n="attachment.fwd_messages.items.length" translate-plural="{{$count}} Пересланных сообщений">{{$count}} Пересланное сообщение</translate>
	</a>


	<a ng-switch-default>
		<i class="fa fa-file-o fa-lg" aria-hidden="true"></i>
		<translate>Вложение</translate>
	</a>
</span>
