// import Phaser from 'phaser'

const config = {
    scale: {
        mode: Phaser.Scale.FIT,
        parent: 'phaser-example',
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 800,
        height: 600
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {y: 200}
        }
    },
    scene:{
        preload: preload,
        create: create,
        update: update
    }
}

var game = new Phaser.Game(config)

let tank
let cursor

function preload() {
    this.load.image('tank', 'icon-raygun.png')
}


function create() {
    tank = this.physics.add.image(200, 10, 'tank')
    tank.body.collideWorldBounds = true

    cursor = this.input.keyboard.createCursorKeys()
    
}

function update() 
{
    tank.setVelocityX(0)
    if (cursor.up.isDown)
    {
        console.log("touche appuyée");
        tank.setVelocity(0, -200)
    }
    if (cursor.left.isDown)
    {
        console.log("touche appuyée");
        tank.setVelocity(-100, 0)
    }
    if (cursor.right.isDown)
    {
        console.log("touche appuyée");
        tank.setVelocity(100, 0)
    }
}
