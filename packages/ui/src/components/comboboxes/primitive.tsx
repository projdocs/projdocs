"use client";

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxStatus,
} from "@packages/ui/components/combobox";

import { Item, ItemContent, ItemDescription, ItemTitle } from "@packages/ui/components/item";
import { Database, Tables } from "@packages/supabase";
import { Dispatch, Fragment, SetStateAction, useMemo, useRef, useState, useTransition } from "react";
import { Spinner } from "@packages/ui/components/spinner";
import { useLibrarySupabase } from "@packages/ui/lib/supabase-adapter";



type Table = keyof Database["public"]["Tables"];
export type SearchableTables = {
  [T in Table]: Uppercase<T> extends Database["public"]["Functions"]["search_table"]["Args"]["_table"]
    ? T
    : never;
}[Table];
export type SearchResult = Database["public"]["Functions"]["search_table"]["Returns"][number];


type Value<Nullable extends boolean> = Nullable extends false
  ? SearchResult
  : null | SearchResult;

export type ObjectComboboxProps<
  Table extends SearchableTables,
  Nullable extends boolean
> = {
  table: Table;
  value: Value<Nullable>;
  setValue: (value: Nullable extends false ? SearchResult : (SearchResult | null)) => unknown;
  organizationID: string;
  nullable: boolean;
  debounceMs?: number;
}


export const ObjectCombobox = <
  Table extends SearchableTables,
  Nullable extends boolean
>(props: ObjectComboboxProps<Table, Nullable>) => {

  const supabase = useLibrarySupabase();

  const [ searchResults, setSearchResults ] = useState<SearchResult[]>([]);
  const [ searchValue, setSearchValue ] = useState("");
  const [ error, setError ] = useState<string | null>(null);
  const [ isPending, startTransition ] = useTransition();

  const abortControllerRef = useRef<AbortController | null>(null);

  const trimmedSearchValue = searchValue.trim();

  const items = useMemo(() => {
    if (!props.value || searchResults.some((result) => result.id === props.value?.id)) {
      return searchResults;
    }

    return [ ...searchResults, props.value ];
  }, [ searchResults, props.value?.id ]);

  function getStatus() {
    if (isPending) return (
      <Fragment>
        <div className={"flex flex-row items-center justify-center gap-2"}>
          <Spinner />
          Searching...
        </div>
      </Fragment>
    );

    if (error) return error;

    if (trimmedSearchValue === "") return props.value ? null : "Start typing to search.";

    if (searchResults.length === 0) return `No matches for "${trimmedSearchValue}".`;

    return null;
  }

  function getEmptyMessage() {
    if (trimmedSearchValue === "" || isPending || searchResults.length > 0 || error) {
      return null;
    }

    return "Try a different search term.";
  }

  const status = getStatus();
  const emptyMessage = getEmptyMessage();

  return (
    <Combobox
      modal={false}
      items={items}
      filteredItems={items}
      filter={null}
      itemToStringLabel={(item: typeof items[number]) => item.display}
      isItemEqualToValue={(a, b) => a.id === b.id}
      onOpenChangeComplete={(open) => {
        if (!open && props.value) setSearchResults([ props.value ]);
      }}
      onValueChange={(nextSelectedValue) => {
        if (!props.nullable && nextSelectedValue === null) {
          console.warn("cannot select null-value for a non-nullable Combobox");
          return;
        }
        props.setValue(
          // @ts-expect-error null-value check handled above
          nextSelectedValue,
        );
        setSearchValue("");
        setError(null);
      }}
      onInputValueChange={(nextSearchValue, { reason }) => {
        setSearchValue(nextSearchValue);

        const controller = new AbortController();
        abortControllerRef.current?.abort();
        abortControllerRef.current = controller;

        if (nextSearchValue === "") {
          setSearchResults([]);
          setError(null);
          return;
        }

        if (reason === "item-press") {
          return;
        }

        startTransition(async () => {
          setError(null);

          const search = supabase
            .rpc("search_table", {
              _table: props.table.toUpperCase() as Database["public"]["Functions"]["search_table"]["Args"]["_table"],
              _query: nextSearchValue.trim(),
              _organization_id: props.organizationID,
            })
            .abortSignal(controller.signal);

          const debounce = new Promise((resolve) => setTimeout(resolve, props.debounceMs ?? 250));

          // await with debounce
          const [ result ] = await Promise.all([ search, debounce ]);

          if (controller.signal.aborted) {
            return;
          }

          startTransition(() => {
            setSearchResults(result.data ?? []);
            setError(result.error?.message ?? null);
          });
        });
      }}
    >
      <ComboboxInput placeholder={`Search ${props.table}...`} showClear={props.nullable} />
      <ComboboxContent>

        <ComboboxStatus>{status}</ComboboxStatus>
        <ComboboxEmpty>{emptyMessage}</ComboboxEmpty>

        <ComboboxList>
          {!isPending && items.map(result => (
            <ComboboxItem key={result.id} value={result}>
              <Item size="xs" className="p-0">
                <ItemContent>
                  <ItemTitle className="whitespace-nowrap">
                    {result.display}
                  </ItemTitle>
                  <ItemDescription>
                    {`${result.number} (${result.id})`}
                  </ItemDescription>
                </ItemContent>
              </Item>
            </ComboboxItem>
          ))}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}

const toSearchResult = <Table extends SearchableTables>(table: Table, row: Tables<Table>): SearchResult => {
  switch (table) {
    case "clients":
      return ({
        // @ts-expect-error not recognizing the table-type clamping
        display: row.name,
        id: row.id,
        number: row.number,
        rank: -1,
      });
    case "projects":
      return ({
        // @ts-expect-error not recognizing the table-type clamping
        display: row.display,
        id: row.id,
        number: row.number,
        rank: -1,
      });
    default:
      throw new Error(`toSearchResult is unhandled for table '${table}'.`);
  }
};

ObjectCombobox.toSearchResult = toSearchResult;