"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
require("isomorphic-fetch");
require("reflect-metadata");
const Planner_1 = __importDefault(require("./Planner"));
exports.default = Planner_1.default;
const inversify_config_1 = __importDefault(require("./inversify.config"));
const types_1 = __importDefault(require("./types"));
const Geo_1 = __importDefault(require("./util/Geo"));
const Iterators_1 = __importDefault(require("./util/Iterators"));
async function loadPairs(stopsProvider) {
    const original = JSON.parse(fs.readFileSync("nmbs_pairs.json").toString());
    const resolved = [];
    for (const pair of original) {
        const from = await stopsProvider.getStopById(pair[0]);
        const to = await stopsProvider.getStopById(pair[1]);
        resolved.push([from, to]);
    }
    const bidirectional = resolved.map((p) => [[p[0], p[1]], [p[1], p[0]]]).flat();
    bidirectional.sort((a, b) => Geo_1.default.getDistanceBetweenLocations(a[0], a[1]) -
        Geo_1.default.getDistanceBetweenLocations(b[0], b[1]));
    return bidirectional;
}
async function doStuff() {
    const stopsProvider = inversify_config_1.default.get(types_1.default.StopsProvider);
    const planner = inversify_config_1.default.get(types_1.default.RoadPlanner);
    const pairs = await loadPairs(stopsProvider);
    let done = 0;
    for (const pair of pairs) {
        done += 1;
        console.log("done", pairs.length - done);
        const [to, from] = pair;
        let allDistances = {};
        let fileId = to.split("//")[1];
        fileId = fileId.replace(/\./g, "_");
        fileId = fileId.replace(/\//g, "_");
        const fileName = `distances/${fileId}.json`;
        fs.readFile(fileName, (err, data) => {
            if (data && data.length) {
                allDistances = JSON.parse(data.toString());
            }
        });
        if (allDistances[to.id]) {
            continue;
        }
        try {
            const query = {
                from: [from],
                to: [to],
                minimumWalkingSpeed: 4.5,
                maximumWalkingSpeed: 4.5,
            };
            const pathIterator = await planner.plan(query);
            const distanceIterator = pathIterator.map((path) => path.steps.reduce((totalDistance, step) => totalDistance + step.distance, 0));
            const distances = await Iterators_1.default.toArray(distanceIterator);
            if (distances.length) {
                const shortest = Math.min(...distances);
                allDistances[to.id] = shortest;
                await fs.writeFile(fileName, JSON.stringify(allDistances), "utf-8", (err) => {
                    if (err) {
                        throw err;
                    }
                    console.log("The file has been saved!");
                });
            }
        }
        catch (yes) {
            console.log(yes);
        }
    }
}
doStuff().then(() => {
    const x = 9;
});
//# sourceMappingURL=preprocess_distances.js.map