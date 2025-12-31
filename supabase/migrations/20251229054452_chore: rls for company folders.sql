
  create policy "company-public: select: admin users"
  on "storage"."objects"
  as permissive
  for select
  to authenticated
using (((bucket_id = 'company-public'::text) AND (auth.uid() IN ( SELECT admins.id
   FROM public.admins))));



  create policy "company-public: insert: admin users"
  on "storage"."objects"
  as permissive
  for insert
  to authenticated
with check (((bucket_id = 'company-public'::text) AND (auth.uid() IN ( SELECT admins.id
   FROM public.admins))));



  create policy "company-public: update: admin users"
  on "storage"."objects"
  as permissive
  for update
  to authenticated
using (((bucket_id = 'company-public'::text) AND (auth.uid() IN ( SELECT admins.id
   FROM public.admins))));



  create policy "company-public: delete: admin users"
  on "storage"."objects"
  as permissive
  for delete
  to authenticated
using (((bucket_id = 'company-public'::text) AND (auth.uid() IN ( SELECT admins.id
   FROM public.admins))));



  create policy "company-private: select: admin users"
      on "storage"."objects"
      as permissive
      for select
      to authenticated
      using (((bucket_id = 'company-private'::text) AND (auth.uid() IN ( SELECT admins.id
                                                                        FROM public.admins))));



  create policy "company-private: insert: admin users"
      on "storage"."objects"
      as permissive
      for insert
      to authenticated
      with check (((bucket_id = 'company-private'::text) AND (auth.uid() IN ( SELECT admins.id
                                                                             FROM public.admins))));



  create policy "company-private: update: admin users"
      on "storage"."objects"
      as permissive
      for update
      to authenticated
      using (((bucket_id = 'company-private'::text) AND (auth.uid() IN ( SELECT admins.id
                                                                        FROM public.admins))));



  create policy "company-private: delete: admin users"
      on "storage"."objects"
      as permissive
      for delete
      to authenticated
      using (((bucket_id = 'company-private'::text) AND (auth.uid() IN ( SELECT admins.id
                                                                        FROM public.admins))));
