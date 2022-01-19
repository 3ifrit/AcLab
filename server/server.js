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
const { Scene, Game } = require("phaser");
const { timeStamp } = require("console");

let screen_width = 1280;
let screen_height = 720;

class Tank extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, "");

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.body.setSize(19,23);
    }
}

class Bullet extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, "");

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.body.setSize(8,12);
    }
}

class ServerPhaser extends Phaser.Scene {
    #is_game;
    #socket_ecran;
    #joueurs;
    #tank_speed = 32;
    #bullet_speed = 256; // constant : all bullets have same speed
    #kills_equipe;
    #kill_limit = 5;
    #game_duration = 10; // en secondes

    constructor() {
        super();
        this.#is_game = false;
        this.#socket_ecran = null;
        this.#joueurs = {};
        this.#kills_equipe = {
            1 : 0, // rouge
            2 : 0, // vert
            3 : 0, // bleu
            4 : 0, // jaune
        };
    }

    preload(){
       
    }

    create() {

        this.physics.world.setBounds(0, 0, window.innerWidth, window.innerHeight);
  
        this.platforms = this.physics.add.staticGroup();
        this.platforms.create(600, 400, 'baril');
        this.platforms.create(50, 250, 'baril');
        this.platforms.create(750, 220, 'baril');

        io.on("connection", (socket) => {
            console.log(`User ${socket.id} just connected.`);
            let isPlayer = false;
            let socketGameLoop;

            const equipe = Math.floor(Math.random() * 4) + 1;
            let x, y;

            switch(equipe) {
                case 1:
                    x = screen_width/8;
                    y = screen_height/8;
                    break;
                case 2:
                    x = screen_width/8;
                    y = screen_height*7/8;
                    break;
                case 3:
                    x = screen_width*7/8;
                    y = screen_height/8;
                    break;
                case 4:
                    x = screen_width*7/8;
                    y = screen_height*7/8;
                    break;
            }
            
            const tank = new Tank(this, x, y);
            tank.setCollideWorldBounds(true);
            const healthbar = new Phaser.GameObjects.Text(this,x,y,"100");
            const sc = this;
            var bullets = new Array();

            socket.on("dimensions_yield",(dimensions) => {
                screen_width = dimensions.width;
                screen_height = dimensions.height;
                this.physics.world.setBounds(0, 0, screen_width, screen_height, true, true, true, true);
                this.cameras.main.setBounds(0, 0, screen_width, screen_height);
                console.log("screen dimensions changed !");
            });

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
                            equipe : equipe,
                            bullet_damage : 10
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
                if (this.#joueurs[socket.id] != undefined) {
                    this.#joueurs[socket.id].tank.setVelocityX(move.dX * this.#tank_speed);
                    this.#joueurs[socket.id].tank.setVelocityY(move.dY * this.#tank_speed);
                }
            });

            socket.on("rotation", (aim) => {
                if (this.#joueurs[socket.id] != undefined) {
                    this.#joueurs[socket.id].angle = aim.angle;
                    this.#joueurs[socket.id].tank.angle = aim.angle;
                    //console.log(this.#joueurs[socket.id].tank.angle);
                }
            });
            
            socket.on("tir", (/*etat*/) => {
                if (this.#joueurs[socket.id] != undefined) {
                    //console.log(etat);
                    //this.#joueurs[socket.id].tir = etat;
                    // on crée un objet bullet
                    const bullet = new Bullet(sc,this.#joueurs[socket.id].tank.x,this.#joueurs[socket.id].tank.y);
                    //console.log(`tir de ${socket.id}`);
                    const x = this.#joueurs[socket.id].tank.x;
                    const y = this.#joueurs[socket.id].tank.y;
                    var angle = this.#joueurs[socket.id].tank.angle;

                    let new_bullet = {
                        angle: angle,
                        x: x,
                        y: y,
                        bullet: bullet,
                        id: socket.id
                    };

                    bullet.setVelocityX(this.#bullet_speed*Math.cos(angle * 2 * Math.PI / 360 + Math.PI / 2));
                    bullet.setVelocityY(this.#bullet_speed*Math.sin(angle * 2 * Math.PI / 360 + Math.PI / 2)); 

                    bullet.setCollideWorldBounds(true);
                    bullet.body.onWorldBounds= true;
                    bullet.body.world.on("worldbounds", (body) => {
                        if (body===bullet.body) {
                            bullet.destroy();
                            const index = this.#joueurs[socket.id].bullets.indexOf(new_bullet);
                            this.#joueurs[socket.id].bullets.splice(index,1);
                        }
                    }, bullet);

                    this.physics.add.collider(bullet, this.platforms,() => {
                        bullet.destroy();
                        const index = this.#joueurs[socket.id].bullets.indexOf(new_bullet);
                        this.#joueurs[socket.id].bullets.splice(index,1);
                    });

                    for (const i in this.#joueurs) {
                        const joueur = this.#joueurs[i];
                        if (i!=socket.id && joueur.equipe != this.#joueurs[socket.id].equipe)
                            this.physics.add.collider(bullet, joueur.tank,() => {
                                bullet.destroy();
                                joueur.health -= this.#joueurs[socket.id].bullet_damage;
                                const index = this.#joueurs[socket.id].bullets.indexOf(new_bullet);
                                this.#joueurs[socket.id].bullets.splice(index,1);
                                if(joueur.health == 0){
                                    this.#joueurs[socket.id].nb_kills++;
                                    this.#kills_equipe[this.#joueurs[socket.id].equipe]++;
                                    //joueur.tank.destroy();
                                    joueur.tank.setActive(false);
                                    joueur.tank.setVisible(false);
                                    joueur.health = 100;
                                    joueur.tank = new Tank(this, joueur.x, joueur.y);

                                }
                            });
                    }

                    //add bullet in the player bullet array
                    this.#joueurs[socket.id].bullets.push(new_bullet);
                }
            });

            // On supprime un joueur de l'objets joueurs quand il se deconnecte
            socket.on("disconnect", () => {
                if (this.#joueurs[socket.id] != undefined) {
                    console.log(`User ${socket.id} has disconnected.`);
                    if (isPlayer) {
                        delete this.#joueurs[socket.id];
                    } else {
                        clearInterval(socketGameLoop);
                    }
                }
            });
        });
    }

    update() {
        if (this.#is_game) {
            this.#socket_ecran.emit("ecranUpdate", this.#joueurs);
        }
        for (let i=1;i<=4;i++) {
            if (this.#kills_equipe[i] == this.#kill_limit){
                this.physics.pause();
                this.#socket_ecran.emit("endOfGame", {
                    type : "score",
                    equipe : i
                });
            }
        }
        if (this.game.getTime() / 1000 >= this.#game_duration){
            this.physics.pause();
            this.#socket_ecran.emit("endOfGame", {
                type : "timeout"
            })
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
