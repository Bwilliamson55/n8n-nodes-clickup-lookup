import { INodeProperties } from 'n8n-workflow';

export const taskTypeOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['customTaskType'],
			},
		},
		options: [
			{
				name: 'Update a Task with a Custom Task Type',
				value: 'updateTaskWithType',
				action: 'Update a task with a custom task type',
			},
		],
		default: 'updateTaskWithType',
	},
];

export const taskTypeFields: INodeProperties[] = [
	/* -------------------------------------------------------------------------- */
	/*                              task:updateWithTaskType                       */
	/* -------------------------------------------------------------------------- */
	{
		displayName: 'Team Name or ID',
		name: 'team',
		type: 'options',
		description:
			'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>',
		default: '',
		displayOptions: {
			show: {
				resource: ['customTaskType'],
				operation: ['updateTaskWithType'],
			},
		},
		typeOptions: {
			loadOptionsMethod: 'getTeams',
		},
		required: true,
	},
	{
		displayName: 'Task ID',
		name: 'taskId',
		placeholder: '123',
		type: 'string',
		description: 'ID of the task to update',
		default: '',
		displayOptions: {
			show: {
				resource: ['customTaskType'],
				operation: ['updateTaskWithType'],
			},
		},
		required: true,
	},
	{
		displayName: 'Task Type Name or ID',
		name: 'taskType',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getTaskTypes',
			loadOptionsDependsOn: ['team'],
		},
		default: '',
		description: 'The type of the task. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>.',
		displayOptions: {
			show: {
				resource: ['customTaskType'],
				operation: ['updateTaskWithType'],
			},
		},
		required: true,
	},
];
