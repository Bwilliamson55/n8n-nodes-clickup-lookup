import {
	IExecuteFunctions,
	IDataObject,
	ILoadOptionsFunctions,
	INodeExecutionData,
	INodePropertyOptions,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';

import { clickupApiRequest } from './GenericFunctions';

import { taskFields, taskOperations } from './TaskDescription';
import { taskTypeFields, taskTypeOperations } from './TaskTypeDescription';

import type { ICustomFieldsUi } from './CustomFieldsUiInterface';

export class ClickupLookup implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'ClickupLookup',
		name: 'clickupLookup',
		icon: 'file:clickupLookup.svg',
		group: ['output'],
		version: 1.4,
		subtitle: '={{$parameter["operation"] + ":" + $parameter["resource"]}}',
		description: 'Map ClickUp custom fields to values',
		defaults: {
			name: 'ClickupLookup',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'clickupLookupApi',
				required: true,
				displayOptions: {
					show: {
						authentication: ['accessToken'],
					},
				},
			},
			{
				name: 'clickupLookupOAuth2Api',
				required: true,
				displayOptions: {
					show: {
						authentication: ['oAuth2'],
					},
				},
			},
		],
		properties: [
			{
				displayName: 'Authentication',
				name: 'authentication',
				type: 'options',
				options: [
					{
						name: 'Access Token',
						value: 'accessToken',
					},
					{
						name: 'OAuth2',
						value: 'oAuth2',
					},
				],
				default: 'accessToken',
			},
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Lookup on Task',
						value: 'task',
					},
					{
						name: 'Custom Task Type',
						value: 'customTaskType',
					}
				],
				default: 'task',
			},
			...taskOperations,
			...taskTypeOperations,
			...taskTypeFields,
			...taskFields,
		],
	};

	methods = {
		loadOptions: {
			// Get all the available teams to display them to user so that he can
			// select them easily
			async getTeams(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const returnData: INodePropertyOptions[] = [];
				const { teams } = await clickupApiRequest.call(this, 'GET', '/team');
				for (const team of teams) {
					const teamName = team.name;
					const teamId = team.id;
					returnData.push({
						name: teamName,
						value: teamId,
					});
				}
				return returnData;
			},
			// Get all the available spaces to display them to user so that he can
			// select them easily
			async getSpaces(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const teamId = this.getCurrentNodeParameter('team') as string;
				const returnData: INodePropertyOptions[] = [];
				const { spaces } = await clickupApiRequest.call(this, 'GET', `/team/${teamId}/space`);
				for (const space of spaces) {
					const spaceName = space.name;
					const spaceId = space.id;
					returnData.push({
						name: spaceName,
						value: spaceId,
					});
				}
				return returnData;
			},
			// Get all the available folders to display them to user so that he can
			// select them easily
			async getFolders(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const spaceId = this.getCurrentNodeParameter('space') as string;
				const returnData: INodePropertyOptions[] = [];
				const { folders } = await clickupApiRequest.call(this, 'GET', `/space/${spaceId}/folder`);
				for (const folder of folders) {
					const folderName = folder.name;
					const folderId = folder.id;
					returnData.push({
						name: folderName,
						value: folderId,
					});
				}
				return returnData;
			},
			// Get all the available lists to display them to user so that he can
			// select them easily
			async getLists(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const folderId = this.getCurrentNodeParameter('folder') as string;
				const returnData: INodePropertyOptions[] = [];
				const { lists } = await clickupApiRequest.call(this, 'GET', `/folder/${folderId}/list`);
				for (const list of lists) {
					const listName = list.name;
					const listId = list.id;
					returnData.push({
						name: listName,
						value: listId,
					});
				}
				return returnData;
			},
			// Get all the available lists without a folder to display them to user so that he can
			// select them easily
			async getFolderlessLists(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const spaceId = this.getCurrentNodeParameter('space') as string;
				const returnData: INodePropertyOptions[] = [];
				const { lists } = await clickupApiRequest.call(this, 'GET', `/space/${spaceId}/list`);
				for (const list of lists) {
					const listName = list.name;
					const listId = list.id;
					returnData.push({
						name: listName,
						value: listId,
					});
				}
				return returnData;
			},
			// Get all the available assignees to display them to user so that he can
			// select them easily
			async getAssignees(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const listId = this.getCurrentNodeParameter('list') as string;
				const taskId = this.getCurrentNodeParameter('task') as string;
				const returnData: INodePropertyOptions[] = [];
				let url: string;
				if (listId) {
					url = `/list/${listId}/member`;
				} else if (taskId) {
					url = `/task/${taskId}/member`;
				} else {
					return returnData;
				}

				const { members } = await clickupApiRequest.call(this, 'GET', url);
				for (const member of members) {
					const memberName = member.username;
					const menberId = member.id;
					returnData.push({
						name: memberName,
						value: menberId,
					});
				}
				return returnData;
			},
			// Get all the available tags to display them to user so that he can
			// select them easily
			async getTags(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const spaceId = this.getCurrentNodeParameter('space') as string;
				const returnData: INodePropertyOptions[] = [];
				const { tags } = await clickupApiRequest.call(this, 'GET', `/space/${spaceId}/tag`);
				for (const tag of tags) {
					const tagName = tag.name;
					const tagId = tag.name;
					returnData.push({
						name: tagName,
						value: tagId,
					});
				}
				return returnData;
			},
			// Get all the available tags to display them to user so that he can
			// select them easily
			async getTimeEntryTags(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const teamId = this.getCurrentNodeParameter('team') as string;
				const returnData: INodePropertyOptions[] = [];
				const { data: tags } = await clickupApiRequest.call(
					this,
					'GET',
					`/team/${teamId}/time_entries/tags`,
				);
				for (const tag of tags) {
					const tagName = tag.name;
					const tagId = JSON.stringify(tag);
					returnData.push({
						name: tagName,
						value: tagId,
					});
				}
				return returnData;
			},
			// Get all the available tags to display them to user so that he can
			// select them easily
			async getStatuses(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const listId = this.getCurrentNodeParameter('list') as string;
				const returnData: INodePropertyOptions[] = [];
				const { statuses } = await clickupApiRequest.call(this, 'GET', `/list/${listId}`);
				for (const status of statuses) {
					const statusName = status.status;
					const statusId = status.status;
					returnData.push({
						name: statusName,
						value: statusId,
					});
				}
				return returnData;
			},
			// Get all the available task types to display them to user so that he can
			// select them easily
			async getTaskTypes(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const teamId = this.getCurrentNodeParameter('team') as string;
				const returnData: INodePropertyOptions[] = [];
				const { custom_items } = await clickupApiRequest.call(this, 'GET', `/team/${teamId}/custom_item`);
				for (const taskType of custom_items) {
					const taskTypeName = taskType.name;
					const taskTypeId = taskType.id;
					const taskTypeDescription = taskType.description;
					returnData.push({
						name: `${taskTypeId} - ${taskTypeName}`,
						value: taskTypeId,
						description: taskTypeDescription,
					});
				}
				return returnData;
			},
			// Get all the custom fields to display them to user so that he can
			// select them easily
			async getCustomFields(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const listId = this.getCurrentNodeParameter('list') as string;
				const returnData: INodePropertyOptions[] = [];
				const { fields } = await clickupApiRequest.call(this, 'GET', `/list/${listId}/field`);
				for (const field of fields) {
					const fieldName = field.name;
					const fieldId = field.id;
					returnData.push({
						name: fieldName,
						value: fieldId,
					});
				}
				return returnData;
			},
			// The improved custom field getter - albeit limited to certain types
			async getCustomFieldsProperties(
				this: ILoadOptionsFunctions
			): Promise<INodePropertyOptions[]> {
				const listId = this.getCurrentNodeParameter('list') as string;
				const returnData: INodePropertyOptions[] = [];
				const { fields } = await clickupApiRequest.call(this, 'GET', `/list/${listId}/field`);
				for (const field of fields) {
					if (
						// specify the types we know we can work with
						[
							//'short_text', 'text',
							'drop_down', 'labels',
							// 'email', 'date'
						].includes(field.type)
					) {
						const fieldName = field.type + ' - ' + field.name;
						const fieldId = field.id;
						// Set the value to a easily splitable value for type detection
						returnData.push({
							name: fieldName,
							value: `${fieldId}|${field.type}`,
						});
					}
				}
				returnData.sort((a, b) => {
					if (a.name.toLocaleLowerCase() < b.name.toLocaleLowerCase()) {
						return -1;
					}
					if (a.name.toLocaleLowerCase() > b.name.toLocaleLowerCase()) {
						return 1;
					}
					return 0;
				});
				return returnData;
			},
			// Get values for dropdown or label fields in the mapper
			async getFieldSelectValues(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const selfPath = this.getCurrentNodeParameter('&') as string;
				const selfCustomFieldPath = `${selfPath.split('.').slice(1, 3).join('.')}`;
				const id = (
					this.getCurrentNodeParameter(`${selfCustomFieldPath}.fieldKey`) as string
				).split('|')[0];
				const listId = this.getCurrentNodeParameter('list') as string;
				const { fields } = await clickupApiRequest.call(this, 'GET', `/list/${listId}/field`);
				const field = fields.find((f: any) => f.id == id);
				return field.type_config?.options.map((option: IDataObject) => ({
					name: `${option.label ?? option.name}`,
					value: `${option.orderindex ?? option.id}`,
				}));
			},
			// Get values for dropdown fields
			async getDropDownFieldValues(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const id = (
					this.getCurrentNodeParameter('&fieldKey') as string
				).split('|')[0];
				const listId = this.getCurrentNodeParameter('list') as string;
				const { fields } = await clickupApiRequest.call(this, 'GET', `/list/${listId}/field`);
				const field = fields.find((f: any) => f.id == id);
				return field.type_config?.options.map((option: IDataObject) => ({
					name: `${JSON.stringify(option, null, 2)}`,
					value: `${JSON.stringify(option)}`,
				}));
			},
			// Get all the available lists to display them to user so that he can
			// select them easily
			async getTasks(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const listId = this.getCurrentNodeParameter('list') as string;
				const archived = this.getCurrentNodeParameter('archived') as string;
				const returnData: INodePropertyOptions[] = [];
				const { tasks } = await clickupApiRequest.call(
					this,
					'GET',
					`/list/${listId}/task?archived=${archived}`,
				);
				for (const task of tasks) {
					const taskName = task.name;
					const taskId = task.id;
					returnData.push({
						name: taskName,
						value: taskId,
					});
				}
				return returnData;
			},
		},
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const length = items.length;
		let responseData;

		const resource = this.getNodeParameter('resource', 0);
		const operation = this.getNodeParameter('operation', 0);

		for (let i = 0; i < length; i++) {
			try {
				if (resource === 'task') {
					if (operation === 'lookup') {
						const listId = this.getNodeParameter('list', i) as string;
						const customFieldsUi = this.getNodeParameter('customFieldsUi', i) as ICustomFieldsUi;
						const { fields } = await clickupApiRequest.call(this, 'GET', `/list/${listId}/field`);

						if (customFieldsUi.customFieldsValues) {
							const customFields: IDataObject[] = [];
							for (const customFieldValue of customFieldsUi.customFieldsValues) {
								const fieldid = customFieldValue?.fieldKey?.toString().split('|')[0];
								const fieldtype = customFieldValue?.fieldKey?.toString().split('|')[1];
								let matchResult = 'no match found';

								//value is the value to lookup
								const value = customFieldValue.value?.toString();
								// id, name, color, orderindex - name is default
								const matchTo = customFieldValue.matchTo?.toString();
								// id, name, color, object - id is default
								const outputType = customFieldValue.output?.toString();

								const field = fields.find((f: any) => f.id == fieldid);

								if (['drop_down', 'labels'].includes(fieldtype?.toString() ?? '')) {
									// If value is empty or *, return all options in an object in the chosen outputType
									if (!value || value == '*') {
										// If outputType is object, return the whole array of options
										if (outputType == 'object') {
											matchResult = field.type_config?.options;
										} else {
											// Otherwise, return the array of options as an array of the chosen outputType
											matchResult = field.type_config?.options.map((option: IDataObject) => option[outputType ?? 'id']);
										}
									} else {
										let match = field.type_config?.options.find((option: IDataObject) => option[matchTo ?? 'id'] == value ) ?? {};
										if (!!match?.id) {
											matchResult = outputType == 'object' ? match : match[outputType ?? 'id'];
										}
									}
								} else {
									matchResult = "how did you get here?";
								}
								customFields.push({
									lookupValue: value,
									matchTo: matchTo,
									matchAgainst: `${field.name} - ${field.id}`,
									outputType: outputType,
									result: matchResult,
								});
							}
							responseData = customFields;
						}
					} else if (operation === 'customTaskType') {
						const teamId = this.getNodeParameter('team', i) as string;
						const { custom_items } = await clickupApiRequest.call(this, 'GET', `/team/${teamId}/custom_item`);
						responseData = custom_items;
					}
				} else if (resource === 'customTaskType') {
					if (operation === 'updateTaskWithType') {
						const taskId = this.getNodeParameter('taskId', i) as string;
						const taskType = this.getNodeParameter('taskType', i) as string;
						const body = {
							custom_item_id: taskType,
						};
						responseData = await clickupApiRequest.call(this, 'PUT', `/task/${taskId}`, body);
					}
				}
				responseData = responseData == undefined ? {} : responseData
				const executionData = this.helpers.constructExecutionMetaData(
					this.helpers.returnJsonArray(responseData),
					{ itemData: { item: i } },
				);
				returnData.push(...executionData);
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({ error: error.message, json: {} });
					continue;
				}
				throw error;
			}
		}
		return this.prepareOutputData(returnData);
	}
}
