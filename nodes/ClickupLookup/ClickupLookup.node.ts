import { IExecuteFunctions } from 'n8n-core';

import {
	IDataObject,
	ILoadOptionsFunctions,
	INodeExecutionData,
	INodePropertyOptions,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
} from 'n8n-workflow';

import { clickupApiRequest, clickupApiRequestAllItems, validateJSON } from './GenericFunctions';

import { taskFields, taskOperations } from './TaskDescription';

import type { ICustomFieldsUi } from './CustomFieldsUiInterface';

import { ITask } from './TaskInterface';

export class ClickupLookup implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'ClickupLookup',
		name: 'clickupLookup',
		icon: 'file:clickupLookup.svg',
		group: ['output'],
		version: 1,
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
				],
				default: 'task',
			},
			...taskOperations,
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
				console.log(returnData)
				return returnData;
			},
			// Get all the available spaces to display them to user so that he can
			// select them easily
			async getSpaces(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const teamId = this.getCurrentNodeParameter('team') as string;
				console.log(`teamId: ${teamId}`);
				console.log(this.getCurrentNodeParameters());
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
							'drop_down',
							//'labels', 'email', 'date'
						].includes(field.type)
					) {
						const fieldName = field.name;
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
				console.log(field.type_config);
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
				console.log(field.type_config);
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
		const qs: IDataObject = {};
		let responseData;

		const resource = this.getNodeParameter('resource', 0);
		const operation = this.getNodeParameter('operation', 0);

		for (let i = 0; i < length; i++) {
			try {
				if (resource === 'task') {
					if (operation === 'create') {
						const listId = this.getNodeParameter('list', i) as string;
						const name = this.getNodeParameter('name', i) as string;
						const customFieldsUi = this.getNodeParameter('customFieldsUi', i) as ICustomFieldsUi;
						const additionalFields = this.getNodeParameter('additionalFields', i);

						const body: ITask = {
							name,
						};
						if (additionalFields.customFieldsJson) {
							const customFields = validateJSON(additionalFields.customFieldsJson as string);
							if (customFields === undefined) {
								throw new NodeOperationError(this.getNode(), 'Custom Fields: Invalid JSON', {
									itemIndex: i,
								});
							}
							body.custom_fields = customFields;
						}
						if (customFieldsUi.customFieldsValues) {
							const customFields: IDataObject[] = [];
							for (const customFieldValue of customFieldsUi.customFieldsValues) {
								const fieldid = customFieldValue?.fieldKey?.toString().split('|')[0];
								const fieldtype = customFieldValue?.fieldKey?.toString().split('|')[1];
								let val = '' as string | number | string[];

								if (['drop_down', 'labels'].includes(fieldtype?.toString() ?? '')) {
									const whenThis = customFieldValue.whenThis?.toString();
									const vals = customFieldValue.dropDownMapperUi?.dropDownMapperValues?.filter(
										(mapval) => {
											return whenThis == mapval.saysThis;
										},
									);
									const valarr = vals?.map((v) => v.value);
									//Drop down field value is the int-id of the string option,
									// labels field values are an array of guids for their string options
									if (fieldtype == 'drop_down') {
										val = valarr?.toString().split(',')[0] ?? '';
									} else {
										// TODO: assert unique values
										val = valarr?.toString().split(',') ?? [];
									}
								} else {
									val = customFieldValue.value ?? '';
								}
								if (fieldtype === 'date') {
									val = new Date(val as string).getTime();
								}
								customFields.push({
									id: fieldid,
									value: val,
								});
							}
							body.custom_fields = customFields;
						}
						if (additionalFields.content) {
							body.content = additionalFields.content as string;
						}
						if (additionalFields.assignees) {
							body.assignees = additionalFields.assignees as string[];
						}
						if (additionalFields.tags) {
							body.tags = additionalFields.tags as string[];
						}
						if (additionalFields.status) {
							body.status = additionalFields.status as string;
						}
						if (additionalFields.priority) {
							body.priority = additionalFields.priority as number;
						}
						if (additionalFields.dueDate) {
							body.due_date = new Date(additionalFields.dueDate as string).getTime();
						}
						if (additionalFields.dueDateTime) {
							body.due_date_time = additionalFields.dueDateTime as boolean;
						}
						if (additionalFields.timeEstimate) {
							body.time_estimate = (additionalFields.timeEstimate as number) * 6000;
						}
						if (additionalFields.startDate) {
							body.start_date = new Date(additionalFields.startDate as string).getTime();
						}
						if (additionalFields.startDateTime) {
							body.start_date_time = additionalFields.startDateTime as boolean;
						}
						if (additionalFields.notifyAll) {
							body.notify_all = additionalFields.notifyAll as boolean;
						}
						if (additionalFields.parentId) {
							body.parent = additionalFields.parentId as string;
						}
						if (additionalFields.markdownContent) {
							delete body.content;
							body.markdown_content = additionalFields.content as string;
						}
						responseData = await clickupApiRequest.call(this, 'POST', `/list/${listId}/task`, body);
					}
					if (operation === 'update') {
						const taskId = this.getNodeParameter('id', i) as string;
						const updateFields = this.getNodeParameter('updateFields', i);
						const body: ITask = {
							assignees: {
								add: [],
								rem: [],
							},
						};
						if (updateFields.content) {
							body.content = updateFields.content as string;
						}
						if (updateFields.priority) {
							body.priority = updateFields.priority as number;
						}
						if (updateFields.dueDate) {
							body.due_date = new Date(updateFields.dueDate as string).getTime();
						}
						if (updateFields.dueDateTime) {
							body.due_date_time = updateFields.dueDateTime as boolean;
						}
						if (updateFields.timeEstimate) {
							body.time_estimate = (updateFields.timeEstimate as number) * 6000;
						}
						if (updateFields.startDate) {
							body.start_date = new Date(updateFields.startDate as string).getTime();
						}
						if (updateFields.startDateTime) {
							body.start_date_time = updateFields.startDateTime as boolean;
						}
						if (updateFields.notifyAll) {
							body.notify_all = updateFields.notifyAll as boolean;
						}
						if (updateFields.name) {
							body.name = updateFields.name as string;
						}
						if (updateFields.parentId) {
							body.parent = updateFields.parentId as string;
						}
						if (updateFields.addAssignees) {
							//@ts-ignore
							body.assignees.add = (updateFields.addAssignees as string)
								.split(',')
								.map((e: string) => parseInt(e, 10));
						}
						if (updateFields.removeAssignees) {
							//@ts-ignore
							body.assignees.rem = (updateFields.removeAssignees as string)
								.split(',')
								.map((e: string) => parseInt(e, 10));
						}
						if (updateFields.status) {
							body.status = updateFields.status as string;
						}
						if (updateFields.markdownContent) {
							delete body.content;
							body.markdown_content = updateFields.content as string;
						}
						responseData = await clickupApiRequest.call(this, 'PUT', `/task/${taskId}`, body);
					}
					if (operation === 'get') {
						const taskId = this.getNodeParameter('id', i) as string;
						responseData = await clickupApiRequest.call(this, 'GET', `/task/${taskId}`);
					}
					if (operation === 'getAll') {
						const returnAll = this.getNodeParameter('returnAll', i);
						const filters = this.getNodeParameter('filters', i);
						if (filters.archived) {
							qs.archived = filters.archived as boolean;
						}
						if (filters.subtasks) {
							qs.subtasks = filters.subtasks as boolean;
						}
						if (filters.includeClosed) {
							qs.include_closed = filters.includeClosed as boolean;
						}
						if (filters.orderBy) {
							qs.order_by = filters.orderBy as string;
						}
						if (filters.statuses) {
							qs.statuses = filters.statuses as string[];
						}
						if (filters.assignees) {
							qs.assignees = filters.assignees as string[];
						}
						if (filters.tags) {
							qs.tags = filters.tags as string[];
						}
						if (filters.dueDateGt) {
							qs.due_date_gt = new Date(filters.dueDateGt as string).getTime();
						}
						if (filters.dueDateLt) {
							qs.due_date_lt = new Date(filters.dueDateLt as string).getTime();
						}
						if (filters.dateCreatedGt) {
							qs.date_created_gt = new Date(filters.dateCreatedGt as string).getTime();
						}
						if (filters.dateCreatedLt) {
							qs.date_created_lt = new Date(filters.dateCreatedLt as string).getTime();
						}
						if (filters.dateUpdatedGt) {
							qs.date_updated_gt = new Date(filters.dateUpdatedGt as string).getTime();
						}
						if (filters.dateUpdatedLt) {
							qs.date_updated_lt = new Date(filters.dateUpdatedLt as string).getTime();
						}
						if (filters.customFieldsUi) {
							const customFieldsValues = (filters.customFieldsUi as IDataObject)
								.customFieldsValues as IDataObject[];
							if (customFieldsValues) {
								const customFields: IDataObject[] = [];
								for (const customFieldValue of customFieldsValues) {
									customFields.push({
										field_id: customFieldValue.fieldId,
										operator:
											customFieldValue.operator === 'equal' ? '=' : customFieldValue.operator,
										value: customFieldValue.value as string,
									});
								}

								qs.custom_fields = JSON.stringify(customFields);
							}
						}

						const listId = this.getNodeParameter('list', i) as string;
						if (returnAll) {
							responseData = await clickupApiRequestAllItems.call(
								this,
								'tasks',
								'GET',
								`/list/${listId}/task`,
								{},
								qs,
							);
						} else {
							qs.limit = this.getNodeParameter('limit', i);
							responseData = await clickupApiRequestAllItems.call(
								this,
								'tasks',
								'GET',
								`/list/${listId}/task`,
								{},
								qs,
							);
							responseData = responseData.splice(0, qs.limit);
						}
					}
					if (operation === 'member') {
						const taskId = this.getNodeParameter('id', i) as string;
						const returnAll = this.getNodeParameter('returnAll', i);
						if (returnAll) {
							responseData = await clickupApiRequest.call(
								this,
								'GET',
								`/task/${taskId}/member`,
								{},
								qs,
							);
							responseData = responseData.members;
						} else {
							qs.limit = this.getNodeParameter('limit', i);
							responseData = await clickupApiRequest.call(
								this,
								'GET',
								`/task/${taskId}/member`,
								{},
								qs,
							);
							responseData = responseData.members;
							responseData = responseData.splice(0, qs.limit);
						}
					}
					if (operation === 'setCustomField') {
						const taskId = this.getNodeParameter('task', i) as string;
						const fieldId = this.getNodeParameter('field', i) as string;
						const value = this.getNodeParameter('value', i) as string;
						const jsonParse = this.getNodeParameter('jsonParse', i) as boolean;

						const body: IDataObject = {};
						body.value = value;
						if (jsonParse) {
							body.value = validateJSON(body.value);
							if (body.value === undefined) {
								throw new NodeOperationError(this.getNode(), 'Value is invalid JSON!', {
									itemIndex: i,
								});
							}
						} else {
							//@ts-ignore
							if (!isNaN(body.value)) {
								body.value = parseInt(body.value, 10);
							}
						}
						responseData = await clickupApiRequest.call(
							this,
							'POST',
							`/task/${taskId}/field/${fieldId}`,
							body,
						);
					}
					if (operation === 'delete') {
						const taskId = this.getNodeParameter('id', i) as string;
						responseData = await clickupApiRequest.call(this, 'DELETE', `/task/${taskId}`, {});
						responseData = { success: true };
					}
				}

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
