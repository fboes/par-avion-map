export default class TwoWay {
  public first: any;
  public second: any;

  public set(index: number, value: any) {
    if (index === 0) {
      this.first = value;
    } else {
      this.second = value;
    }
  }

  public get(index: number): any {
    if (index === 0) {
      return this.first;
    } else {
      return this.second;
    }
  }
}
