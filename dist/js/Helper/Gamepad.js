export default class GamePad {
    constructor() {
        this.gamepadId = null;
        this.isStandardMapping = true;
        this.buttons = [];
        this.triggeredKeys = new Map();
        document.addEventListener('keydown', (event) => { this.onKeydown(event); });
        window.addEventListener('gamepadconnected', (event) => { this.onGamepadConnected(event); });
    }
    onGamepadConnected(event) {
        this.gamepadId = event.gamepad.index;
        this.isStandardMapping = (event.gamepad.mapping === 'standard');
        if (!this.isStandardMapping) {
            GamePad.BUTTON_INDEX.window = 6;
            GamePad.BUTTON_INDEX.menu = 7;
            GamePad.BUTTON_INDEX.thumbL = 8;
            GamePad.BUTTON_INDEX.thumbR = 9;
            GamePad.BUTTON_INDEX.dpadUp = 10;
            GamePad.BUTTON_INDEX.dpadRight = 11;
            GamePad.BUTTON_INDEX.dpadLeft = 12;
            GamePad.BUTTON_INDEX.dpadDown = 13;
            GamePad.AXIS_INDEX.rThumbX = 3;
            GamePad.AXIS_INDEX.rThumbY = 4;
            GamePad.AXIS_INDEX.lTrigger = 2;
            GamePad.AXIS_INDEX.rTrigger = 5;
        }
    }
    onKeydown(event) {
        const tgt = event.target;
        if (GamePad.KEYS_CHECKED.indexOf(event.code) === -1 || !tgt || tgt.nodeName === 'INPUT') {
            return;
        }
        event.preventDefault();
        this.triggeredKeys.set(event.code, true);
    }
    getGamepad() {
        if (this.gamepadId === null) {
            return null;
        }
        const gamepads = navigator.getGamepads();
        return gamepads[this.gamepadId];
    }
    getKeyboardState() {
        const buttons = new Array(15).fill({
            triggered: false,
            released: false,
            pressed: false
        });
        this.buttons = buttons;
        const xboxGamepad = {
            buttons,
            axes: {
                lThumbX: this.keysToAxis('KeyA', 'KeyD'),
                lThumbY: this.keysToAxis('KeyW', 'KeyS'),
                rThumbX: this.keysToAxis('ArrowLeft', 'ArrowRight'),
                rThumbY: this.keysToAxis('ArrowUp', 'ArrowDown')
            },
            axisButtons: {
                lTrigger: this.triggeredKeys.get('KeyQ') ? 1 : 0,
                rTrigger: this.triggeredKeys.get('KeyE') ? 1 : 0,
            }
        };
        this.triggeredKeys.clear();
        return xboxGamepad;
    }
    keysToAxis(minus, plus) {
        let result = this.triggeredKeys.get(plus) ? 1 : 0;
        result -= this.triggeredKeys.get(minus) ? 1 : 0;
        return result;
    }
    getGamepadState() {
        const gamepad = this.getGamepad();
        if (gamepad === null) {
            return this.getKeyboardState();
        }
        // check for freshly triggered buttons => last state != current state
        const buttons = gamepad.buttons.map((button, index) => {
            const triggered = this.buttons[index]
                ? (button.pressed && this.buttons[index].pressed !== button.pressed)
                : button.pressed;
            const released = this.buttons[index]
                ? (!button.pressed && this.buttons[index].pressed !== button.pressed)
                : false;
            return {
                triggered,
                released,
                pressed: button.pressed
            };
        });
        this.buttons = buttons;
        return {
            buttons,
            axes: {
                lThumbX: this.axisDeadzone(gamepad.axes[GamePad.AXIS_INDEX.lThumbX]),
                lThumbY: this.axisDeadzone(gamepad.axes[GamePad.AXIS_INDEX.lThumbY]),
                rThumbX: this.axisDeadzone(gamepad.axes[GamePad.AXIS_INDEX.rThumbX]),
                rThumbY: this.axisDeadzone(gamepad.axes[GamePad.AXIS_INDEX.rThumbY])
            },
            axisButtons: {
                lTrigger: this.axisButton(gamepad.buttons[GamePad.BUTTON_INDEX.lTrigger].value, gamepad.axes[GamePad.AXIS_INDEX.lTrigger]),
                rTrigger: this.axisButton(gamepad.buttons[GamePad.BUTTON_INDEX.rTrigger].value, gamepad.axes[GamePad.AXIS_INDEX.rTrigger]),
            }
        };
    }
    axisButton(buttonValue, axisValue, threshold = 0.2) {
        if (!this.isStandardMapping) {
            buttonValue = (axisValue + 1) / 2;
        }
        return this.axisDeadzone(buttonValue, threshold);
    }
    axisDeadzone(axisValue, threshold = 0.2) {
        if (threshold === 0) {
            return axisValue;
        }
        const percent = (Math.abs(axisValue) - threshold) / (1 - threshold);
        if (percent < 0) {
            return 0;
        }
        return percent * (axisValue > 0 ? 1 : -1);
    }
    isButtonPressed(button) {
        return (button.value > 0.5);
    }
}
GamePad.KEYS_CHECKED = [
    'KeyA',
    'KeyD',
    'KeyW',
    'KeyS',
    'ArrowLeft',
    'ArrowRight',
    'ArrowUp',
    'ArrowDown',
    'Delete',
    'PageDown',
    'Home',
    'End',
    'KeyQ',
    'KeyE',
    'KeyZ',
    'KeyC',
];
GamePad.BUTTON_INDEX = {
    a: 0,
    b: 1,
    x: 2,
    y: 3,
    lBumper: 4,
    rBumper: 5,
    lTrigger: 6,
    rTrigger: 7,
    window: 8,
    menu: 9,
    thumbL: 10,
    thumbR: 11,
    dpadUp: 12,
    dpadRight: 13,
    dpadLeft: 14,
    dpadDown: 15
};
GamePad.AXIS_INDEX = {
    lThumbX: 0,
    lThumbY: 1,
    rThumbX: 2,
    rThumbY: 3,
    lTrigger: 99,
    rTrigger: 99
};