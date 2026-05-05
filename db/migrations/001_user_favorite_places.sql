-- รายการโปรด: ผู้ใช้หนึ่งคนชอบสถานที่ได้หลายแห่ง (สถานที่หนึ่งแห่งต่อผู้ใช้หนึ่งคน)
CREATE TABLE IF NOT EXISTS public.user_favorite_places (
	user_id int4 NOT NULL,
	place_id int4 NOT NULL,
	created_at timestamptz DEFAULT now() NULL,
	CONSTRAINT user_favorite_places_pkey PRIMARY KEY (user_id, place_id),
	CONSTRAINT user_favorite_places_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE,
	CONSTRAINT user_favorite_places_place_id_fkey FOREIGN KEY (place_id) REFERENCES public.places(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_user_favorite_places_user_id ON public.user_favorite_places(user_id);
