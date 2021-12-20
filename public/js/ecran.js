const socket = io();

let joueursCourants = {};
let tirsCourants = {};

const config = {
    scale: {
        mode: Phaser.Scale.FIT,
        parent: "phaser-example",
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: /*1280*/ window.innerWidth,
        height: /*720*/ window.innerHeight,
    },
    type: Phaser.AUTO,
    physics: {
        default: "arcade",
        arcade: {
            gravity: { y: 0 },
        },
    },
    scene: {
        preload: preload,
        create: create,
        update: update,
    },
};

let cursors;
let tank;
let couleur = ["green", "blue", "red", "dark", "sand"];
let couleurRand = getRandomInt(couleur.length);
let j;

// Dev mozilla Math.random()
function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

function preload() {
    this.load.spritesheet("tank", "../assets/tank_red.png", {
        frameWidth: 500,
        frameHeight: 500,
    });
    this.load.image("sand", "../assets/tileSand1.png");
    this.load.image("baril", "../assets/barrelBlack_side.png");
    // this.load.image('tank', `../assets/tank_${couleur[getRandomInt(couleur.length)]}.png`)
    this.load.image("bullet", "../assets/bulletDark2.png");
}

function create() {
    sprite = this.add.image(50, 50, "sand");
    sprite.setScale(50);
    
    platforms = this.physics.add.staticGroup();

    //  Now let's create some ledges
    platforms.create(600, 400, 'baril');
    platforms.create(50, 250, 'baril');
    platforms.create(750, 220, 'baril');

    socket.on("ecranUpdate", (joueurs, bullets) => {
        // affichage joueurs
        for (const joueur in joueursCourants) {
            let player = joueursCourants[joueur];
            player.tank.destroy();
            player.healthbar.destroy();
        }
        joueursCourants = joueurs;
        for (const joueur in joueursCourants) {
            let player = joueursCourants[joueur];
            player.tank = this.physics.add
                .sprite(player.tank.x, player.tank.y, "tank")
                .setDisplaySize(38, 46);
            player.healthbar = this.add.text(
                player.tank.x - 20,
                player.tank.y - 50,
                player.health,
                { fill: "#000000" }
            );
            player.tank.setCollideWorldBounds(true);
            player.tank.setAngle(player.angle)
            this.physics.add.collider(player, platforms);
        }

        // affichage tirs
        for (const i in tirsCourants) {
            let tir = tirsCourants[i];
            tir.bullet.destroy();
        }
        tirsCourants = bullets;
        for (const i in tirsCourants) {
            let tir = tirsCourants[i];
            tir.bullet = this.physics.add
                .sprite(tir.bullet.x, tir.bullet.y, "bullet")
                .setDisplaySize(16,24);
            //tir.bullet.setCollideWorldBounds(true);
            //this.physics.add.collider(tir, platforms);
        }
    });

    cursors = this.input.keyboard.createCursorKeys();

}

function update() {}

function ecranConnexion() {
    socket.emit("firstConnection", "ecran");
}

function main() {
    ecranConnexion();
    new Phaser.Game(config);
}

window.onload = main;
