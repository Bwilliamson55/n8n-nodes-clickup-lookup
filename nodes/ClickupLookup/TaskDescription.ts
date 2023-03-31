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
				operation: ['lookup'],
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
						displayName: 'Field Options Reference for Value or Name or ID',
						name: 'fieldOptionsReference',
						type: 'options',
						typeOptions: {
							loadOptionsMethod: 'getDropDownFieldValues',
							loadOptionsDependsOn: ['fieldKey'],
						},
						default: '',
						// eslint-disable-next-line n8n-nodes-base/node-param-description-wrong-for-dynamic-options
						description:
							'This is just for reference and does not affect the output of this node or field',
					},
					{
						displayName: 'Type',
						name: 'type',
						type: 'hidden',
						default: '={{$parameter["&fieldKey"].split("|")[1]}}',
					},
					{
						displayName: 'Lookup Value',
						name: 'value',
						type: 'string',
						default: '',
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
								name: 'ID',
								value: 'id',
								description: 'Match to the field options ID',
								action: 'Match to field value Id',
							},
							{
								name: 'Name',
								value: 'name',
								description: 'Match to the field options Name',
								action: 'Match to field value Name',
							},
							{
								name: 'Color',
								value: 'color',
								description: 'Match to the field options Color',
								action: 'Match to field value Color',
							},
						],
						default: 'name',
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
								name: 'ID',
								value: 'id',
								description: 'Output the matched field options ID',
								action: 'Output a matched field options Id',
							},
							{
								name: 'Name',
								value: 'name',
								description: 'Output the matched field options Name',
								action: 'Output a matched field options Name',
							},
							{
								name: 'Color',
								value: 'color',
								description: 'Output the matched field options Color',
								action: 'Output a matched field options Color',
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
