/**
 * @name Controller Connect
 * @description Use any controller to play gimkit platformer mode | Original input code by TheLazySquid
 * @author wendover
 * @version 0.2.1
 * @needsLib CommandLine | https://raw.githubusercontent.com/Blackhole927/gimkitmods/main/libraries/CommandLine/CommandLine.js
 * @downloadUrl https://raw.githubusercontent.com/wend0ver/controller-connect/main/connectController.js
 */

// libs
let CommandLine = GL.lib("CommandLine")

let cameraPos;

const sens = 2.5;

let lDown = false;
let rDown = false;

let xDown = false;
let zlDown = false;

let zrDown = false;
let aDown = false;
let shouldJump = false;

let moveLeft = false;
let moveRight = false;

let dropDown = false;

const aimSens = 5.62 * sens;

let aimX = 0;
let aimY = 0;

let moveUp = false;
let moveDown = false;

function setupInput() {

    // Button mappings for the controller
    const BUTTON_DROP = parseInt(localStorage.getItem('GL_Controller_Connect_Drop'));
    const BUTTON_JUMP = parseInt(localStorage.getItem('GL_Controller_Connect_Jump'));
    const BUTTON_Y = 2;
    const BUTTON_INTERACT = parseInt(localStorage.getItem('GL_Controller_Connect_Interact'));

    const BUTTON_USE = parseInt(localStorage.getItem('GL_Controller_Connect_Shoot'));
    const BUTTON_FIRE = parseInt(localStorage.getItem('GL_Controller_Connect_Use'));

    const BUTTON_L = parseInt(localStorage.getItem('GL_Controller_Connect_Left'));
    const BUTTON_R = parseInt(localStorage.getItem('GL_Controller_Connect_Right'));



    // Create the element with inline styling
    const square = document.createElement('div');
    square.style.position = 'absolute';
    square.style.width = '50px';
    square.style.height = '50px';
    square.style.backgroundImage = 'url(https://www.gimkit.com/assets/map/core/aim_cursor.png)';
    square.style.backgroundSize = 'cover';
    square.style.zIndex = '100000';
    document.body.appendChild(square);


    // Check if the gamepad is connected
    function isGamepadConnected() {
        return navigator.getGamepads()[0] !== null;
    }

    // Handle button press
    function handleButtonPress(buttonIndex) {
        if (buttonIndex === BUTTON_JUMP) {
            if (!aDown) {
                //console.log('A button pressed');
                shouldJump = true;
            }
            aDown = true;
        }

        if (buttonIndex === BUTTON_INTERACT) {
            if (!xDown) {
                for (var i = 0; i < window.stores.phaser.scene.worldManager.devices.allDevices.length; i++) {
                    var device = window.stores.phaser.scene.worldManager.devices.allDevices[i]
                    if (Math.sqrt(
                        Math.pow(window.stores.phaser.mainCharacter.body.x - device.x, 2) + 
                        Math.pow(window.stores.phaser.mainCharacter.body.y - device.y, 2)
                    )
                <= 325) {
                        window.stores.network.room.send("MESSAGE_FOR_DEVICE", {"key":"interacted","deviceId":device.id})
                        window.stores.network.room.send("MESSAGE_FOR_DEVICE", {"key":"collect","deviceId":device.id})
                        window.stores.network.room.send("MESSAGE_FOR_DEVICE", {"key":"purchase","deviceId":device.id})
                    }
                }
            }
            xDown = true;
        }


        if (buttonIndex === BUTTON_USE) {
            if (!zrDown) {
                

                window.stores.network.room.send("FIRE", {
                    angle: Math.atan2(aimX, -aimY) + (-90 * (Math.PI / 180)),
                    x: window.stores.phaser.mainCharacter.body.x,
                    y: window.stores.phaser.mainCharacter.body.y
                })
            }
            zrDown = true;
        }

        if (buttonIndex === BUTTON_DROP) {
            if (!dropDown) {
                window.stores.network.room.send("DROP_ITEM", {"amount":9999,"interactiveSlotNumber":window.stores.me.inventory.activeInteractiveSlot});
            }
            dropDown = true;
        }

        if (buttonIndex === BUTTON_FIRE) {
            if (!zlDown) {
                let aimLeft = 0;
                let aimDown = 0;
                if (aimX <= -aimSens) {
                    aimLeft = -1;
                }

                if (aimX >= aimSens) {
                    aimLeft = 1;
                }

                if (aimY <= -aimSens) {
                    aimDown = -1;
                }

                if (aimY >= aimSens) {
                    aimDown = 1;
                }

                window.stores.network.room.send("CONSUME",{
                    "x":Math.round(window.stores.phaser.mainCharacter.body.x * 0.015625 - 0.5) + aimLeft,
                    "y":Math.round(window.stores.phaser.mainCharacter.body.y * 0.015625 - 0.5) + aimDown
                })
            }
            zlDown = true;
        }

        if (buttonIndex === BUTTON_L) {
            if (!lDown) {
                // Set the active interactive slot

                // Get the slots data
                var slots = window.stores.me.inventory.slots.data_;

                var slotLength = 0;
                // Use forEach to iterate over each slot in the slots array
                slots.forEach((slot, index) => {
                    slotLength++;
                    // Perform your desired operations with each slot
                    //console.log(`Slot ${index}:`);

                    // Example operation: print the data of each slot
                    // Replace this with your actual logic
                });

                var slot = window.stores.me.inventory.activeInteractiveSlot;

                slot += -1;

                if (slot < 0) {
                    slot = slotLength;
                }
                window.stores.network.room.send("SET_ACTIVE_INTERACTIVE_ITEM",{"slotNum":slot})        
            }
            lDown = true;
        }

        if (buttonIndex === BUTTON_R) {
            if (!rDown) {
                // Set the active interactive slot

                // Get the slots data
                var slots = window.stores.me.inventory.slots.data_;

                var slotLength = 0;
                // Use forEach to iterate over each slot in the slots array
                slots.forEach((slot, index) => {
                    slotLength++;
                    // Perform your desired operations with each slot
                    //console.log(`Slot ${index}:`);

                    // Example operation: print the data of each slot
                    // Replace this with your actual logic
                });

                var slot = window.stores.me.inventory.activeInteractiveSlot;

                slot += 1;

                if (slot > slotLength) {
                    slot = 0;
                }
                window.stores.network.room.send("SET_ACTIVE_INTERACTIVE_ITEM",{"slotNum":slot})        
            }
            rDown = true;
        }
    }

    // Print joystick position
    function printJoystickPosition(gamepad) {
        const leftStickX = gamepad.axes[0].toFixed(2);
        const leftStickY = gamepad.axes[1].toFixed(2);
        const rightStickX = gamepad.axes[2].toFixed(2);
        const rightStickY = gamepad.axes[3].toFixed(2);
        //console.log(`Left Stick: (${leftStickX}, ${leftStickY}), Right Stick: (${rightStickX}, ${rightStickY})`);

        if (leftStickX < -0.1) {
            moveLeft = true;
        } else {
            moveLeft = false;
        }

        if (leftStickX > 0.1) {
            moveRight = true;
        } else {
            moveRight = false;
        }

        if (leftStickY < -0.1) {
            moveDown = true;
        } else {
            moveDown = false;
        }

        if (leftStickY > 0.1) {
            moveUp = true;
        } else {
            moveUp = false;
        }

        if (Math.abs(rightStickX) > 0.1) {
            aimX = aimX + ( parseFloat(rightStickX) * sens );
        }

        if (Math.abs(rightStickY) > 0.1) {
            aimY = aimY + ( parseFloat(rightStickY) * sens );
        }

        // render a red square at the position where 0 0 is the center of the screen
        render();
    }

    function render() {
        // Center of the screen
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;

        // Calculate the position of the square
        const x = centerX + aimX * 10; // Adjust multiplier for speed
        const y = centerY + aimY * 10;

        // Set the position of the square
        square.style.left = `${x - 10}px`; // Adjust for half the width of the square
        square.style.top = `${y - 10}px`; // Adjust for half the height of the square

        //console.log(aimX + " | " + aimY);
    }

    // Handle button release
    function handleButtonRelease(buttonIndex) {
        if (buttonIndex === BUTTON_JUMP) {
            aDown = false;
        }
        if (buttonIndex === BUTTON_USE) {
            zrDown = false;
        }
        if (buttonIndex === BUTTON_R) {
            rDown = false;
        }
        if (buttonIndex === BUTTON_L) {
            lDown = false;
        }
        if (buttonIndex === BUTTON_FIRE) {
            zlDown = false;
        }
        if (buttonIndex === BUTTON_INTERACT) {
            xDown = false;
        }
        if (buttonIndex === BUTTON_DROP) {
            dropDown = false;
        }
    }

    // Main loop
    function gamepadLoop() {
        const gamepad = navigator.getGamepads()[0];
        if (gamepad) {
            gamepad.buttons.forEach((button, index) => {
                if (button.pressed) {
                    handleButtonPress(index);
                } else {
                    handleButtonRelease(index);
                }
            });
            printJoystickPosition(gamepad);
        }
        requestAnimationFrame(gamepadLoop);
    }

    // Initialize the gamepad
    function initGamepad() {
        if (isGamepadConnected()) {
            //console.log('Gamepad connected:', navigator.getGamepads()[0].id);
            gamepadLoop();
        } else {
            //console.log('No gamepad connected');
        }
    }

    // Check for gamepad connection
    window.addEventListener('gamepadconnected', initGamepad);

    // Check for gamepad disconnection
    window.addEventListener('gamepaddisconnected', () => {
        //console.log('Gamepad disconnected');
    });

    //console.log('Waiting for gamepad connection...');



}

let frames = [];
let values = {};
var Keycodes;
let myNewFrame = {
    left: false,
    right: false,
    up: false
};

function myNewFrameFunc() {
    myNewFrame = {
        left: false,
        right: true,
        up: false
    };
    if (shouldJump == true) {
        myNewFrame.up = true;
        shouldJump = false;
    }
    myNewFrame.left = moveLeft;
    myNewFrame.right = moveRight;

    return myNewFrame;
}; 


(function (Keycodes) {
    Keycodes[Keycodes["LeftArrow"] = 37] = "LeftArrow";
    Keycodes[Keycodes["RightArrow"] = 39] = "RightArrow";
    Keycodes[Keycodes["UpArrow"] = 38] = "UpArrow";
    Keycodes[Keycodes["W"] = 87] = "W";
    Keycodes[Keycodes["A"] = 65] = "A";
    Keycodes[Keycodes["D"] = 68] = "D";
    Keycodes[Keycodes["Space"] = 32] = "Space";
})(Keycodes || (Keycodes = {}));
function generatePhysicsInput(frame) {
    let jump = frame.up;
    let angle = null;
    if (!frame.right && !frame.left && !frame.up)
        angle = null;
    else if (frame.right && !frame.left && !frame.up)
        angle = 0;
    else if (!frame.right && frame.left && !frame.up)
        angle = 180;
    else if (!frame.right && !frame.left && frame.up)
        angle = 270;
    else if (frame.right && !frame.left && frame.up)
        angle = 315;
    else if (frame.right && frame.left && !frame.up)
        angle = null;
    else if (!frame.right && frame.left && frame.up)
        angle = 225;
    else if (!frame.right && !frame.left && !frame.up)
        angle = 225;
    return { angle, jump, _jumpKeyPressed: frame.up };
}
class PathfindTools {
    physicsManager;
    nativeStep;
    physics;
    rb;
    inputManager;
    values;
    getPhysicsInput;
    slowdownAmount = 1;
    slowdownDelayedFrames = 0;
    constructor(physicsManager, values) {
        this.physicsManager = physicsManager;
        this.values = values;
        this.nativeStep = physicsManager.physicsStep;
        physicsManager.physicsStep = (dt) => {
            GL.stores.phaser.mainCharacter.physics.postUpdate(dt);
        };
        this.physics = GL.stores.phaser.mainCharacter.physics;
        this.rb = this.physics.getBody().rigidBody;
        this.inputManager = GL.stores.phaser.scene.inputManager;
        this.getPhysicsInput = this.inputManager.getPhysicsInput;
    }
    pathfind() {
        let { frames } = this.values;
        this.slowdownDelayedFrames = 0;
        this.physicsManager.physicsStep = (dt) => {
            this.slowdownDelayedFrames++;
            if (this.slowdownDelayedFrames < this.slowdownAmount)
                return;
            this.slowdownDelayedFrames = 0;
            let frame = myNewFrameFunc();
            if (frame) {
                let input = generatePhysicsInput(frame);
                this.inputManager.getPhysicsInput = () => input;
            } else {
                this.stopPlaying();
                delete window.pathfindingThis;
                return;
            }
            this.nativeStep(dt);
            this.values.currentFrame++;
        };
    }
    stopPlaying() {
        this.physicsManager.physicsStep = (dt) => {
            GL.stores.phaser.mainCharacter.physics.postUpdate(dt);
        };
    }
    startControlling() {
        this.slowdownDelayedFrames = 0;
        this.inputManager.getPhysicsInput = this.getPhysicsInput;
        this.physicsManager.physicsStep = (dt) => {
            this.slowdownDelayedFrames++;
            if (this.slowdownDelayedFrames < this.slowdownAmount)
                return;
            this.slowdownDelayedFrames = 0;
            let keys = this.inputManager.keyboard.heldKeys;
            let left = keys.has(Keycodes.LeftArrow) || keys.has(Keycodes.A);
            let right = keys.has(Keycodes.RightArrow) || keys.has(Keycodes.D);
            let up = keys.has(Keycodes.UpArrow) || keys.has(Keycodes.W) || keys.has(Keycodes.Space);
            let translation = this.rb.translation();
            let state = JSON.stringify(this.physics.state);
            this.values.frames[this.values.currentFrame] = { left, right, up, translation, state };
            this.nativeStep(dt);

            generateNextFrame();

            this.values.currentFrame++;

        };
    }
    stopControlling() {
        this.physicsManager.physicsStep = (dt) => {
            GL.stores.phaser.mainCharacter.physics.postUpdate(dt);
        };
    }
}
frames = [];
values = { frames, currentFrame: 0 };
function createInstance(physicsManager) {
    let tools = new PathfindTools(physicsManager, values);
    window.startPathfinding = function() {
        tools.pathfind();
    }
    window.stopPathfinding = function() {
        tools.stopPlaying();
    }
    function setPlaying(value) {
        playing = value;
        if (playing) {
            tools.pathfind();
        }
        else {
            tools.stopPlaying();
        }
    }
    window.runFrame = function runFrame(frames) {
        setPlaying(!playing);
    }
}
/// <reference types="gimloader" />
GL.addEventListener("loadEnd", () => {
});
GL.parcel.interceptRequire("TAS", exports => exports?.PhysicsManager, exports => {
    let physManClass = exports.PhysicsManager;
    delete exports.PhysicsManager;
    exports.PhysicsManager = class extends physManClass {
        constructor() {
            super(...arguments);
            window.pathfindingThis = this;

            window.enablePathfind = function() {
                createInstance(window.pathfindingThis);
            }
        }
    };
});
function onStop() {
    GL.parcel.stopIntercepts("TAS");
    GL.patcher.unpatchAll("TAS");
}
export { onStop };

CommandLine.addCommand("/connectController",
  [],
  () => {
    window.enablePathfind()
    window.startPathfinding()
    setupInput();


    let cameraMove = setInterval( function() {
        let phaser = window.stores.phaser;
        cameraPos = { x: window.stores.phaser.mainCharacter.body.x, y: window.stores.phaser.mainCharacter.body.y };
        let camera = phaser.scene.cameras.cameras[0];
        camera.useBounds = false

        let camHelper = stores.phaser.scene.cameraHelper;
        camHelper.stopFollow();

        cameraPos.x += ( stores.phaser.mainCharacter.body.x - cameraPos.x ) * 0.07;
        cameraPos.y += ( stores.phaser.mainCharacter.body.y - cameraPos.y ) * 0.07;
        camHelper.goTo(cameraPos);
    }, 1);
  })


  export function openSettingsMenu() {
    let actions = ["jump", "interact", "use", "shoot", "left", "right", "drop"];
    
    // Check if the gamepad is connected
    function isGamepadConnected() {
        return navigator.getGamepads()[0] !== null;
    }
    
    // Handle button press
    function handleButtonPress(buttonIndex) {
        console.log(buttonIndex);
        if (waitingForButtonPress !== null) {
            waitingForButtonPress.textContent = `Button ${buttonIndex}`;
            const action = waitingForButtonPress.id;
            localStorage.setItem(`GL_Controller_Connect_${action.charAt(0).toUpperCase() + action.slice(1)}`, buttonIndex);
            waitingForButtonPress = null;
        }
    }
    
    // Print joystick position
    function printJoystickPosition(gamepad) {
        const leftStickX = gamepad.axes[0].toFixed(2);
        const leftStickY = gamepad.axes[1].toFixed(2);
        const rightStickX = gamepad.axes[2].toFixed(2);
        const rightStickY = gamepad.axes[3].toFixed(2);
    }
    
    // Main loop
    function gamepadLoop() {
        const gamepad = navigator.getGamepads()[0];
        if (gamepad) {
            gamepad.buttons.forEach((button, index) => {
                if (button.pressed) {
                    handleButtonPress(index);
                }
            });
            printJoystickPosition(gamepad);
        }
        requestAnimationFrame(gamepadLoop);
    }
    
    // Initialize the gamepad
    function initGamepad() {
        if (isGamepadConnected()) {
            gamepadLoop();
        }
    }
    
    // Check for gamepad connection
    window.addEventListener('gamepadconnected', initGamepad);
    
    // Check for gamepad disconnection
    window.addEventListener('gamepaddisconnected', () => {
        console.log('Gamepad disconnected');
    });
    
    let waitingForButtonPress = null;
    const setButtons = [];
    
    // Create the menu buttons
    function createSetButtons() {
        const modal = document.createElement('div');
        modal.style.position = 'fixed';
        modal.style.top = '50%';
        modal.style.left = '50%';
        modal.style.transform = 'translate(-50%, -50%)';
        modal.style.backgroundColor = '#fff';
        modal.style.padding = '20px';
        modal.style.border = '1px solid #ccc';
        modal.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.1)';
        modal.style.zIndex = 1000;
        modal.style.width = '50%';
        modal.style.height = '50%';
    
        const closeButton = document.createElement('button');
        closeButton.innerText = 'SAVE';
        closeButton.style.position = 'absolute';
        closeButton.style.top = '10px';
        closeButton.style.right = '10px';
        closeButton.style.cursor = 'pointer';
        closeButton.addEventListener('click', () => {
            document.body.removeChild(modal);
            location.reload(); // Reload to reflect changes immediately
        });
    
        modal.appendChild(closeButton);
    
        for (let i = 0; i < actions.length; i++) {
            const action = actions[i];
            const container = document.createElement('div');
            container.style.display = 'flex';
            container.style.alignItems = 'center';
            container.style.margin = '5px 0';
    
            const label = document.createElement('span');
            label.innerText = action + ': ';
            label.style.marginRight = '10px';
    
            const button = document.createElement('span');
            button.id = action;
            button.style.display = 'inline-block';
            button.style.padding = '5px';
            button.style.border = '1px solid #000';
            button.style.background = '#eee';
            button.style.cursor = 'pointer';
            button.style.zIndex = 99999;
            button.addEventListener('click', () => {
                waitingForButtonPress = button;
            });

            // Set button text from local storage if available
            const savedButton = localStorage.getItem(`GL_Controller_Connect_${action.charAt(0).toUpperCase() + action.slice(1)}`);
            if (savedButton) {
                button.textContent = `Button ${savedButton}`;
            } else {
                button.textContent = 'CLICK TO SET';
            }
    
            container.appendChild(label);
            container.appendChild(button);
            modal.appendChild(container);
    
            setButtons.push(button);
        }
    
        document.body.appendChild(modal);
    }
    
    createSetButtons();
    
    console.log('Waiting for gamepad connection...');
}
