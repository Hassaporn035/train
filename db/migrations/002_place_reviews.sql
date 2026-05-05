-- รีวิวสถานที่: ผู้ใช้หนึ่งคนรีวิวสถานที่หนึ่งแห่งได้หนึ่งรายการ (อัปเดตได้)
CREATE TABLE IF NOT EXISTS public.place_reviews (
	id serial4 NOT NULL,
	place_id int4 NOT NULL,
	user_id int4 NOT NULL,
	rating int2 NOT NULL,
	comment text NULL,
	created_at timestamptz DEFAULT now() NULL,
	updated_at timestamptz DEFAULT now() NULL,
	CONSTRAINT place_reviews_pkey PRIMARY KEY (id),
	CONSTRAINT place_reviews_place_id_fkey FOREIGN KEY (place_id) REFERENCES public.places(id) ON DELETE CASCADE,
	CONSTRAINT place_reviews_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE,
	CONSTRAINT place_reviews_user_place UNIQUE (user_id, place_id),
	CONSTRAINT place_reviews_rating_check CHECK (rating >= 1 AND rating <= 5)
);

CREATE INDEX IF NOT EXISTS idx_place_reviews_place_id ON public.place_reviews(place_id);
