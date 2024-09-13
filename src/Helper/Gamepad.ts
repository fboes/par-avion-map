type XboxGamepadButton = {
  triggered: boolean;
  released: boolean;
  pressed: boolean;
  value: number;
};

type XboxGamepad = {
  axes: AxisIndex;
  buttons: XboxGamepadButton[];
};

type ButtonIndex = {
  a: number;
  b: number;
  x: number;
  y: number;
  lBumper: number;
  rBumper: number;
  lTrigger: number;
  rTrigger: number;
  window: number;
  menu: number;
  thumbL: number;
  thumbR: number;
  dpadUp: number;
  dpadDown: number;
  dpadLeft: number;
  dpadRight: number;
};

type AxisIndex = {
  lThumbX: number;
  lThumbY: number;
  rThumbX: number;
  rThumbY: number;
  lTrigger: number;
  rTrigger: number;
  // dPadX: number,
  // dPadY: number,
  throttle: number;
};

export default class GamePad {
  protected gamepadIndex: number | null = null;
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
    "KeyA",
    "KeyD",
    "KeyW",
    "KeyS",
    "KeyQ",
    "KeyE",
    "KeyZ",
    "KeyC",
    "Comma",
    "Period",
    "ArrowLeft",
    "ArrowRight",
    "ArrowUp",
    "ArrowDown",
    "Delete",
    "PageDown",
    "Home",
    "End",
    "Escape",
    "Space",
    "ShiftLeft",
    "ControlLeft",
    /*'AltLeft',
    'Slash',
    'Minus',
    'Equal',*/
  ];
  static BUTTON_INDEX: ButtonIndex = {
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
    dpadDown: 13,
    dpadLeft: 14,
    dpadRight: 15,
  };

  static AXIS_INDEX: AxisIndex = {
    lThumbX: 0,
    lThumbY: 1,
    rThumbX: 2,
    rThumbY: 3,
    lTrigger: 99,
    rTrigger: 99,
    // dPadX: 99,
    // dPadY: 99,
    throttle: 99,
  };

  constructor() {
    this.triggeredKeys = new Map();
    document.addEventListener("keydown", (event) => {
      this.onKeydown(event);
    });
    document.addEventListener("keyup", (event) => {
      this.onKeydown(event, false);
    });
    window.addEventListener("gamepadconnected", () => {
      this.onGamepadConnected();
    });
    window.addEventListener("gamepaddisconnected", () => {
      this.onGamepadConnected();
    });
  }

  onGamepadConnected() {
    this.gamepadIndex = this.getBestGamepadIndex();
  }

  onKeydown(event: KeyboardEvent, isDown = true) {
    const tgt = event.target as HTMLInputElement;
    if (
      GamePad.KEYS_CHECKED.indexOf(event.code) === -1 ||
      !tgt ||
      tgt.nodeName === "INPUT"
    ) {
      //console.log(event.code)
      return;
    }

    if (event.code !== "ShiftLeft" && event.code !== "ControlLeft") {
      event.preventDefault();
    }
    this.triggeredKeys.set(event.code, isDown);
  }

  // ---------------------------------------------------------------------------

  getGamepadState(): XboxGamepad {
    const keyboardState = this.getKeyboardState();
    const gamepad = this.getGamepad();
    if (gamepad === null) {
      this.buttons = keyboardState.buttons;
      return keyboardState;
    }

    let buttons = gamepad.buttons.map((button, index): XboxGamepadButton => {
      return this.getXboxGamepadButton(
        button.pressed ||
          (keyboardState.buttons[index] &&
            keyboardState.buttons[index].pressed),
        index,
        button.value,
      );
    });
    if (!this.isStandardMapping) {
      {
        let index = GamePad.BUTTON_INDEX.lTrigger;
        let axis = this.convertAxisToButtonValue(
          gamepad.axes[GamePad.AXIS_INDEX.lTrigger],
        );
        buttons[index] = this.getXboxGamepadButton(
          axis > 0 ||
            (keyboardState.buttons[index] &&
              keyboardState.buttons[index].pressed),
          index,
          axis,
        );
      }
      {
        let index = GamePad.BUTTON_INDEX.rTrigger;
        let axis = this.convertAxisToButtonValue(
          gamepad.axes[GamePad.AXIS_INDEX.rTrigger],
        );
        buttons[index] = this.getXboxGamepadButton(
          axis > 0 ||
            (keyboardState.buttons[index] &&
              keyboardState.buttons[index].pressed),
          index,
          axis,
        );
      }
    }
    this.buttons = buttons;

    return {
      buttons,
      axes: {
        lThumbX:
          this.axisDeadzone(gamepad.axes[GamePad.AXIS_INDEX.lThumbX]) ||
          keyboardState.axes.lThumbX,
        lThumbY:
          this.axisDeadzone(gamepad.axes[GamePad.AXIS_INDEX.lThumbY]) ||
          keyboardState.axes.lThumbY,
        rThumbX:
          this.axisDeadzone(gamepad.axes[GamePad.AXIS_INDEX.rThumbX]) ||
          keyboardState.axes.rThumbX,
        rThumbY:
          this.axisDeadzone(gamepad.axes[GamePad.AXIS_INDEX.rThumbY]) ||
          keyboardState.axes.rThumbY,
        lTrigger:
          this.axisDeadzone(gamepad.axes[GamePad.AXIS_INDEX.lTrigger]) ||
          keyboardState.axes.lTrigger,
        rTrigger:
          this.axisDeadzone(gamepad.axes[GamePad.AXIS_INDEX.rTrigger]) ||
          keyboardState.axes.rTrigger,
        // dPadX: this.axisDeadzone(gamepad.axes[GamePad.AXIS_INDEX.dPadX]) || keyboardState.axes.dPadX,
        // dPadY: this.axisDeadzone(gamepad.axes[GamePad.AXIS_INDEX.dPadY]) || keyboardState.axes.dPadY,
        throttle: this.throttleDeadzone(
          gamepad.axes[GamePad.AXIS_INDEX.throttle],
        ),
      },
    };
  }

  protected getGamepad(): Gamepad | null {
    if (this.gamepadIndex === null) {
      return null;
    }
    const gamepads = navigator.getGamepads();
    return gamepads[this.gamepadIndex];
  }

  protected getKeyboardState(): XboxGamepad {
    let buttons: XboxGamepadButton[] = [];
    for (let i = 0; i < 17; i++) {
      let currentKeyCode = "";
      switch (i) {
        case GamePad.BUTTON_INDEX.a:
          currentKeyCode = "Space";
          break;
        //case GamePad.BUTTON_INDEX.b: currentKeyCode = ''; break;
        //case GamePad.BUTTON_INDEX.x: currentKeyCode = ''; break;
        //case GamePad.BUTTON_INDEX.y: currentKeyCode = ''; break;
        case GamePad.BUTTON_INDEX.lBumper:
          currentKeyCode = "KeyZ";
          break;
        case GamePad.BUTTON_INDEX.rBumper:
          currentKeyCode = "KeyC";
          break;
        case GamePad.BUTTON_INDEX.lTrigger:
          currentKeyCode = "KeyQ";
          break;
        case GamePad.BUTTON_INDEX.rTrigger:
          currentKeyCode = "KeyE";
          break;
        //case GamePad.BUTTON_INDEX.window: currentKeyCode = ''; break;
        case GamePad.BUTTON_INDEX.menu:
          currentKeyCode = "Escape";
          break;
        //case GamePad.BUTTON_INDEX.thumbL: currentKeyCode = ''; break;
        //case GamePad.BUTTON_INDEX.thumbR: currentKeyCode = ''; break;
        case GamePad.BUTTON_INDEX.dpadUp:
          currentKeyCode = "Home";
          break;
        case GamePad.BUTTON_INDEX.dpadDown:
          currentKeyCode = "End";
          break;
        case GamePad.BUTTON_INDEX.dpadLeft:
          currentKeyCode = "Delete";
          break;
        case GamePad.BUTTON_INDEX.dpadRight:
          currentKeyCode = "PageDown";
          break;
      }
      buttons.push(
        this.getXboxGamepadButton(
          currentKeyCode !== "" &&
            this.triggeredKeys.get(currentKeyCode) === true,
          i,
        ),
      );
    }

    const xboxGamepad: XboxGamepad = {
      buttons,
      axes: {
        lThumbX: this.keysToAxis("KeyA", "KeyD"),
        lThumbY: this.keysToAxis("KeyW", "KeyS"),
        rThumbX: this.keysToAxis("ArrowLeft", "ArrowRight"),
        rThumbY: this.keysToAxis("ArrowUp", "ArrowDown"),
        lTrigger: 0,
        rTrigger: 0,
        // dPadX: 0,
        // dPadY: 0,
        throttle: 0,
      },
    };

    return xboxGamepad;
  }

  // check for freshly triggered buttons => last state != current state
  protected getXboxGamepadButton(
    buttonPressed: boolean,
    index: number,
    buttonValue: number | undefined = undefined,
  ): XboxGamepadButton {
    if (buttonValue === undefined) {
      buttonValue = buttonPressed ? 1 : 0;
    }
    const triggered = this.buttons[index]
      ? buttonPressed && this.buttons[index].pressed !== buttonPressed
      : buttonPressed;
    const released = this.buttons[index]
      ? !buttonPressed && this.buttons[index].pressed !== buttonPressed
      : false;
    return {
      triggered,
      released,
      pressed: buttonPressed,
      value: this.axisDeadzone(buttonValue),
    };
  }

  protected convertAxisToButtonValue(axisValue: number) {
    return (axisValue + 1) / 2;
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

  protected throttleDeadzone(axisValue: number, threshold = 0.1) {
    axisValue = (1 - axisValue) / 2; // 0..1
    if (threshold === 0) {
      return axisValue;
    }

    axisValue = Math.max(0, axisValue - threshold) / (1 - threshold);
    axisValue = Math.min(1, axisValue / (1 - threshold));

    return axisValue;
  }

  protected keysToAxis(keyCodeMinus: string, keyCodePlus: string) {
    let maxAxis = this.triggeredKeys.get("ShiftLeft") ? 1 : 0.5;
    maxAxis = this.triggeredKeys.get("ControlLeft") ? 0.25 : maxAxis;
    let result = this.triggeredKeys.get(keyCodePlus) ? maxAxis : 0;
    result -= this.triggeredKeys.get(keyCodeMinus) ? maxAxis : 0;
    return result;
  }

  protected isButtonPressed(button: GamepadButton) {
    return button.value > 0.5;
  }

  protected getBestGamepadIndex(): number | null {
    const gamepads = navigator.getGamepads();
    let bestQuality = 0;
    let bestGamepadIndex = null;

    gamepads.forEach((gamepad) => {
      if (gamepad === null) {
        return;
      }
      this.isStandardMapping = gamepad.mapping === "standard";

      if (
        !this.isStandardMapping &&
        gamepad.id.match(/((combat)?stick|T\.1600)/i)
      ) {
        console.warn("Joystick with throttle detected", gamepad.id);
        if (bestQuality < 2) {
          const thrustmaster = gamepad.id.match(/T\.1600/i);
          bestQuality = 2;
          bestGamepadIndex = gamepad.index;

          GamePad.BUTTON_INDEX = {
            a: 0, // Trigger
            b: 1, // Lower secondary
            x: 2, // Upper secondary
            y: 3, // Pinky
            lBumper: 7, // Coolie lt
            rBumper: 5, // Coolie rt
            lTrigger: 4, // Coolie up
            rTrigger: 6, // Coolie dn
            window: 99,
            menu: 99,
            thumbL: 8, // Outer index
            thumbR: 9, // Bomb release
            dpadUp: 99,
            dpadDown: 99,
            dpadLeft: 99,
            dpadRight: 99,
          };

          GamePad.AXIS_INDEX = {
            lThumbX: 0,
            lThumbY: 1,
            rThumbX: 99,
            rThumbY: thrustmaster ? 5 : 3,
            lTrigger: 99,
            rTrigger: 99,
            // dPadX: 99,
            // dPadY: 99,
            throttle: thrustmaster ? 6 : 2,
          };
        }
      } else if (!this.isStandardMapping) {
        console.warn(
          "Input device with non-standard mapping detected",
          gamepad.id,
        );
        if (bestQuality < 1) {
          bestQuality = 1;
          bestGamepadIndex = gamepad.index;

          GamePad.BUTTON_INDEX = {
            a: 0, // cross
            b: 1, // circle
            x: 2, // square
            y: 3, // triangle
            lBumper: 4, // l1
            rBumper: 5, // r1
            lTrigger: 99, // l2
            rTrigger: 99, // r2
            window: 6,
            menu: 7,
            //logo: 8
            thumbL: 9,
            thumbR: 10,
            dpadUp: 99,
            dpadDown: 99,
            dpadLeft: 99,
            dpadRight: 99,
          };

          GamePad.AXIS_INDEX = {
            lThumbX: 0,
            lThumbY: 1,
            rThumbX: 3,
            rThumbY: 4,
            lTrigger: 2,
            rTrigger: 5,
            // dPadX: 6,
            // dPadY: 7,
            throttle: 99,
          };

          //GamePad.BUTTON_INDEX.lTrigger = 14;
          //GamePad.BUTTON_INDEX.rTrigger = 15;
        }
      } else {
        console.log(gamepad.id);
        if (bestQuality < 3) {
          bestQuality = 3;
          bestGamepadIndex = gamepad.index;

          GamePad.BUTTON_INDEX = {
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
            dpadDown: 12,
            dpadLeft: 13,
            dpadRight: 14,
          };

          GamePad.AXIS_INDEX = {
            lThumbX: 0,
            lThumbY: 1,
            rThumbX: 2,
            rThumbY: 3,
            lTrigger: 99,
            rTrigger: 99,
            // dPadX: 99,
            // dPadY: 99,
            throttle: 99,
          };
        }
      }
    });

    console.log("New best gamepad", bestGamepadIndex);

    return bestGamepadIndex;
  }
}
