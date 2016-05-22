BunnyDefender.Preloader = function (game) {
	this.preloadBar = null;
	this.titleText = null;
	this.ready = false;	
};

BunnyDefender.Preloader.prototype = {
	preload: function () {
		// Создаем preloadBar в центре экрана и связываем его с состоянием загрузки
		this.preloadBar = this.add.sprite(this.world.centerX, this.world.centerY, 'preloadBar');
		// Создаем центр спрайта для дальнейших преобразований
		this.preloadBar.anchor.setTo(0.5, 0.5);
		this.load.setPreloadSprite(this.preloadBar);

		// Создаем текст заголовка
		this.titleText = this.add.image(this.world.centerX, this.world.centerY - 220, 'titleimage');
		this.titleText.anchor.setTo(0.5, 0.5);

		// Загружаем заставку для меню
		this.load.image('titlescreen', 'images/TitleBG.png');
		// Загружаем шрифт
		this.load.bitmapFont('eightbitwonder', 'fonts/eightbitwonder.png', 'fonts/eightbitwonder.fnt');

		// Загружаем небо и холм для игры
		this.load.image('hill', 'images/hill.png');
		this.load.image('sky', 'images/sky.png');

		// Загружаем спрайты с анимацией
		this.load.atlasXML('bunny', 'images/spritesheets/bunny.png', 'images/spritesheets/bunny.xml');
		this.load.atlasXML('spacerock', 'images/spritesheets/SpaceRock.png', 'images/spritesheets/SpaceRock.xml');

		// Загружаем картинку взрыва
		this.load.image('explosion', 'images/explosion.png');
		// Загружаем призрака кролика
		this.load.image('ghost', 'images/ghost.png');

		// Загрузка музыки
		this.load.audio('explosion_audio', 'audio/explosion.mp3');
		this.load.audio('hurt_audio', 'audio/hurt.mp3');
		this.load.audio('select_audio', 'audio/select.mp3');
		this.load.audio('game_audio', 'audio/bgm.mp3');
	},

	create: function () {
		this.preloadBar.cropEnabled = false;
	},

	update: function () {
		if (this.cache.isSoundDecoded('game_audio') && this.ready === false) {
			this.ready = true;
			this.state.start('StartMenu');
		}
	}
};