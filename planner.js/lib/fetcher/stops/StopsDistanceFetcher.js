"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ldloader_1 = require("../../loader/ldloader");
const views_1 = require("../../loader/views");
const constants_1 = require("../../uri/constants");
const uri_1 = __importDefault(require("../../uri/uri"));
class StopsDistanceFetcher {
    constructor() {
        this.ldLoader = new ldloader_1.LDLoader();
    }
    async get(url) {
        const rdfThing = await this.ldFetch.get(url);
        const triples = rdfThing.triples;
        const [distances] = this.ldLoader.process(triples, [
            this.getDistancesView(),
        ]);
        return distances;
    }
    getDistancesView() {
        const nodesView = new views_1.IndexThingView((id) => {
            return { id };
        });
        nodesView.addMapping(uri_1.default.inNS(constants_1.PLANNER, "source"), "from");
        nodesView.addMapping(uri_1.default.inNS(constants_1.PLANNER, "destination"), "to");
        nodesView.addMapping(uri_1.default.inNS(constants_1.PLANNER, "distance"), "distance");
        return nodesView;
    }
}
exports.default = StopsDistanceFetcher;
//# sourceMappingURL=StopsDistanceFetcher.js.map