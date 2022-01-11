const socket = io();

let joySticks = [];
let moveJoyStick;
let aimJoyStick;
let pression;
let angle;
let rotation;
let tirButton;

class Manette extends Phaser.Scene {
    constructor() {
        super({
            key: "examples",
        });
    }

    preload() {
        let url = "../lib/rexvirtualjoystickplugin.min.js";
        this.load.plugin("rexvirtualjoystickplugin", url, true);
        this.load.plugin('rexbuttonplugin', 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexbuttonplugin.min.js', true);
    }

    create() {
        this.input.addPointer(1);
        moveJoyStick = CreateJoyStick(
            this,
            window.innerWidth / 4,
            (window.innerHeight / 4) * 3
        );
        aimJoyStick = CreateJoyStick(
            this,
            (window.innerWidth / 4) * 3,
            (window.innerHeight / 4) * 3
        );
        tirButton = createBtn(this, {
            
        });
    }

    update() {
        if (aimJoyStick.noKey & moveJoyStick.noKey) {
            socket.emit("mouvement", move(moveJoyStick));
        } else {
            if (!moveJoyStick.noKey) {
                socket.emit("mouvement", move(moveJoyStick));
            }
            if (!aimJoyStick.noKey) {
                socket.emit("rotation", aim(aimJoyStick));
            }
        }
    
        tirButton.button.on('click', () => {
            //tirButton.button.toggleEnable();
            socket.emit("tir"/*, tirButton.button.enable*/);
        });
        
    }
}

var createBtn = function (scene, config) {
    var x = 500;
    var y = 200;
    var color = 0xcccc00;
    var name = 'TIR';

    var btn = scene.add.rectangle(x, y, 120, 120, color)
        .setName(name);
    scene.add.text(x, y, name, {
        fontSize: '20pt'
    })
        .setOrigin(0.5, 0.5)

    btn.button = scene.plugins.get('rexbuttonplugin').add(btn, {
        enable : true,
        clickInterval: 1000,
    });

    
    
    return btn;
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
        // enable: false
    });
};

let move = (joy) => {
    return {
        dX: joy.forceX / joy.force,
        dY: joy.forceY / joy.force,
    };
};

let aim = (joy) => {
    angle = joy.angle - 90;
    return {
        angle: joy.angle - 90,
    };
};

const config = {
    type: Phaser.AUTO,
    scale: {
        parent: "phaser-example",
        //autoCenter: Phaser.Scale.CENTER_BOTH,
        //mode: Phaser.Scale.FIT,
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

function updateJoysticksCoordinates() {
    document.getElementById("rotate").style.width = window.innerWidth;
    document.getElementById("rotate").style.height = window.innerHeight;
    moveJoyStick.y = (window.innerHeight / 4) * 3;
    moveJoyStick.x = window.innerWidth / 4;
    aimJoyStick.y = (window.innerHeight / 4) * 3;
    aimJoyStick.x = (window.innerWidth / 4) * 3;
}

function main() {
    ecranConnexion();
    window.onorientationchange = function (event) {
        //updateJoysticksCoordinates();
    };
    //updateJoysticksCoordinates();
}

window.onload = main;
