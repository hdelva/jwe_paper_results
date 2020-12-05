"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require(".");
const x = new _1.IsochroneGenerator({ latitude: 51.0262973, longitude: 3.7110885 });
x.enableDebugLogs();
x.getIsochrone(2500, true).then((y) => {
    console.log(y);
});
//# sourceMappingURL=isochrone.demo.js.map