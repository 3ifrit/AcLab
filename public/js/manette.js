const socket = io();

let move;
let aim;
let direction;
let pression;

function ecranConnexion() {
    socket.emit("firstConnection", "manette");

    const boutonEntrer = document.getElementById("entrer");
    const champLogin = document.getElementById("login");

    boutonEntrer.addEventListener("click", () => {
        socket.emit("manetteLogin", champLogin.value);
        document.getElementById("form").style.display = "none";
        document.getElementById("move").style.visibility = "visible";
        document.getElementById("aim").style.visibility = "visible";
    });
}

function manette() {
    move = new JoyStick("move", {
        title: "joystick",

        // width/height
        width: undefined,
        height: undefined,

        // Internal color of Stick
        internalFillColor: "#3381ff",

        // Border width of Stick
        internalLineWidth: 2,

        // Border color of Stick
        internalStrokeColor: "#3381ff",

        // External reference circonference width
        externalLineWidth: 2,

        //External reference circonference color
        externalStrokeColor: "#3381ff",

        // Sets the behavior of the stick
        autoReturnToCenter: true,
    });

    aim = new JoyStick("aim", {
        title: "joystick",

        // width/height
        width: undefined,
        height: undefined,

        // Internal color of Stick
        internalFillColor: "#ff3333",

        // Border width of Stick
        internalLineWidth: 2,

        // Border color of Stick
        internalStrokeColor: "#ff3333",

        // External reference circonference width
        externalLineWidth: 2,

        //External reference circonference color
        externalStrokeColor: "#ff3333",

        // Sets the behavior of the stick
        autoReturnToCenter: true,
    });

    let loop = setInterval(() => {
        if (move.GetDir() != "C") {
            // console.log("test : X ", + move.GetX() + " Y : " + move.GetY());
            socket.emit("mouvementMove", move.GetX(), move.GetY());
        } else if (aim.GetDir() != "C") {
            // console.log("test : X ", + aim.GetX() + " Y : " + aim.GetY());
            socket.emit("mouvementAim", aim.GetX(), aim.GetY());
        }
    }, 2);

    return loop;
}

function main() {
    ecranConnexion();
    manette();
}

window.onload = main;
