export type RootStackParamList = {
  Auth: undefined;
  App: undefined;
};

export type BottomStackParamList = {
  Records:undefined; // Coffee Record List
  Calendar:undefined;
  Coffee:undefined; // Coffee List
  Reviews:undefined;
  Analysis:undefined;
  Settings:undefined;
}

export type RecordsStackParamList = {
  RecordsHome: undefined;
  RecordCreate: undefined;
  RecordDetails: { id: string | undefined };
};

export type CoffeeStackParamList = {
  CoffeeHome: undefined;
  CoffeeCreate: undefined;
  CoffeeEdit: { id: string | undefined };
  CoffeeDetails: { id: string | undefined };
};

export type ReviewStackParamList = {
  ReviewsHome: undefined;
  ReviewDetails: { id: string | undefined };
};

export type SettingStackParamList = {
  SettingsHome:undefined;
  Brands:undefined;
  Beans:undefined;
  GrindSize:undefined;
};

export type Coffee = {
  id: string;
  name: string;
  comments: string | null;
  photo_url: string | null;
  roast_level: number;
  body: number;
  sweetness: number;
  fruity: number;
  bitter: number;
  aroma: number;
  user_id: string;
  brand_id: string;
  created_at: string;
};

export type CoffeeWithBrand = Coffee & { brandName: string};

export type Brand = {
  id: string;
  name: string;
  user_id: string;
  created_at: string;
};

export type Bean = {
  id: string;
  name: string;
  user_id: string;
  created_at: string;
};

export type GrindSize = {
  id: string;
  name: string;
  user_id: string;
  created_at: string;
};

export type DrinkingRecord = {
  id: string;
  weight_grams: number;
  price_yen: number;
  purchase_date: string;
  coffee_id: string;
  start_date: string;
  end_date: string | null;
  user_id: string;
  created_at: string;
};

export type UnfinishedWithName = DrinkingRecord & {
  coffee: CoffeeLite | null;
};

export type FinishedWithReview = DrinkingRecord & {
  coffee: CoffeeLite | null;
  hasReview: boolean;
};

export type BrandLite = {
  name: string | null }| null;

export type CoffeeLite = {
  name: string | null;
  brand: BrandLite | null
};

export type Review = {
  id: string;
  score: number;
  comments: string | null;
  record_id: string;
  user_id: string;
  created_at: string;
};

export type RecordLite = {
  start_date: string;
  end_date: string | null;
  coffee: CoffeeLite } | null;

export type ReviewWithContext = Review & {
  record: RecordLite
};
