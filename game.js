const config = {
  type: Phaser.AUTO,
  width: 360,
  height: 640,
  backgroundColor: '#0b3d2e',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: {
    preload,
    create,
    update
  }
};

const game = new Phaser.Game(config);

let cueBall;
let balls = [];
let cue;
let isAiming = false;
let power = 0;

function preload() {
  // Não precisa imagem agora, tudo é desenhado
}

function create() {

  // MESA
  const table = this.add.rectangle(180, 320, 320, 480, 0x1f6b4a);
  table.setStrokeStyle(10, 0x0b3d2e);

  // BURACOS
  this.pockets = this.physics.add.staticGroup();
  const pocketPositions = [
    [20, 80], [180, 80], [340, 80],
    [20, 560], [180, 560], [340, 560]
  ];

  pocketPositions.forEach(p => {
    const pocket = this.add.circle(p[0], p[1], 14, 0x000000);
    this.pockets.add(pocket);
  });

  // BOLA BRANCA
  cueBall = this.physics.add.image(180, 420);
  cueBall.setCircle(8);
  cueBall.setBounce(0.98);
  cueBall.setDamping(true);
  cueBall.setDrag(0.99);
  cueBall.setCollideWorldBounds(true);
  cueBall.displayWidth = 16;
  cueBall.displayHeight = 16;
  cueBall.setTint(0xffffff);

  // BOLAS COLORIDAS
  for (let i = 0; i < 5; i++) {
    const ball = this.physics.add.image(150 + i * 20, 200);
    ball.setCircle(8);
    ball.setBounce(0.98);
    ball.setDamping(true);
    ball.setDrag(0.99);
    ball.displayWidth = 16;
    ball.displayHeight = 16;
    ball.setTint(Phaser.Display.Color.RandomRGB().color);
    balls.push(ball);
  }

  // COLISÕES
  this.physics.add.collider(cueBall, balls);
  this.physics.add.collider(balls, balls);

  // BURACO DETECTA
  this.physics.add.overlap(cueBall, this.pockets, ballInPocket, null, this);
  this.physics.add.overlap(balls, this.pockets, ballInPocket, null, this);

  // TACO
  cue = this.add.line(0, 0, 0, 0, 0, -100, 0xf5deb3).setLineWidth(4);
  cue.setOrigin(0.5, 1);

  // CONTROLE
  this.input.on('pointerdown', () => {
    isAiming = true;
    power = 0;
  });

  this.input.on('pointerup', () => {
    shoot();
    isAiming = false;
  });
}

function update() {

  if (isAiming) {
    power = Math.min(power + 5, 300);

    const angle = Phaser.Math.Angle.Between(
      cueBall.x,
      cueBall.y,
      game.input.activePointer.x,
      game.input.activePointer.y
    );

    cue.setPosition(cueBall.x, cueBall.y);
    cue.setRotation(angle + Math.PI);
    cue.setLength(power / 2);
  } else {
    cue.setLength(0);
  }
}

function shoot() {
  const angle = Phaser.Math.Angle.Between(
    cueBall.x,
    cueBall.y,
    game.input.activePointer.x,
    game.input.activePointer.y
  );

  cueBall.setVelocity(
    Math.cos(angle) * power,
    Math.sin(angle) * power
  );

  power = 0;
}

function ballInPocket(ball) {
  ball.disableBody(true, true);
}
