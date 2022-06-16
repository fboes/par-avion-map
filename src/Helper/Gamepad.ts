type XboxGamepadButton = {
  triggered: boolean,
  released: boolean,
  pressed: boolean
};

type XboxGamepad = {
  axes: {
    lThumbX: number,
    lThumbY: number,
    rThumbX: number,
    rThumbY: number
  },
  axisButtons: {
    lTrigger: number,
    rTrigger: number
  },
  buttons: XboxGamepadButton[]
}



export default class GamePad {
  protected gamepadId: number | null = null;
  protected isStandardMapping: boolean = true;
  protected buttons: XboxGamepadButton[] = [];

  /*protected keyMap = {
    axes: <any> {
      'KeyA': 'lThumbX', // lThumbX
      'KeyD': 'lThumbX',
      'KeyW': 'lThumbY', // lThumbY
      'KeyS': 'lThumbY',
      'ArrowLeft': 'rThumbX', // rThumbX
      'ArrowRight': 'rThumbX',
      'ArrowUp': 'rThumbY', // rThumbY
      'ArrowDown': 'rThumbY',
      'Delete': '0',
      'PageDown': '0',
      'Home': '0',
      'End': '0',
    },
    buttons: <any> {
      'KeyQ': 'lTrigger', // lTrigger
      'KeyE': 'lBumper', // lBumper
      'KeyZ': 'rTrigger', // rTrigger
      'KeyC': 'rBumper', // rBumper
    }
  };*/
  protected triggeredKeys: Map<string, boolean>;

  static KEYS_CHECKED = [
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
  static BUTTON_INDEX = {
    a: 0, // cross
    b: 1, // circle
    x: 2, // square
    y: 3, // triangle
    lBumper: 4, // l1
    rBumper: 5, // r1
    lTrigger: 6, // l2
    rTrigger: 7, // r2
    window: 8,
    menu: 9,
    thumbL: 10,
    thumbR: 11,
    dpadUp: 12,
    dpadRight: 13,
    dpadLeft: 14,
    dpadDown: 15
  };

  static AXIS_INDEX = {
    lThumbX: 0,
    lThumbY: 1,
    rThumbX: 2,
    rThumbY: 3,
    lTrigger: 99,
    rTrigger: 99
  }

  constructor() {
    this.triggeredKeys = new Map();
    document.addEventListener('keydown', (event) => { this.onKeydown(event); });
    window.addEventListener('gamepadconnected', (event) => { this.onGamepadConnected(event) });
  }

  onGamepadConnected(event: GamepadEvent) {
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

  onKeydown(event: KeyboardEvent) {
    const tgt = event.target as HTMLInputElement;
    if (GamePad.KEYS_CHECKED.indexOf(event.code) === -1 || !tgt || tgt.nodeName === 'INPUT') {
      return;
    }

    event.preventDefault();
    this.triggeredKeys.set(event.code, true);
  }

  protected getGamepad(): Gamepad | null {
    if (this.gamepadId === null) {
      return null;
    }
    const gamepads = navigator.getGamepads();
    return gamepads[this.gamepadId];
  }

  getKeyboardState(): XboxGamepad {
    const buttons = new Array(15).fill({
      triggered: false,
      released: false,
      pressed: false
    });
    this.buttons = buttons;
    const xboxGamepad: XboxGamepad = {
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

  protected keysToAxis(minus: string, plus: string) {
    let result = this.triggeredKeys.get(plus) ? 1 : 0;
    result -= this.triggeredKeys.get(minus) ? 1 : 0;
    return result;
  }

  getGamepadState(): XboxGamepad {
    const gamepad = this.getGamepad();
    if (gamepad === null) {
      return this.getKeyboardState();
    }

    // check for freshly triggered buttons => last state != current state
    const buttons = gamepad.buttons.map((button, index): XboxGamepadButton => {
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
      }
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
    }
  }

  protected axisButton(buttonValue: number, axisValue: number, threshold = 0.2) {
    if (!this.isStandardMapping) {
      buttonValue = (axisValue + 1) / 2;
    }
    return this.axisDeadzone(buttonValue, threshold);
  }

  protected axisDeadzone(axisValue: number, threshold = 0.2) {
    if (threshold === 0) {
      return axisValue;
    }

    const percent = (Math.abs(axisValue) - threshold) / (1 - threshold);
    if (percent < 0) {
      return 0;
    }

    return percent * (axisValue > 0 ? 1 : -1);
  }

  protected isButtonPressed(button: GamepadButton) {
    return (button.value > 0.5);
  }
}
