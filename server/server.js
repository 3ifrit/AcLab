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
const { timeStamp } = require("console");

class Tank extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, "");

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.body.setSize(38,46);
    }
}

class Bullet extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, "");

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.body.setSize(16,24);
    }
}

class ServerPhaser extends Phaser.Scene {
    #is_game;
    #socket_ecran;
    #joueurs;
    #tank_speed = 64;
    #bullet_speed = 512; // constant : all bullets have same speed
    #kills_equipe;

    constructor() {
        super();
        this.#is_game = false;
        this.#socket_ecran = null;
        this.#joueurs = {};
        this.#kills_equipe = {
            1 : 0,
            2 : 0,
            3 : 0,
            4 : 0,
        };
    }

    preload(){
        this.load.image('baril', path.join(__dirname, "../public/assets/barrelBlack_side.png"));
    }

    create() {

        this.physics.world.setBounds(0, 0, 1280, 720);
  
        this.platforms = this.physics.add.staticGroup();
        this.platforms.create(600, 400, 'baril');
        this.platforms.create(50, 250, 'baril');
        this.platforms.create(750, 220, 'baril');

        io.on("connection", (socket) => {
            console.log(`User ${socket.id} just connected.`);
            let isPlayer = false;
            let socketGameLoop;
            const x = Math.floor(Math.random() * 800) + 50;
            const y = Math.floor(Math.random() * 500) + 50;
            const tank = new Tank(this, 50, 50);
            const healthbar = new Phaser.GameObjects.Text(this,x,y,"100");
            const sc = this;
            var bullets = new Array();

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
                            health: 100,
                            nb_tirs: 0,
                            bullets: bullets,
                            nb_kills : 0,
                            equipe : Math.floor(Math.random() * 4) + 1,
                            //tir : false
                        };
                        this.physics.add.collider(this.#joueurs[socket.id].tank, this.platforms);
                    });
                } else if (data === "ecran") {
                    this.#is_game = true;
                    this.#socket_ecran = socket;
                }
            });

            socket.on("mouvement", (move) => {
                this.#joueurs[socket.id].tank.setVelocityX(move.dX * this.#tank_speed)
                this.#joueurs[socket.id].tank.setVelocityY(move.dY * this.#tank_speed)
            });

            socket.on("rotation", (aim) => {
                this.#joueurs[socket.id].angle = aim.angle;
                this.#joueurs[socket.id].tank.angle = aim.angle;
                //console.log(this.#joueurs[socket.id].tank.angle);
            });
            
            socket.on("tir", (/*etat*/) => {
                //console.log(etat);
                //this.#joueurs[socket.id].tir = etat;
                // on crée un objet bullet
                const bullet = new Bullet(sc,this.#joueurs[socket.id].tank.x,this.#joueurs[socket.id].tank.y);
                //console.log(`tir de ${socket.id}`);
                const x = this.#joueurs[socket.id].tank.x;
                const y = this.#joueurs[socket.id].tank.y;
                var angle = this.#joueurs[socket.id].tank.angle;
                
                bullet.setVelocityX(this.#bullet_speed*Math.cos(angle * 2 * Math.PI / 360 + Math.PI / 2));
                bullet.setVelocityY(this.#bullet_speed*Math.sin(angle * 2 * Math.PI / 360 + Math.PI / 2)); 

                this.physics.add.collider(bullet, this.platforms,() => {
                    bullet.destroy();
                    const index = this.#joueurs[socket.id].bullets.indexOf(new_bullet);
                    this.#joueurs[socket.id].bullets.splice(index,1);
                });

                let new_bullet = {
                    angle: angle,
                    x: x,
                    y: y,
                    bullet: bullet,
                    id: socket.id,
                    damage: 10
                };

                for (const i in this.#joueurs) {
                    const joueur = this.#joueurs[i];
                    if (i!=socket.id && joueur.equipe != this.#joueurs[socket.id].equipe)
                        this.physics.add.collider(bullet, joueur.tank,() => {
                            bullet.destroy();
                            const index = this.#joueurs[socket.id].bullets.indexOf(new_bullet);
                            this.#joueurs[socket.id].bullets.splice(index,1);
                            joueur.health -= 10;
                            if(joueur.health == 0){
                                this.#joueurs[socket.id].nb_kills++;
                                this.#kills_equipe[this.#joueurs[socket.id].equipe]++;
                                joueur.tank.destroy();
                                joueur.health = 100;
                                joueur.tank = new Tank(this, 50, 50);

                            }
                        });
                }

                //add bullet in the player bullet array
                this.#joueurs[socket.id].bullets.push(new_bullet);
                
            })

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
        if(this.#kills_equipe[1] == 5){
            this.physics.pause();
        }
        if(this.#kills_equipe[2] == 5){
            this.physics.pause();
 
        }
        if(this.#kills_equipe[3] == 5){
            this.physics.pause();
 
        }
        if(this.#kills_equipe[4] == 5){
            this.physics.pause();

        }
        if(this.game.getTime() / 1000 >= 300){
            this.physics.pause();
        }
    }
}

const config = {
    type: Phaser.HEADLESS,
    width: window.innerWidth,
    height: window.innerHeight,
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
