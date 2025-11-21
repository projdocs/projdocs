"use server";

import { kv } from "@workspace/admin/lib/db/kv.ts";
import { KvKeys } from "@workspace/admin/lib/db/enum.ts";



export const onClick = async (props: {
  setting: KvKeys,
  value: string | null
}) => {
  kv.set(props.setting, props.value);
}