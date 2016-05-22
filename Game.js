BunnyDefender.Game = function (game) {
	this.totalBunnies = null;
	this.bunnyGroup = null;

	this.totalSpacerocks = null;
	this.spacerockGroup = null;

	this.burst = null;

	this.gameover = null;
	this.countdonw = null;

	this.overMessage = null;
	this.secondsElapsed = null;
	this.timer = null;

	this.music = null;
	this.ouch = null;
	this.boom = null;
	this.ding = null;
};

BunnyDefender.Game.prototype = {
	create: function () {
		this.gameover = false;

		this.secondsElapsed = 0;
		this.timer = this.time.create(false);
		this.timer.loop(1000, this.updateSeconds, this);

		this.totalBunnies = 20;
		this.totalSpacerocks = 13;

		// Инициализация музыки
		this.music = this.add.audio('game_audio');
		this.music.play('', 0, 0.3, true);

		this.ouch = this.add.audio('hurt_audio');
		this.boom = this.add.audio('explosion_audio');
		this.ding = this.add.audio('select_audio');

		// Построение мира
		this.buildWorld();
	},

	updateSeconds: function () {
		this.secondsElapsed++;
	},

	buildWorld: function () {
		this.add.image(0, 0, 'sky');
		this.add.image(0, 800, 'hill');

		// Построение группы кроликов
		this.buildBunnies()

		// Построение группы астрероидов
		this.buildSpacerocks();

		// Построение системы взрывов
		this.buildEmitter();

		// Инициализируем счетчик кроликов
		this.countdonw = this.add.bitmapText(10, 10, 'eightbitwonder', 'Bunnies ' + this.totalBunnies, 20);

		this.timer.start();
	},

	buildBunnies: function () {
		this.bunnyGroup = this.add.group();

		this.bunnyGroup.enableBody = true;

		for (var i = 0; i < this.totalBunnies; i++) {
			var b = this.bunnyGroup.create(
				this.rnd.integerInRange(-10, this.world.width - 50),
				this.rnd.integerInRange(this.world.height - 100, this.world.height - 60),
				'bunny',
				'Bunny0000'
			);

			b.anchor.setTo(0.5, 0.5);
			b.body.moves = false;
			b.animations.add('Rest', this.game.math.numberArray(1, 58));
			b.animations.add('Walk', this.game.math.numberArray(68, 107));
			b.animations.play('Rest', 24, true);

			this.assignBunnyMovement(b);
		}
	},

	// Назначить кролику движение
	assignBunnyMovement: function (b) {
		// Позиция, куда пойдет кролик
		var bPosition = Math.floor(this.rnd.realInRange(50, this.world.width - 50)),
			// Задержка перед началом движения
			bDelay = this.rnd.integerInRange(2000, 6000);

		// Если позиция находится за кроликом, то его нужно развернуть
		if (bPosition < b.x) {
			b.scale.x = 1;
		} else {
			b.scale.x = -1;
		}

		var tween = this.add.tween(b).to({ x: bPosition }, 3500, Phaser.Easing.Quadratic.InOut, true, bDelay);
		tween.onStart.add(this.startBunny, this);
		tween.onComplete.add(this.stopBunny, this);
	},

	startBunny: function (b) {
		b.animations.stop('Play');
		b.animations.play('Walk', 24, true);
	},

	stopBunny: function (b) {
		b.animations.stop('Walk');
		b.animations.play('Reset', 24, true);
		this.assignBunnyMovement(b);
	},

	buildSpacerocks: function () {
		this.spacerockGroup = this.add.group();

		for (var i = 0; i < this.totalSpacerocks; i++) {
			// Создаем метеорит
			var r = this.spacerockGroup.create(
				this.rnd.integerInRange(0, this.world.width),
				this.rnd.realInRange(-1500, 0),
				'spacerock',
				'SpaceRock0000'
			);

			// Ресайзим случайным образом
			var scale = this.rnd.realInRange(0.3, 1.0);
			r.scale.x = scale;
			r.scale.y = scale;

			// Подключаем физику
			this.physics.enable(r, Phaser.Physics.ARCADE);
			r.enableBody = true;
			r.body.velocity.y = this.rnd.integerInRange(200, 400);
			r.animations.add('Fall');
			r.animations.play('Fall', 24, true);

			// Добавляем обработку вылета за экран
			r.checkWorldBounds = true;
			r.events.onOutOfBounds.add(this.resetRock, this);
		}
	},

	resetRock: function (r) {
		if (r.y > this.world.height) {
			this.respawnRock(r);
		}
	},

	respawnRock: function (r) {
		if (this.gameover) {
			return;
		}

		r.reset(
			this.rnd.integerInRange(0, this.world.width),
			this.rnd.realInRange(-1500, 0)
		);
		r.body.velocity.y = this.rnd.integerInRange(200, 400);
	},

	buildEmitter: function () {
		// Создаем систему частиц, которая будет обрабатывать максимум 80
		this.burst = this.add.emitter(0, 0, 80);
		this.burst.minParticleScale = 0.3;
		this.burst.maxParticleScale = 1.2;
		this.burst.minParticleSpeed.setTo(-30, 30);
		this.burst.maxParticleSpeed.setTo(30, -30);
		// Задаем изображение частице
		this.burst.makeParticles('explosion');
		this.input.onDown.add(this.fireBurst, this);
	},

	fireBurst: function (pointer) {
		if (this.gameover) {
			return;
		}

		this.boom.play();
		this.boom.volume = 0.2;

		this.burst.emitX = pointer.x;
		this.burst.emitY = pointer.y;
		this.burst.start(true, 2000, null, 20);
	},

	burstCollision: function (r, b) {
		this.respawnRock(r);
	},

	bunnyCollision(r, bunny) {
		if (bunny.exists) {
			this.ouch.play();

			this.respawnRock(r);
			this.makeGhost(bunny);
			bunny.kill();
			this.totalBunnies--;
			this.checkBunniesLeft();
		}
	},

	checkBunniesLeft: function () {
		this.countdonw.setText('Bunnies ' + this.totalBunnies);

		if (this.totalBunnies <= 0) {
			this.music.stop();
			this.gameover = true;

			this.overMessage = this.add.bitmapText(
				this.world.centerX - 180,
				this.world.centerY - 40,
				'eightbitwonder',
				'Game Over\n\n' + this.secondsElapsed, 42
			);
			this.overMessage.align = 'center';
			this.overMessage.inputEnabled = true;
			this.overMessage.events.onInputDown.addOnce(this.quitGame, this);
		}
	},

	quitGame: function (pointer) {
		this.ding.play();
		this.state.start('StartMenu')
	},

	firendlyFire: function (bunny, burst) {
		if (bunny.exists) {
			this.ouch.play();

			this.makeGhost(bunny);
			bunny.kill();
			this.totalBunnies--;
			this.checkBunniesLeft();
		}
	},

	makeGhost: function (bunny) {
		var ghost = this.add.sprite(bunny.x - 20, bunny.y - 180, 'ghost');
		ghost.anchor.setTo(0.5, 0.5);
		ghost.scale.x =  bunny.scale.x;
		this.physics.enable(ghost, Phaser.Physics.ARCADE);
		ghost.enableBody = true;
		ghost.checkWorldBounds = true;
		ghost.body.velocity.y = -800;
	},

	update: function () {
		this.physics.arcade.overlap(this.spacerockGroup, this.burst, this.burstCollision, null, this);
		this.physics.arcade.overlap(this.spacerockGroup, this.bunnyGroup, this.bunnyCollision, null, this);
		this.physics.arcade.overlap(this.bunnyGroup, this.burst, this.firendlyFire, null, this);
	}	
};