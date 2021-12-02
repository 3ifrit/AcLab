const socket = io();

let joySticks = [];
let moveJoyStick;
let aimJoyStick;
let pression;
let angle;
let rotation;
class Manette extends Phaser.Scene {
    constructor() {
        super({
            key: "examples",
        });
    }

    preload() {
        let url = "../lib/rexvirtualjoystickplugin.min.js";
        this.load.plugin("rexvirtualjoystickplugin", url, true);
    }

    create() {
        this.input.addPointer(1);
        moveJoyStick = CreateJoyStick(this, 100, 400);
        aimJoyStick = CreateJoyStick(this, 350, 400);
    }

    update() {
        let moveCursorKey = moveJoyStick.createCursorKeys();
        let aimCursorKey = aimJoyStick.createCursorKeys();

        for (let direction in moveCursorKey) {
            if (moveCursorKey[direction].isDown) {
                socket.emit(
                    "mouvementMove",
                    move(direction, moveJoyStick.force)
                );
            }
        }

        for (let direction in aimCursorKey) {
            if (aimCursorKey[direction].isDown) {
                socket.emit(
                    "mouvementAim",
                    aim(aimJoyStick.angle, aimJoyStick.rotation)
                );
            }
        }
    }
}

let CreateJoyStick = (scene, x, y) => {
    return scene.plugins.get("rexvirtualjoystickplugin").add(scene, {
        x: x,
        y: y,
        radius: 25,
        base: scene.add.circle(0, 0, 50, 0x7a7a7a),
        thumb: scene.add.circle(0, 0, 25, 0xcccccc),
        dir: "8dir", // 'up&down'|0|'left&right'|1|'4dir'|2|'8dir'|3
        // forceMin: 16,
        // enable: true
    });
};

let move = (dir, press) => {
    return { direction: dir, pression: press };
};

let aim = (deg, rot) => {
    return { angle: deg, rotation: rot };
};

const config = {
    type: Phaser.AUTO,
    scale: {
        parent: "phaser-example",
        autoCenter: Phaser.Scale.CENTER_BOTH,
        mode: Phaser.Scale.FIT,
        width: window.innerWidth,
        height: window.innerHeight,
    },
    scene: Manette,
    backgroundColor: 0xffffff,
};

function ecranConnexion() {
    socket.emit("firstConnection", "manette");

    const boutonEntrer = document.getElementById("entrer");
    const champLogin = document.getElementById("login");

    boutonEntrer.addEventListener("click", () => {
        socket.emit("manetteLogin", champLogin.value);
        document.getElementById("manette-screen").style.display = "none";
        new Phaser.Game(config);
    });
}

function main() {
    ecranConnexion();
}

window.onload = main;
