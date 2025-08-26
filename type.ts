export type RootStackParamList = {
  Auth: undefined;
  App: undefined;
};

export type BottomStackParamList = {
  Records:undefined; // Coffee Record List
  Calendar:undefined;
  Coffee:undefined; // Coffee List
  Reviews:undefined;
  Profile:undefined;
  Analysis:undefined;
}

export type RecordsStackParamList = {
  Records: undefined;
  RecordDetails: { id: string | undefined };
};

export type CoffeeStackParamList = {
  Coffee: undefined;
  CoffeeDetails: { id: string | undefined };
};

export type ReviewStackParamList = {
  Reviews: undefined;
  ReviewDetails: { id: string | undefined };
};

export type Brand = {
  id: string; name: string; user_id: string; created_at: string;
};
