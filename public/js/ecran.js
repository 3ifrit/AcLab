let socket = io();

let joueursCourants = {};

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
            gravity: { y: 150 },
        },
    },
    scene: {
        preload: preload,
        create: create,
        update: update,
    },
};

let cursor;
let tank;
let couleur = ["green", "blue", "red", "dark", "sand"];
let couleurRand = getRandomInt(couleur.length);

// Dev mozilla Math.random()
function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

function preload() {
    this.load.image("tank", "../assets/tank_blue.png");
    this.load.image("sand", "../assets/tileSand1.png");
    this.load.image("baril", "../assets/barrelBlack_side.png");
    // this.load.image('tank', `../assets/tank_${couleur[getRandomInt(couleur.length)]}.png`)
}

function create() {
    sprite = this.add.image(50, 50, "sand");

    sprite.setScale(50);
    obstacles = this.physics.add.staticGroup();

    obstacles.create(600, 100, "baril");
    obstacles.create(1000, 501, "baril");

    obstacles.create(255, 400, "baril");

    socket.on("ecranUpdate", (joueurs) => {
        for (const joueur in joueursCourants) {
            let player = joueursCourants[joueur];
            player.tank.destroy();
        }
        joueursCourants = joueurs;
        for (const joueur in joueursCourants) {
            let player = joueursCourants[joueur];
            joueursCourants[joueur].tank = this.add
                .sprite(player.x, player.y, "tank")
                .setDisplaySize(60, 40);
            joueursCourants[joueur].tank.angle = player.angle;
        }
    });

    //this.physics.add.collider(player, player);
    //this.physics.add.collider(player, obstacles);

    // socket.on("mouvementMove", (move) => {
    //    console.log(move.direction);
    // });
}

function update() {}

function ecranConnexion() {
    socket.emit("firstConnection", "ecran");
}

function main() {
    ecranConnexion();
    let game = new Phaser.Game(config);
}

window.onload = main;
