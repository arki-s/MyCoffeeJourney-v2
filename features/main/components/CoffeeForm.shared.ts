export type CoffeeFormState = {
  name: string;
  comments: string;
  photo_url: string;
  roast_level: number;
  body: number;
  sweetness: number;
  fruity: number;
  bitter: number;
  aroma: number;
  brand_id: string;
};

export type CoffeeFormSubmitValue = CoffeeFormState & {
  includedBeans: string[];
};

export type CoffeeFormMode = 'create' | 'edit';

export type CoffeeFormProps = {
  mode: CoffeeFormMode;
  initialValue: CoffeeFormSubmitValue;
  loading?: boolean;
  error?: string | null;
  onSubmit: (value: CoffeeFormSubmitValue) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
};

export const initialCoffeeFormState: CoffeeFormState = {
  name: '',
  comments: '',
  photo_url: '',
  roast_level: 1,
  body: 1,
  sweetness: 1,
  fruity: 1,
  bitter: 1,
  aroma: 1,
  brand_id: '',
};

export const initialCoffeeFormValue: CoffeeFormSubmitValue = {
  ...initialCoffeeFormState,
  includedBeans: [],
};

export const sliderFields: Array<{
  key: keyof Pick<
    CoffeeFormState,
    'roast_level' | 'body' | 'sweetness' | 'fruity' | 'bitter' | 'aroma'
  >;
  label: string;
}> = [
  { key: 'roast_level', label: '焙煎度' },
  { key: 'body', label: 'コク' },
  { key: 'sweetness', label: '甘み' },
  { key: 'fruity', label: '酸味' },
  { key: 'bitter', label: '苦味' },
  { key: 'aroma', label: '香り' },
];

export const sliderScaleLabels = ['1', '2', '3', '4', '5'];
