CREATE TABLE users (
id uuid PRIMARY KEY references auth.users(id) on delete cascade,
display_name text,
icon_url text,
created_at timestamp with time zone default now()
);

CREATE TABLE coffee (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
name text NOT NULL,
comments text,
photo_url text,
roast_level int NOT NULL DEFAULT 1,
body int NOT NULL DEFAULT 1,
sweetness int NOT NULL DEFAULT 1,
fruity int NOT NULL DEFAULT 1,
bitter int NOT NULL DEFAULT 1,
aroma int NOT NULL DEFAULT 1,
brand_id uuid REFERENCES coffee_brands(id),
user_id uuid REFERENCES users(id),
created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE coffee_brands (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
name text NOT NULL,
user_id uuid REFERENCES users(id),
created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE coffee_beans (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
name text NOT NULL,
user_id uuid REFERENCES users(id),
created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE coffee_bean_inclusions (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
coffee_id uuid REFERENCES coffee(id),
bean_id uuid REFERENCES coffee_beans(id),
user_id uuid REFERENCES users(id),
created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE grind_sizes (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
name text NOT NULL,
user_id uuid REFERENCES users(id),
created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE drinking_records (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
weight_grams int NOT NULL,
price_yen int NOT NULL,
start_date date NOT NULL,
end_date date,
purchase_date date,
coffee_id uuid REFERENCES coffee(id),
user_id uuid REFERENCES users(id),
created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE drinking_grind_sizes (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
grind_size_id uuid REFERENCES grind_sizes(id),
record_id uuid REFERENCES drinking_records(id),
created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE reviews (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
score int NOT NULL,
comments text,
record_id uuid REFERENCES drinking_records(id),
user_id uuid REFERENCES users(id),
created_at timestamp with time zone DEFAULT now()
);
