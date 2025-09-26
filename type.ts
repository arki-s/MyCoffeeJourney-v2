import { NavigatorScreenParams } from "@react-navigation/native";

export type RootStackParamList = {
  Auth: undefined;
  App: undefined;
};

export type BottomStackParamList = {
  Records:NavigatorScreenParams<RecordsStackParamList>;
  Calendar:undefined;
  Coffee:NavigatorScreenParams<CoffeeStackParamList>;
  Reviews:undefined;
  Analysis:undefined;
  Settings:NavigatorScreenParams<SettingStackParamList>;
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
  CoffeeDetails: { id: string };
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

export type ReviewLite = {
  score: string;
  comments: string | null} | null;

export type ReviewWithContext = Review & {
  record: RecordLite;
};

export type RecordDetail = DrinkingRecord & {
  reviews: ReviewLite;
  coffee: CoffeeLite;
};

export type CoffeeDetail = Coffee & {
  brand: { id: string; name: string | null } | null;
  beans: { id: string; name: string | null }[];
  stats: {
    recordCount: number;
    totalWeight: number;
    pricePer100g: number | null;
    avgScore: number | null;
  };
};

export type CoffeeReviewItem = {
  record_id: string;
  score: number;
  comments: string | null;
  created_at: string;
  start_date: string | null;
  end_date: string | null;
};

export type RecordCalendarEvent = {
  id: string;
  startDate: string;
  endDate: string;
  coffeeName: string | null;
  brandName: string | null;
  status: 'ongoing' | 'finished';
  color?: string;
};

export type CalendarMarkedDates = Record<string, {
  periods: {
    color: string;
    startingDay?: boolean;
    endingDay?: boolean;
    textColor?: string;
  }[];
}>;

export type AnalysisData = {
  totals: {
    grams: number;
    yen: number;
  };
  count: number;
  coffeeRanking: {
    coffeeId: string;
    count: number;
    name: string;
    brand: string;
  }[];
  monthlyData: {
    grams: number;
    yen: number;
  }[];
  monthLabels: string[];
};
