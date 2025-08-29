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
