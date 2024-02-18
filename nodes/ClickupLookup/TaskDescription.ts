import { INodeProperties } from 'n8n-workflow';

export const taskOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['task'],
			},
		},
		options: [
			{
				name: 'Field Options Lookup',
				value: 'lookup',
				description: 'Lookup options from task fields',
				action: 'Lookup task field options',
			},
			{
				name: 'Custom Task Type Lookup',
				value: 'customTaskType',
				description: 'Lookup custom task types',
				action: 'Lookup custom task types',
			}
		],
		default: 'lookup',
	},
];

export const taskFields: INodeProperties[] = [
	/* -------------------------------------------------------------------------- */
	/*                                task:lookup                                 */
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
				resource: ['task'],
				operation: ['lookup', 'customTaskType'],
			},
		},
		typeOptions: {
			loadOptionsMethod: 'getTeams',
		},
		required: true,
	},
	{
		displayName: 'Space Name or ID',
		name: 'space',
		type: 'options',
		description:
			'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>',
		default: '',
		displayOptions: {
			show: {
				resource: ['task'],
				operation: ['lookup'],
			},
		},
		typeOptions: {
			loadOptionsMethod: 'getSpaces',
			loadOptionsDependsOn: ['team'],
		},
		required: true,
	},
	{
		displayName: 'Folderless List',
		name: 'folderless',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				resource: ['task'],
				operation: ['lookup'],
			},
		},
		required: true,
	},
	{
		displayName: 'Folder Name or ID',
		name: 'folder',
		type: 'options',
		description:
			'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>',
		default: '',
		displayOptions: {
			show: {
				resource: ['task'],
				operation: ['lookup'],
				folderless: [false],
			},
		},
		typeOptions: {
			loadOptionsMethod: 'getFolders',
			loadOptionsDependsOn: ['space'],
		},
		required: true,
	},
	{
		displayName: 'List Name or ID',
		name: 'list',
		type: 'options',
		description:
			'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>',
		default: '',
		displayOptions: {
			show: {
				resource: ['task'],
				operation: ['lookup'],
				folderless: [true],
			},
		},
		typeOptions: {
			loadOptionsMethod: 'getFolderlessLists',
			loadOptionsDependsOn: ['space'],
		},
		required: true,
	},
	{
		displayName: 'List Name or ID',
		name: 'list',
		type: 'options',
		description:
			'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>',
		default: '',
		displayOptions: {
			show: {
				resource: ['task'],
				operation: ['lookup'],
				folderless: [false],
			},
		},
		typeOptions: {
			loadOptionsMethod: 'getLists',
			loadOptionsDependsOn: ['folder'],
		},
		required: true,
	},
	{
		displayName: 'Custom Field Lookups',
		name: 'customFieldsUi',
		placeholder: 'Add Custom Field Lookup',
		type: 'fixedCollection',
		typeOptions: {
			multipleValues: true,
		},
		description: 'Add a custom field lookup',
		default: {},
		displayOptions: {
			show: {
				resource: ['task'],
				operation: ['lookup'],
			},
		},
		options: [
			{
				name: 'customFieldsValues',
				displayName: 'Custom Field',
				values: [
					{
						displayName: 'Field Name or ID',
						name: 'fieldKey',
						type: 'options',
						typeOptions: {
							loadOptionsMethod: 'getCustomFieldsProperties',
							loadOptionsDependsOn: ['list'],
						},
						default: '',
						description:
							'The ID of the field to lookup against. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>.',
					},
					{
						displayName: 'Type',
						name: 'type',
						type: 'hidden',
						default: '={{$parameter["&fieldKey"].split("|")[1]}}',
					},
					{
						// eslint-disable-next-line n8n-nodes-base/node-param-display-name-wrong-for-dynamic-options
						displayName: 'Field Options Reference',
						name: 'fieldOptionsReference',
						type: 'options',
						ignoreValidationDuringExecution: true,
						typeOptions: {
							loadOptionsMethod: 'getDropDownFieldValues',
							loadOptionsDependsOn: ['fieldKey'],
						},
						displayOptions: {
							show: {
								type: ['drop_down', 'labels'],
							},
						},
						default: '',
						// eslint-disable-next-line n8n-nodes-base/node-param-description-wrong-for-dynamic-options
						description:
							'This is just for reference and does not affect the output of this node or field',
					},
					{
						displayName: 'Lookup Value',
						name: 'value',
						type: 'string',
						default: '*',
						description:
							'The value to lookup. If left empty or *, all options will be returned.',
					},
					{
						displayName: 'Match To',
						name: 'matchTo',
						type: 'options',
						noDataExpression: true,
						displayOptions: {
							show: {
								type: ['labels'],
							},
						},
						options: [
							{
								name: 'Color',
								value: 'color',
								description: 'Match to the field options Color',
								action: 'Match to field value Color',
							},
							{
								name: 'ID',
								value: 'id',
								description: 'Match to the field options ID',
								action: 'Match to field value Id',
							},
							{
								name: 'Label',
								value: 'label',
								description: 'Match to the field options Label',
								action: 'Match to field value Label',
							},
						],
						default: 'id',
					},
					{
						displayName: 'Match To',
						name: 'matchTo',
						type: 'options',
						noDataExpression: true,
						displayOptions: {
							show: {
								type: ['drop_down'],
							},
						},
						options: [
							{
								name: 'Color',
								value: 'color',
								description: 'Match to the field options Color',
								action: 'Match to field value Color',
							},
							{
								name: 'ID',
								value: 'id',
								description: 'Match to the field options ID',
								action: 'Match to field value Id',
							},
							{
								name: 'Index',
								value: 'orderindex',
								description: 'Match to the field options OrderIndex',
								action: 'Match to field value Index',
							},
							{
								name: 'Name',
								value: 'name',
								description: 'Match to the field options Name',
								action: 'Match to field value Name',
							},
						],
						default: 'id',
					},
					{
						displayName: 'Output',
						name: 'output',
						type: 'options',
						noDataExpression: true,
						displayOptions: {
							show: {
								type: ['drop_down'],
							},
						},
						options: [
							{
								name: 'Color',
								value: 'color',
								description: 'Output the matched field options Color',
								action: 'Output a matched field options Color',
							},
							{
								name: 'ID',
								value: 'id',
								description: 'Output the matched field options ID',
								action: 'Output a matched field options Id',
							},
							{
								name: 'Index',
								value: 'orderindex',
								description: 'Output the matched field options OrderIndex',
								action: 'Output the matched field value Index',
							},
							{
								name: 'Name',
								value: 'name',
								description: 'Output the matched field options Name',
								action: 'Output a matched field options Name',
							},
							{
								name: 'Object',
								value: 'object',
								description: 'Output the matched field options Object',
								action: 'Output a matched field options Color',
							},
						],
						default: 'id',
					},
					{
						displayName: 'Output',
						name: 'output',
						type: 'options',
						noDataExpression: true,
						displayOptions: {
							show: {
								type: ['labels'],
							},
						},
						options: [
							{
								name: 'Color',
								value: 'color',
								description: 'Output the matched field options Color',
								action: 'Output a matched field options Color',
							},
							{
								name: 'ID',
								value: 'id',
								description: 'Output the matched field options ID',
								action: 'Output a matched field options Id',
							},
							{
								name: 'Label',
								value: 'label',
								description: 'Output the field options Label',
								action: 'Output field Label',
							},
							{
								name: 'Object',
								value: 'object',
								description: 'Output the matched field options Object',
								action: 'Output a matched field options Color',
							},
						],
						default: 'id',
					},
				],
			},
		],
	},
];
