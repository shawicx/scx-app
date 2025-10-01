// Unit tests for Task List model
import { test, expect, describe } from 'vitest';
import { TaskList } from '../../../src/models/task-list.js';

describe('TaskList Model', () => {
  test('should create a task list with provided parameters', () => {
    const tasks = [
      { id: 'T001', description: 'Task 1', filePath: './file1.js', completed: false, parallel: true, phase: '3.1' }
    ];
    const dependencies = [
      { blockingTaskId: 'T001', blockedTaskId: 'T002', reason: 'Dependency' }
    ];
    const parallelizable = [
      { id: 'T001', description: 'Task 1', filePath: './file1.js', completed: false, parallel: true, phase: '3.1' }
    ];

    const taskList = new TaskList(tasks, dependencies, parallelizable);

    expect(taskList.tasks).toBe(tasks);
    expect(taskList.dependencies).toBe(dependencies);
    expect(taskList.parallelizable).toBe(parallelizable);
  });

  test('should create an empty task list with default parameters', () => {
    const taskList = new TaskList();

    expect(Array.isArray(taskList.tasks)).toBe(true);
    expect(taskList.tasks).toHaveLength(0);
    expect(Array.isArray(taskList.dependencies)).toBe(true);
    expect(taskList.dependencies).toHaveLength(0);
    expect(Array.isArray(taskList.parallelizable)).toBe(true);
    expect(taskList.parallelizable).toHaveLength(0);
  });

  test('should add a task to the list', () => {
    const taskList = new TaskList();
    const task = { id: 'T001', description: 'New task' };
    
    taskList.addTask(task);
    
    expect(taskList.tasks).toHaveLength(1);
    expect(taskList.tasks[0]).toBe(task);
  });

  test('should add a dependency to the list', () => {
    const taskList = new TaskList();
    const dependency = { blockingTaskId: 'T001', blockedTaskId: 'T002', reason: 'Dependency' };
    
    taskList.addDependency(dependency);
    
    expect(taskList.dependencies).toHaveLength(1);
    expect(taskList.dependencies[0]).toBe(dependency);
  });

  test('should add a parallelizable task', () => {
    const taskList = new TaskList();
    const task = { id: 'T001', description: 'Parallel task' };
    
    taskList.addParallelizableTask(task);
    
    expect(taskList.parallelizable).toHaveLength(1);
    expect(taskList.parallelizable[0]).toBe(task);
  });

  test('should get pending tasks correctly', () => {
    const taskList = new TaskList([
      { id: 'T001', completed: false },
      { id: 'T002', completed: true },
      { id: 'T003', completed: false }
    ]);
    
    const pending = taskList.getPendingTasks();
    expect(pending).toHaveLength(2);
    expect(pending[0].id).toBe('T001');
    expect(pending[1].id).toBe('T003');
    expect(pending.some(t => t.id === 'T002')).toBe(false);
  });

  test('should get parallel tasks correctly', () => {
    const taskList = new TaskList([
      { id: 'T001', parallel: true },
      { id: 'T002', parallel: false },
      { id: 'T003', parallel: true }
    ]);
    
    const parallelTasks = taskList.getParallelTasks();
    expect(parallelTasks).toHaveLength(2);
    expect(parallelTasks[0].id).toBe('T001');
    expect(parallelTasks[1].id).toBe('T003');
    expect(parallelTasks.some(t => t.id === 'T002')).toBe(false);
  });

  test('should validate a valid task list', () => {
    const tasks = [
      { id: 'T001', description: 'Task 1' },
      { id: 'T002', description: 'Task 2' }
    ];
    const dependencies = [
      { blockingTaskId: 'T001', blockedTaskId: 'T002', reason: 'Dependency' }
    ];
    
    const taskList = new TaskList(tasks, dependencies);

    const validation = taskList.validate();
    expect(validation.status).toBe('pass');
    expect(validation.issues).toHaveLength(0);
  });

  test('should fail validation for task list without tasks', () => {
    const taskList = new TaskList([], []);

    const validation = taskList.validate();
    expect(validation.status).toBe('fail');
    expect(validation.issues).toContain('At least one task is required');
  });

  test('should fail validation for task list with non-existent dependency targets', () => {
    const tasks = [
      { id: 'T001', description: 'Task 1' }
      // Note: T002 does not exist
    ];
    const dependencies = [
      { blockingTaskId: 'T001', blockedTaskId: 'T002', reason: 'Dependency' }  // T002 doesn't exist
    ];
    
    const taskList = new TaskList(tasks, dependencies);

    const validation = taskList.validate();
    expect(validation.status).toBe('fail');
    expect(validation.issues).toContain('Dependency references non-existent blocked task: T002');
  });

  test('should mark a task as completed', () => {
    const tasks = [
      { id: 'T001', completed: false },
      { id: 'T002', completed: false }
    ];
    const taskList = new TaskList(tasks);

    const result = taskList.markTaskCompleted('T001');
    expect(result).toBe(true);
    expect(taskList.tasks[0].completed).toBe(true);
  });

  test('should return false when trying to mark non-existent task as completed', () => {
    const tasks = [
      { id: 'T001', completed: false }
    ];
    const taskList = new TaskList(tasks);

    const result = taskList.markTaskCompleted('T002');  // Doesn't exist
    expect(result).toBe(false);
    expect(taskList.tasks[0].completed).toBe(false);
  });

  test('should get correct execution order for tasks without dependencies', () => {
    const tasks = [
      { id: 'T001', description: 'Task 1', phase: '3.1' },
      { id: 'T002', description: 'Task 2', phase: '3.1' }
    ];
    const taskList = new TaskList(tasks, []);

    const executionOrder = taskList.getExecutionOrder();
    expect(executionOrder).toHaveLength(1);  // All tasks can execute in one batch
    expect(executionOrder[0]).toHaveLength(2);
    expect(executionOrder[0].some(t => t.id === 'T001')).toBe(true);
    expect(executionOrder[0].some(t => t.id === 'T002')).toBe(true);
  });

  test('should get correct execution order for tasks with dependencies', () => {
    const tasks = [
      { id: 'T001', description: 'Task 1', phase: '3.1' },
      { id: 'T002', description: 'Task 2', phase: '3.1' },
      { id: 'T003', description: 'Task 3', phase: '3.1' }
    ];
    const dependencies = [
      { blockingTaskId: 'T001', blockedTaskId: 'T002', reason: 'T002 needs T001' },
      { blockingTaskId: 'T002', blockedTaskId: 'T003', reason: 'T003 needs T002' }
    ];
    const taskList = new TaskList(tasks, dependencies);

    const executionOrder = taskList.getExecutionOrder();
    expect(executionOrder).toHaveLength(3);  // Three separate batches due to dependencies
    expect(executionOrder[0][0].id).toBe('T001');  // First: T001 can run
    expect(executionOrder[1][0].id).toBe('T002');  // Then: T002 can run after T001
    expect(executionOrder[2][0].id).toBe('T003');  // Finally: T003 can run after T002
  });

  test('should convert to JSON correctly', () => {
    const tasks = [
      { id: 'T001', description: 'Task 1', completed: false }
    ];
    const dependencies = [
      { blockingTaskId: 'T001', blockedTaskId: 'T002', reason: 'Dependency' }
    ];
    const parallelizable = [
      { id: 'T001', description: 'Task 1' }
    ];

    const taskList = new TaskList(tasks, dependencies, parallelizable);

    const json = taskList.toJSON();
    expect(json.tasks).toBe(tasks);
    expect(json.dependencies).toBe(dependencies);
    expect(json.parallelizable).toBe(parallelizable);
  });

  test('should create from JSON correctly', () => {
    const json = {
      tasks: [
        { id: 'T001', description: 'Task 1', completed: false }
      ],
      dependencies: [
        { blockingTaskId: 'T001', blockedTaskId: 'T002', reason: 'Dependency' }
      ],
      parallelizable: [
        { id: 'T001', description: 'Task 1' }
      ]
    };

    const taskList = TaskList.fromJSON(json);
    expect(taskList.tasks).toHaveLength(1);
    expect(taskList.dependencies).toHaveLength(1);
    expect(taskList.parallelizable).toHaveLength(1);
  });
});