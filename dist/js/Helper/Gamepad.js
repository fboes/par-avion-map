export default class GamePad {
    constructor() {
        this.gamepadIndex = null;
        this.isStandardMapping = true;
        this.buttons = [];
        this.triggeredKeys = new Map();
        document.addEventListener('keydown', (event) => { this.onKeydown(event); });
        document.addEventListener('keyup', (event) => { this.onKeydown(event, false); });
        window.addEventListener('gamepadconnected', () => { this.onGamepadConnected(); });
        window.addEventListener('gamepaddisconnected', () => { this.onGamepadConnected(); });
    }
    onGamepadConnected() {
        this.gamepadIndex = this.getBestGamepadIndex();
    }
    onKeydown(event, isDown = true) {
        const tgt = event.target;
        if (GamePad.KEYS_CHECKED.indexOf(event.code) === -1 || !tgt || tgt.nodeName === 'INPUT') {
            //console.log(event.code)
            return;
        }
        event.preventDefault();
        this.triggeredKeys.set(event.code, isDown);
    }
    // ---------------------------------------------------------------------------
    getGamepadState() {
        const keyboardState = this.getKeyboardState();
        const gamepad = this.getGamepad();
        if (gamepad === null) {
            this.buttons = keyboardState.buttons;
            return keyboardState;
        }
        let buttons = gamepad.buttons.map((button, index) => {
            return this.getXboxGamepadButton(button.pressed || (keyboardState.buttons[index] && keyboardState.buttons[index].pressed), index, button.value);
        });
        if (!this.isStandardMapping) {
            {
                let index = GamePad.BUTTON_INDEX.lTrigger;
                let axis = this.convertAxisToButtonValue(gamepad.axes[GamePad.AXIS_INDEX.lTrigger]);
                buttons[index] = this.getXboxGamepadButton((axis > 0) || (keyboardState.buttons[index] && keyboardState.buttons[index].pressed), index, axis);
            }
            {
                let index = GamePad.BUTTON_INDEX.rTrigger;
                let axis = this.convertAxisToButtonValue(gamepad.axes[GamePad.AXIS_INDEX.rTrigger]);
                buttons[index] = this.getXboxGamepadButton((axis > 0) || (keyboardState.buttons[index] && keyboardState.buttons[index].pressed), index, axis);
            }
        }
        this.buttons = buttons;
        return {
            buttons,
            axes: {
                lThumbX: this.axisDeadzone(gamepad.axes[GamePad.AXIS_INDEX.lThumbX]) || keyboardState.axes.lThumbX,
                lThumbY: this.axisDeadzone(gamepad.axes[GamePad.AXIS_INDEX.lThumbY]) || keyboardState.axes.lThumbY,
                rThumbX: this.axisDeadzone(gamepad.axes[GamePad.AXIS_INDEX.rThumbX]) || keyboardState.axes.rThumbX,
                rThumbY: this.axisDeadzone(gamepad.axes[GamePad.AXIS_INDEX.rThumbY]) || keyboardState.axes.rThumbY,
                throttle: this.throttleDeadzone(gamepad.axes[GamePad.AXIS_INDEX.throttle])
            }
        };
    }
    getGamepad() {
        if (this.gamepadIndex === null) {
            return null;
        }
        const gamepads = navigator.getGamepads();
        return gamepads[this.gamepadIndex];
    }
    getKeyboardState() {
        let buttons = [];
        for (let i = 0; i < 17; i++) {
            let currentKeyCode = '';
            switch (i) {
                case GamePad.BUTTON_INDEX.a:
                    currentKeyCode = 'Space';
                    break;
                //case GamePad.BUTTON_INDEX.b: currentKeyCode = ''; break;
                //case GamePad.BUTTON_INDEX.x: currentKeyCode = ''; break;
                //case GamePad.BUTTON_INDEX.y: currentKeyCode = ''; break;
                case GamePad.BUTTON_INDEX.lBumper:
                    currentKeyCode = 'KeyZ';
                    break;
                case GamePad.BUTTON_INDEX.rBumper:
                    currentKeyCode = 'KeyC';
                    break;
                case GamePad.BUTTON_INDEX.lTrigger:
                    currentKeyCode = 'KeyQ';
                    break;
                case GamePad.BUTTON_INDEX.rTrigger:
                    currentKeyCode = 'KeyE';
                    break;
                //case GamePad.BUTTON_INDEX.window: currentKeyCode = ''; break;
                case GamePad.BUTTON_INDEX.menu:
                    currentKeyCode = 'Escape';
                    break;
                //case GamePad.BUTTON_INDEX.thumbL: currentKeyCode = ''; break;
                //case GamePad.BUTTON_INDEX.thumbR: currentKeyCode = ''; break;
                case GamePad.BUTTON_INDEX.dpadUp:
                    currentKeyCode = 'Home';
                    break;
                case GamePad.BUTTON_INDEX.dpadRight:
                    currentKeyCode = 'PageDown';
                    break;
                case GamePad.BUTTON_INDEX.dpadLeft:
                    currentKeyCode = 'Delete';
                    break;
                case GamePad.BUTTON_INDEX.dpadDown:
                    currentKeyCode = 'End';
                    break;
            }
            buttons.push(this.getXboxGamepadButton(currentKeyCode !== '' && this.triggeredKeys.get(currentKeyCode) === true, i));
        }
        const xboxGamepad = {
            buttons,
            axes: {
                lThumbX: this.keysToAxis('KeyA', 'KeyD'),
                lThumbY: this.keysToAxis('KeyW', 'KeyS'),
                rThumbX: this.keysToAxis('ArrowLeft', 'ArrowRight'),
                rThumbY: this.keysToAxis('ArrowUp', 'ArrowDown'),
                throttle: 0
            }
        };
        return xboxGamepad;
    }
    // check for freshly triggered buttons => last state != current state
    getXboxGamepadButton(buttonPressed, index, buttonValue = undefined) {
        if (buttonValue === undefined) {
            buttonValue = buttonPressed ? 1 : 0;
        }
        const triggered = this.buttons[index]
            ? (buttonPressed && this.buttons[index].pressed !== buttonPressed)
            : buttonPressed;
        const released = this.buttons[index]
            ? (!buttonPressed && this.buttons[index].pressed !== buttonPressed)
            : false;
        return {
            triggered,
            released,
            pressed: buttonPressed,
            value: this.axisDeadzone(buttonValue)
        };
    }
    convertAxisToButtonValue(axisValue) {
        return (axisValue + 1) / 2;
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
    throttleDeadzone(axisValue, threshold = 0.1) {
        axisValue = (1 - axisValue) / 2; // 0..1
        if (threshold === 0) {
            return axisValue;
        }
        axisValue = Math.max(0, axisValue - threshold) / (1 - threshold);
        axisValue = Math.min(1, axisValue / (1 - threshold));
        return axisValue;
    }
    keysToAxis(keyCodeMinus, keyCodePlus) {
        let result = this.triggeredKeys.get(keyCodePlus) ? 1 : 0;
        result -= this.triggeredKeys.get(keyCodeMinus) ? 1 : 0;
        return result;
    }
    isButtonPressed(button) {
        return (button.value > 0.5);
    }
    getBestGamepadIndex() {
        const gamepads = navigator.getGamepads();
        let bestQuality = 0;
        let bestGamepadIndex = null;
        gamepads.forEach((gamepad) => {
            if (gamepad === null) {
                return;
            }
            this.isStandardMapping = (gamepad.mapping === 'standard');
            const joystick = !this.isStandardMapping && gamepad.id.match(/(combat)?stick/i);
            if (joystick) {
                console.warn('Joystick with throttle detected', gamepad.id);
                if (bestQuality < 2) {
                    bestQuality = 2;
                    bestGamepadIndex = gamepad.index;
                    GamePad.BUTTON_INDEX.window = 6;
                    GamePad.BUTTON_INDEX.menu = 7;
                    GamePad.BUTTON_INDEX.thumbL = 8;
                    GamePad.BUTTON_INDEX.thumbR = 9;
                    GamePad.BUTTON_INDEX.dpadUp = 10;
                    GamePad.BUTTON_INDEX.dpadRight = 11;
                    GamePad.BUTTON_INDEX.dpadLeft = 12;
                    GamePad.BUTTON_INDEX.dpadDown = 13;
                    GamePad.BUTTON_INDEX.lTrigger = 14;
                    GamePad.BUTTON_INDEX.rTrigger = 15;
                    GamePad.AXIS_INDEX.rThumbX = 3;
                    GamePad.AXIS_INDEX.rThumbY = 4;
                    GamePad.AXIS_INDEX.lTrigger = 2;
                    GamePad.AXIS_INDEX.rTrigger = 5;
                }
                GamePad.AXIS_INDEX.throttle = 2;
                GamePad.AXIS_INDEX.rThumbX = 99;
                GamePad.AXIS_INDEX.rThumbY = 3;
                GamePad.AXIS_INDEX.lTrigger = 99;
                GamePad.AXIS_INDEX.rTrigger = 99;
            }
            else if (!this.isStandardMapping) {
                console.warn('Input device with non-standard mapping detected', gamepad.id);
                if (bestQuality < 1) {
                    bestQuality = 1;
                    bestGamepadIndex = gamepad.index;
                    GamePad.BUTTON_INDEX.window = 6;
                    GamePad.BUTTON_INDEX.menu = 7;
                    GamePad.BUTTON_INDEX.thumbL = 8;
                    GamePad.BUTTON_INDEX.thumbR = 9;
                    GamePad.BUTTON_INDEX.dpadUp = 10;
                    GamePad.BUTTON_INDEX.dpadRight = 11;
                    GamePad.BUTTON_INDEX.dpadLeft = 12;
                    GamePad.BUTTON_INDEX.dpadDown = 13;
                    GamePad.BUTTON_INDEX.lTrigger = 14;
                    GamePad.BUTTON_INDEX.rTrigger = 15;
                    GamePad.AXIS_INDEX.rThumbX = 3;
                    GamePad.AXIS_INDEX.rThumbY = 4;
                    GamePad.AXIS_INDEX.lTrigger = 2;
                    GamePad.AXIS_INDEX.rTrigger = 5;
                }
            }
            else {
                console.log(gamepad.id);
                if (bestQuality < 3) {
                    bestQuality = 3;
                    bestGamepadIndex = gamepad.index;
                    GamePad.BUTTON_INDEX.lBumper = 4;
                    GamePad.BUTTON_INDEX.rBumper = 5;
                    GamePad.BUTTON_INDEX.lTrigger = 6;
                    GamePad.BUTTON_INDEX.rTrigger = 7;
                    GamePad.BUTTON_INDEX.window = 8;
                    GamePad.BUTTON_INDEX.menu = 9;
                    GamePad.BUTTON_INDEX.thumbL = 10;
                    GamePad.BUTTON_INDEX.thumbR = 11;
                    GamePad.BUTTON_INDEX.dpadUp = 12;
                    GamePad.BUTTON_INDEX.dpadRight = 13;
                    GamePad.BUTTON_INDEX.dpadLeft = 14;
                    GamePad.BUTTON_INDEX.dpadDown = 15;
                    GamePad.AXIS_INDEX.rThumbX = 2;
                    GamePad.AXIS_INDEX.rThumbY = 3;
                    GamePad.AXIS_INDEX.lTrigger = 99;
                    GamePad.AXIS_INDEX.rTrigger = 99;
                    GamePad.AXIS_INDEX.throttle = 99;
                }
            }
        });
        console.log('New best gamepad', bestGamepadIndex);
        return bestGamepadIndex;
    }
}
GamePad.KEYS_CHECKED = [
    'KeyA',
    'KeyD',
    'KeyW',
    'KeyS',
    'KeyQ',
    'KeyE',
    'KeyZ',
    'KeyC',
    'Comma',
    'Period',
    'ArrowLeft',
    'ArrowRight',
    'ArrowUp',
    'ArrowDown',
    'Delete',
    'PageDown',
    'Home',
    'End',
    'Escape',
    'Space',
    /*'ShiftLeft',
    'ControlLeft',
    'AltLeft',
    'Slash',
    'Minus',
    'Equal',*/
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
    rTrigger: 99,
    throttle: 99
};
