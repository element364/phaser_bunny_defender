var BunnyDefender = {};

BunnyDefender.Boot = function (game) {};

BunnyDefender.Boot.prototype = {
	preload: function () {
		this.load.image('preloadBar', 'images/loader_bar.png');
		this.load.image('titleimage', 'images/TitleImage.png');
	},

	create: function () {
		// Указатели - курсоры или пальцы для мобильного
		this.input.maxPointers = 1;

		this.stage.disableVisibilityChange = false;
		// Показываем все
		this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
		// Минимальные размеры экрана
		this.scale.minWidth = 270;
		this.scale.minHeight = 480;
		// Центрируем игру
		this.scale.pageAlignHorizontally = true;
		this.scale.pageAlignVertically = true;
		// Портретных режим
		this.stage.forcePortrait = true;
		this.scale.setScreenSize(true);

		// Добавляем указатель
		this.input.addPointer();
		this.stage.backgroundColorString = '#171642';

		this.state.start('Preloader');
	}
};