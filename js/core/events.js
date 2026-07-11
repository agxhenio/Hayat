// 📄 js/core/events.js
/**
 * Event Bus (Pub/Sub Pattern)
 * Përdoret për të komunikuar mes moduleve të ndryshme pa krijuar dependenca direkte.
 */
class EventBus {
    constructor() {
        this.events = {};
    }

    // Dëgjo për një event
    on(eventName, callback) {
        if (!this.events[eventName]) {
            this.events[eventName] = [];
        }
        this.events[eventName].push(callback);
    }

    // Dërgo një event
    emit(eventName, data = {}) {
        if (this.events[eventName]) {
            this.events[eventName].forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in event listener for ${eventName}:`, error);
                }
            });
        }
    }

    // Hiq dëgjimin e një eventi
    off(eventName, callback) {
        if (this.events[eventName]) {
            this.events[eventName] = this.events[eventName].filter(cb => cb !== callback);
        }
    }
}

export const events = new EventBus();
