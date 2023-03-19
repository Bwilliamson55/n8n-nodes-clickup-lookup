export interface ICustomFieldsUi {
	customFieldsValues?: {
		fieldKey?: string;
		type?: string;
		value?: string|number;
		whenThis?: string;
		dropDownMapperUi?: {
			dropDownMapperValues?: {
					saysThis?: string;
					value?: string|number|string[]
			}[];
		};
	}[];
}
