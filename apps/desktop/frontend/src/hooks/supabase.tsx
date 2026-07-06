import { create } from 'zustand'
import {Session} from "@supabase/supabase-js"

export const useSupabase = create((set) => ({
  session: {} as Session
}))