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

export type Brand = {
  id: string; name: string; user_id: string; created_at: string;
};

export type Bean = {
  id: string; name: string; user_id: string; created_at: string;
};
