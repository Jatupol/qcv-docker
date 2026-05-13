"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.purgeTargetRegistry = void 0;
class TargetRegistry {
    constructor() {
        this.targets = new Map();
    }
    register(target) {
        if (this.targets.has(target.key)) {
            throw new Error(`Purge target "${target.key}" already registered`);
        }
        this.targets.set(target.key, target);
    }
    get(key) {
        return this.targets.get(key);
    }
    list() {
        return Array.from(this.targets.values());
    }
    has(key) {
        return this.targets.has(key);
    }
}
exports.purgeTargetRegistry = new TargetRegistry();
