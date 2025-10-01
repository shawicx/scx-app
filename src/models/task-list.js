/**
 * Task List model
 * Represents sequential steps for implementation with dependencies
 */
export class TaskList {
  /**
   * Creates a new TaskList instance
   * @param {Array<Task>} tasks - Array of numbered, ordered tasks
   * @param {Array<Dependency>} dependencies - Task execution order dependencies
   * @param {Array<Task>} parallelizable - Tasks that can run in parallel
   */
  constructor(tasks = [], dependencies = [], parallelizable = []) {
    this.tasks = tasks;
    this.dependencies = dependencies;
    this.parallelizable = parallelizable;
  }

  /**
   * Adds a task to the list
   * @param {Task} task - Task to add
   */
  addTask(task) {
    this.tasks.push(task);
  }

  /**
   * Adds a dependency between tasks
   * @param {Dependency} dependency - Dependency to add
   */
  addDependency(dependency) {
    this.dependencies.push(dependency);
  }

  /**
   * Marks a task as parallelizable
   * @param {Task} task - Task that can run in parallel
   */
  addParallelizableTask(task) {
    this.parallelizable.push(task);
  }

  /**
   * Gets all pending tasks (not yet completed)
   * @returns {Array<Task>} Array of pending tasks
   */
  getPendingTasks() {
    return this.tasks.filter(task => !task.completed);
  }

  /**
   * Gets all tasks that can be executed in parallel
   * @returns {Array<Task>} Array of parallelizable tasks
   */
  getParallelTasks() {
    return this.tasks.filter(task => task.parallel);
  }

  /**
   * Validates the task list for completeness and dependencies
   * @returns {Object} Validation result with status and issues
   */
  validate() {
    const issues = [];
    
    // Check if there are tasks
    if (!this.tasks || this.tasks.length === 0) {
      issues.push('At least one task is required');
    }
    
    // Check for dependencies that reference non-existent tasks
    for (const dep of this.dependencies) {
      const blockingTaskExists = this.tasks.some(task => task.id === dep.blockingTaskId);
      const blockedTaskExists = this.tasks.some(task => task.id === dep.blockedTaskId);
      
      if (!blockingTaskExists) {
        issues.push(`Dependency references non-existent blocking task: ${dep.blockingTaskId}`);
      }
      if (!blockedTaskExists) {
        issues.push(`Dependency references non-existent blocked task: ${dep.blockedTaskId}`);
      }
    }

    return {
      status: issues.length === 0 ? 'pass' : 'fail',
      issues: issues
    };
  }

  /**
   * Marks a task as completed by ID
   * @param {string} taskId - ID of the task to mark as completed
   * @returns {boolean} True if task was found and updated, false otherwise
   */
  markTaskCompleted(taskId) {
    const task = this.tasks.find(t => t.id === taskId);
    if (task) {
      task.completed = true;
      return true;
    }
    return false;
  }

  /**
   * Gets the execution order based on dependencies
   * @returns {Array<Array<Task>>} Array of task batches that can be executed in parallel
   */
  getExecutionOrder() {
    // Group tasks by their dependency levels
    const completed = new Set();
    const executionOrder = [];
    const taskMap = new Map(this.tasks.map(task => [task.id, task]));
    
    // Create dependency graph
    const dependents = new Map();
    for (const dep of this.dependencies) {
      if (!dependents.has(dep.blockingTaskId)) {
        dependents.set(dep.blockingTaskId, []);
      }
      dependents.get(dep.blockingTaskId).push(dep.blockedTaskId);
    }
    
    // Process tasks in dependency order
    while (completed.size < this.tasks.length) {
      const batch = [];
      
      for (const task of this.tasks) {
        if (completed.has(task.id)) continue;
        
        // Check if all dependencies are completed
        let canExecute = true;
        
        for (const dep of this.dependencies) {
          if (dep.blockedTaskId === task.id && !completed.has(dep.blockingTaskId)) {
            canExecute = false;
            break;
          }
        }
        
        if (canExecute) {
          batch.push(task);
        }
      }
      
      if (batch.length === 0) {
        // Circular dependency detected
        throw new Error('Circular dependency detected in task list');
      }
      
      // Add batch to execution order and mark tasks as completed
      executionOrder.push(batch);
      for (const task of batch) {
        completed.add(task.id);
      }
    }
    
    return executionOrder;
  }

  /**
   * Converts the model to a plain object
   * @returns {Object} Plain object representation
   */
  toJSON() {
    return {
      tasks: this.tasks,
      dependencies: this.dependencies,
      parallelizable: this.parallelizable
    };
  }

  /**
   * Creates a TaskList instance from a plain object
   * @param {Object} obj - Plain object representation
   * @returns {TaskList} Instance of TaskList
   */
  static fromJSON(obj) {
    return new TaskList(
      obj.tasks || [],
      obj.dependencies || [],
      obj.parallelizable || []
    );
  }
}

// Type definitions for documentation purposes
/**
 * @typedef {Object} Task
 * @property {string} id - Unique identifier for the task
 * @property {string} description - Description of the task
 * @property {string} filePath - Path to file being modified
 * @property {boolean} parallel - Whether the task can run in parallel
 * @property {boolean} completed - Whether the task has been completed
 * @property {number} phase - Phase number (3.1-3.5)
 */

/**
 * @typedef {Object} Dependency
 * @property {string} blockingTaskId - ID of the task that blocks execution
 * @property {string} blockedTaskId - ID of the task that is blocked
 * @property {string} reason - Reason for the dependency
 */