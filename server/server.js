const path = require("path");
const http = require("http");
const express = require("express");
const socketIO = require("socket.io");

const publicPATH = path.join(__dirname, "../public");
// const node_mPATH = path.join(__dirname, "../node_modules");
const fichierManette = publicPATH + "/manette.html";
const fichierEcran = publicPATH + "/ecran.html";

const port = 3000;

// Creation de l'objet joueurs dans laquelle on va stocker toutes les infos de chaque joueur
// let joueurs = {};

let app = express();
let server = http.createServer(app);
let io = socketIO(server);

app.use(express.static(publicPATH));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    res.sendFile(fichierManette);
});

app.get("/ecran", (req, res) => {
    res.sendFile(fichierEcran);
});

require("@geckos.io/phaser-on-nodejs");
const Phaser = require("phaser");
const { Scene } = require("phaser");

class Tank extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, "");

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.body.setSize(60, 40);
    }
}

class ServerPhaser extends Phaser.Scene {
    #is_game;
    #socket_ecran;
    #joueurs;

    constructor() {
        super();
        this.#is_game = false;
        this.#socket_ecran = null;
        this.#joueurs = {};
    }

    create() {
        this.physics.world.setBounds(0, 0, 1280, 720);

        io.on("connection", (socket) => {
            console.log(`User ${socket.id} just connected.`);
            let isPlayer = false;
            let socketGameLoop;
            const x = Math.floor(Math.random() * 800) + 50;
            const y = Math.floor(Math.random() * 500) + 50;
            const tank = new Tank(this, 50, 50);
            const healthbar = new Phaser.GameObjects.Text(this,x,y,"100");

            socket.on("firstConnection", (data) => {
                if (data === "manette") {
                    isPlayer = true;

                    socket.on("manetteLogin", (pseudo) => {
                        // Creation d'un joueur d'objet joueurs avec une postition random, login et id
                        this.#joueurs[socket.id] = {
                            rotation: 0,
                            angle: 0,
                            vitesse: 0,
                            x: x,
                            y: y,
                            id: socket.id,
                            nickname: pseudo,
                            tank: tank,
                            healthbar: healthbar,
                            health: 100
                        };
                    });
                } else if (data === "ecran") {
                    this.#is_game = true;
                    this.#socket_ecran = socket;
                }
            });

            socket.on("mouvement", (move, aim) => {
                let X = 0;
                let Y = 0;
                X += move.dX * 20;
                Y += move.dY * 20;

                this.#joueurs[socket.id].tank.setVelocityX(X)
                this.#joueurs[socket.id].tank.setVelocityY(Y)

                this.#joueurs[socket.id].angle = aim.angle;
            });

            // On supprime un joueur de l'objets joueurs quand il se deconnecte
            socket.on("disconnect", () => {
                console.log(`User ${socket.id} has disconnected.`);
                if (isPlayer) {
                    delete this.#joueurs[socket.id];
                } else {
                    clearInterval(socketGameLoop);
                }
            });
        });
    }

    update() {
        if (this.#is_game) {
            this.#socket_ecran.emit("ecranUpdate", this.#joueurs);
        }
    }
}

const config = {
    type: Phaser.HEADLESS,
    width: 1280,
    height: 720,
    banner: false,
    audio: false,
    scene: [ServerPhaser],
    physics: {
        default: "arcade",
        arcade: {
            gravity: { y: 0 },
        },
    },
};

server.listen(port, () => {
    console.log(`Listening on ${server.address().port}`);
});

function main() {
    console.log("Hello there");
    // console.log(new Phaser.Game(config))
    new Phaser.Game(config);
}

window.onload = main;
2
