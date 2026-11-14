const EventEmitter = require('node:events');

/**
 * AgentBus - Shared Blackboard & Inter-Agent Communication Bus
 * Enables multi-agent collaboration, broadcast channels, deliberation logging,
 * and synchronized state evolution across specialized AI agents.
 */
class AgentBus extends EventEmitter {
  constructor() {
    super();
    this.deliberationLog = [];
    this.blackboard = new Map();
  }

  /**
   * Post an agent thought/action to the shared deliberation log
   * @param {string} agentName - The name/role of the emitting agent
   * @param {string} phase - Workflow phase (e.g., 'DIAGNOSIS', 'ALIGNMENT', 'CURRICULUM_SYNTHESIS')
   * @param {string} message - Human-readable consensus or finding
   * @param {object} payload - Structured metadata exchanged between agents
   */
  logDeliberation(agentName, phase, message, payload = {}) {
    const entry = {
      id: `delib-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      timestamp: new Date().toISOString(),
      agentName,
      phase,
      message,
      payload
    };
    this.deliberationLog.unshift(entry);
    if (this.deliberationLog.length > 200) {
      this.deliberationLog.pop();
    }
    this.emit('agent:deliberation', entry);
    return entry;
  }

  /**
   * Set or update shared memory on the blackboard
   */
  writeBlackboard(key, value) {
    this.blackboard.set(key, {
      value,
      updatedAt: new Date().toISOString()
    });
    this.emit('blackboard:update', { key, value });
  }

  /**
   * Read shared memory from the blackboard
   */
  readBlackboard(key) {
    const record = this.blackboard.get(key);
    return record ? record.value : null;
  }

  /**
   * Retrieve recent agent deliberation entries
   */
  getRecentDeliberations(limit = 25) {
    return this.deliberationLog.slice(0, limit);
  }

  /**
   * Clear deliberation history for clean test runs
   */
  clear() {
    this.deliberationLog = [];
    this.blackboard.clear();
  }
}

// Global Singleton Instance
const sharedAgentBus = new AgentBus();

module.exports = {
  AgentBus,
  sharedAgentBus
};
