export default class TwoWay {
    set(index, value) {
        if (index === 0) {
            this.first = value;
        }
        else {
            this.second = value;
        }
    }
    get(index) {
        if (index === 0) {
            return this.first;
        }
        else {
            return this.second;
        }
    }
}
