"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.visualizeIsochrone = exports.visualizeConcaveIsochrone = void 0;
const concaveman = require("concaveman");
const d3_delaunay_1 = require("d3-delaunay");
const UnionFind_1 = __importDefault(require("../../util/UnionFind"));
async function visualizeConcaveIsochrone(pathTree, maxCost, registry) {
    const locations = [];
    for (const node of registry.getNodes()) {
        const branch = pathTree[node.id];
        if (branch) {
            const { duration } = branch;
            if (duration < maxCost) {
                locations.push([node.longitude, node.latitude]);
            }
        }
    }
    let isochrones = [];
    if (locations.length > 0) {
        const shell = concaveman(locations, 2);
        isochrones = [[shell.map((point) => {
                    return { longitude: point[0], latitude: point[1] };
                })]];
    }
    return {
        isochrones,
    };
}
exports.visualizeConcaveIsochrone = visualizeConcaveIsochrone;
function visualizeIsochrone(registry, pathTree, maxCost) {
    /**
     * Isochrones are generated by applying a delaunay triangulisation to the road network nodes,
     * Union-Find (= disjoint set) is used to find clusters of external/internal nodes.
     * Each cluster will form one ring in the isochrone.
     */
    const nodes = [];
    const costs = {};
    for (const [id, branch] of Object.entries(pathTree)) {
        const { duration } = branch;
        const node = registry.getNode(id);
        if (node && duration !== Infinity) {
            nodes.push(node);
            costs[node.id] = duration;
        }
    }
    nodes.push({ latitude: 90, longitude: 180, id: "1", definedTags: {}, freeformTags: [], proximity: {} });
    nodes.push({ latitude: -90, longitude: 180, id: "2", definedTags: {}, freeformTags: [], proximity: {} });
    nodes.push({ latitude: 90, longitude: -180, id: "3", definedTags: {}, freeformTags: [], proximity: {} });
    nodes.push({ latitude: -90, longitude: -180, id: "4", definedTags: {}, freeformTags: [], proximity: {} });
    costs["1"] = Infinity;
    costs["2"] = Infinity;
    costs["3"] = Infinity;
    costs["4"] = Infinity;
    const delaunay = createTriangulation(nodes);
    const internalNodes = nodes.map((node) => costs[node.id] < maxCost);
    const externalNodes = internalNodes.map((v) => !v);
    const internalClusters = clusterNodes(nodes, internalNodes, delaunay);
    const externalClusters = clusterNodes(nodes, externalNodes, delaunay);
    const polygons = internalClusters
        .filter((cluster) => cluster.size > 1)
        .map((internalCluster) => createPolygon(costs, maxCost, nodes, internalCluster, externalClusters, delaunay));
    return {
        isochrones: polygons.filter((p) => p.length > 0),
    };
}
exports.visualizeIsochrone = visualizeIsochrone;
function createTriangulation(nodes) {
    function getX(p) {
        return p.longitude;
    }
    function getY(p) {
        return p.latitude;
    }
    return d3_delaunay_1.Delaunay.from(nodes, getX, getY);
}
function clusterNodes(allNodes, relevantNodes, delaunay) {
    /**
     * Uses Union-Find to cluster the given (relevant) nodes based on the Delaunay triangulisation of all nodes.
     * Returns an array of clusters.
     */
    const forest = new UnionFind_1.default(allNodes.length);
    for (const nodeIndex of Array(allNodes.length).keys()) {
        if (relevantNodes[nodeIndex]) {
            const neighbors = delaunay.neighbors(nodeIndex);
            for (const neighbor of neighbors) {
                if (relevantNodes[neighbor]) {
                    forest.union(nodeIndex, neighbor);
                }
            }
        }
    }
    const clusters = forest.getClusters();
    for (const key of Object.keys(clusters)) {
        if (!relevantNodes[key]) {
            delete clusters[key];
        }
    }
    return Object.values(clusters);
}
function createPolygon(costs, maxCost, nodes, internalNodes, externalClusters, delaunay) {
    /**
     * Creates a polygon for the given cluster of nodes that lie in an isochrone.
     */
    const rings = [];
    // each cluster of external nodes yields a single ring.
    // there's exactly one on the outside of the internal nodes cluster (because union-find)
    // the others will form holes
    for (const externalNodes of externalClusters) {
        const borderLocations = [];
        const borderNodeIds = new Set();
        for (const nodeIndex of Array(nodes.length).keys()) {
            if (!externalNodes.has(nodeIndex) && internalNodes.has(nodeIndex)) {
                for (const neighbor of delaunay.neighbors(nodeIndex)) {
                    if (externalNodes.has(neighbor)) {
                        const point = pointBetween(nodes[nodeIndex], nodes[neighbor], costs, maxCost);
                        if (point) {
                            borderLocations.push(point);
                        }
                    }
                }
            }
        }
        if (borderLocations.length > 0) {
            const triangulation = createTriangulation(borderLocations);
            const firstNode = triangulation.hull;
            const ring = [borderLocations[firstNode.i]];
            let currentNode = firstNode.next;
            while (currentNode.i !== firstNode.i) {
                ring.push(borderLocations[currentNode.i]);
                currentNode = currentNode.next;
            }
            rings.push(ring);
        }
    }
    // FIXME, the ring with the most nodes might not always be the outer ring
    return rings
        .filter((r) => r.length > 0)
        .sort((a, b) => b.length - a.length);
}
function pointBetween(node1, node2, costs, maxCost) {
    const nodeCost1 = costs[node1.id];
    const nodeCost2 = costs[node2.id];
    if (nodeCost1 === Infinity && nodeCost2 === Infinity) {
        return null;
    }
    else if (nodeCost1 === Infinity) {
        return node2;
    }
    else if (nodeCost2 === Infinity) {
        return node1;
    }
    const costDifference1 = Math.abs(nodeCost1 - maxCost);
    const costDifference2 = Math.abs(nodeCost2 - maxCost);
    const relDifference1 = 1 - costDifference1 / (costDifference1 + costDifference2);
    const relDifference2 = 1 - costDifference2 / (costDifference1 + costDifference2);
    const weight = relDifference1 + relDifference2;
    const latitude = (node1.latitude * relDifference1 + node2.latitude * relDifference2) / weight;
    const longitude = (node1.longitude * relDifference1 + node2.longitude * relDifference2) / weight;
    if (isNaN(latitude) || isNaN(longitude)) {
        return null;
    }
    return { latitude, longitude };
}
//# sourceMappingURL=visualize.js.map