const socket = io();

let joueursCourants = {};


const config = {
    scale: {
        mode: Phaser.Scale.FIT,
        parent: "phaser-example",
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: window.innerWidth,
        height: window.innerHeight,
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
    this.load.spritesheet("tank_red", "../assets/tank_red.png", {
        frameWidth: 500,
        frameHeight: 500,
    });
    this.load.spritesheet("tank_blue", "../assets/tank_blue.png", {
        frameWidth: 500,
        frameHeight: 500,
    });
    this.load.spritesheet("tank_green", "../assets/tank_green.png", {
        frameWidth: 500,
        frameHeight: 500,
    });
    this.load.spritesheet("tank_sand", "../assets/tank_sand.png", {
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

    this.add.rectangle(100, 100, 200, 200, 0xff0000); // rouge
    this.add.rectangle(100, window.innerHeight - 100, 200, 200, 0x00ff00); // vert
    this.add.rectangle(window.innerWidth - 100, 100, 200, 200, 0x0000ff); // bleu
    this.add.rectangle(window.innerWidth - 100, window.innerHeight - 100, 200, 200, 0xffff00); // jaune

    
    platforms = this.physics.add.staticGroup();

    //  Now let's create some ledges
    platforms.create(600, 400, 'baril');
    platforms.create(50, 250, 'baril');
    platforms.create(750, 220, 'baril');

    socket.on("ecranUpdate", (joueurs) => {
        // affichage joueurs
        for (const joueur in joueursCourants) {
            let player = joueursCourants[joueur];
            player.tank.destroy();
            player.healthbar.destroy();
            for (const i in player.bullets) {
                let tir = player.bullets[i];
                tir.bullet.destroy();
            }
        }
        joueursCourants = joueurs;
        for (const joueur in joueursCourants) {
            let player = joueursCourants[joueur];
            if(player.equipe == 1){
                player.tank = this.physics.add
                    .sprite(player.tank.x, player.tank.y, "tank_red")
                    .setDisplaySize(19, 23);
            }
            else if(player.equipe == 2){
                player.tank = this.physics.add
                    .sprite(player.tank.x, player.tank.y, "tank_green")
                    .setDisplaySize(19, 23);
            }
            else if(player.equipe == 3){
                player.tank = this.physics.add
                    .sprite(player.tank.x, player.tank.y, "tank_blue")
                    .setDisplaySize(19, 23);
            }
            else if(player.equipe == 4){
                player.tank = this.physics.add
                    .sprite(player.tank.x, player.tank.y, "tank_sand")
                    .setDisplaySize(19, 23);
            }
            player.healthbar = this.add.text(
                player.tank.x - 10,
                player.tank.y - 25,
                player.health,
                { fill: "#000000" }
            );
            player.tank.setAngle(player.angle)
            
            // affichage tirs du joueur
            for (const i in player.bullets) {
                let tir = player.bullets[i];
                tir.bullet = this.physics.add
                    .sprite(tir.bullet.x, tir.bullet.y, "bullet")
                    .setDisplaySize(8,12);
                tir.bullet.setAngle(tir.angle+180);
            }
        }

    });

    cursors = this.input.keyboard.createCursorKeys();

    /* QUAND LA PARTIE EST TERMINEE */
    socket.on("endOfGame", (data) => {
        if (data.type === "timeout") {
            this.add.text(window.innerWidth/2-400,window.innerHeight/2-80,"PARTIE TERMINEE",{
                fontSize : '80px',
                strokeThickness : 4,
                stroke : '#000',
                align : 'center'
            });
        }
    });

}

function update() {}

function ecranConnexion() {
    socket.emit("firstConnection", "ecran");
}

function main() {
    ecranConnexion();
    new Phaser.Game(config);
    socket.emit("dimensions_yield", {
        width : window.innerHeight,
        height : window.innerHeight
    });
    window.onresize = () => {
        location.reload();
        socket.emit("dimensions_yield", {
            width : window.innerHeight,
            height : window.innerHeight
        });
    }
}

window.onload = main;
