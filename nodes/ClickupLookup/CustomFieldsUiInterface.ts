export interface ICustomFieldsUi {
	customFieldsValues?: {
		fieldKey?: string;
		fieldOptionsReference?: {
			name?: string;
			value?: string|number|string[]|boolean
		}
		type?: string;
		value?: string|number;
		matchTo?: string;
		output?: string;
	}[];
}
