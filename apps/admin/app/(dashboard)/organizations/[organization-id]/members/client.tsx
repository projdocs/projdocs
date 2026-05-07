"use client";
import {
  PaginatedDataTable,
  PaginatedDataTableDataGetter,
  usePaginatedDataTable,
} from "@packages/ui/components/data-table";
import { ButtonGroup } from "@packages/ui/components/button-group";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@packages/ui/components/dropdown-menu";
import { Button } from "@packages/ui/components/button";
import {
  ChevronFirstIcon,
  ChevronLastIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MoreHorizontalIcon,
  PlusIcon,
  UserCogIcon,
} from "lucide-react";
import { Tables } from "@packages/supabase/types.gen";
import { User } from "@supabase/auth-js";
import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@packages/ui/components/avatar";
import { useState } from "react";
import { toast } from "sonner";
import { Checkbox } from "@packages/ui/components/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@packages/ui/components/tooltip";
import { ObjectPage } from "@packages/ui/components/page";

type AddColumn = User;
const addColumn = createColumnHelper<AddColumn>();
const addColumns = [
  addColumn.accessor("email", {
    header: "Email",
  }),
  addColumn.accessor("last_sign_in_at", {
    header: "Last Signed In",
  }),
  addColumn.accessor("created_at", {
    header: "Created At",
  }),
  addColumn.accessor("id", {
    header: "ID",
  }),
] as ColumnDef<AddColumn>[];

type DisplayColumn = Tables<"profiles">;
const displayColumn = createColumnHelper<DisplayColumn>();
const displayColumns = [
  displayColumn.accessor("profile_picture_url", {
    header: "",
    size: 1,
    minSize: 1,
    enableSorting: false,
    cell: (info) => (
      <Avatar>
        <AvatarImage src={info.getValue() ?? undefined} />
        <AvatarFallback>
          {info.row.original.first_name.at(0)}
          {info.row.original.last_name.at(0)}
        </AvatarFallback>
      </Avatar>
    ),
  }),
  displayColumn.accessor("first_name", { header: "First Name" }),
  displayColumn.accessor("last_name", { header: "Last Name" }),
  displayColumn.accessor("id", { header: "ID" }),
] as ColumnDef<DisplayColumn>[];

export const OrganizationMembersPage = (props: {
  initialOrganization: Tables<"organizations">;
  getUsersAction: PaginatedDataTableDataGetter<AddColumn>;
  getProfilesAction: PaginatedDataTableDataGetter<DisplayColumn>;
  initialMembers: readonly Tables<"members">[];
  createMemberAction: (user: AddColumn) => Promise<Tables<"members">>;
  toggleMemberAutoAddAction: (auto: boolean) => Promise<Tables<"organizations">>;
}) => {
  const [organization, setOrganization] = useState<Tables<"organizations">>(
    props.initialOrganization
  );

  const [members, setMembers] = useState<readonly Tables<"members">[]>(
    props.initialMembers
  );

  const pgt = usePaginatedDataTable({
    columns: addColumns,
    getData: props.getUsersAction,
  });

  return (
    <ObjectPage
      title={"Members"}
      description={`${organization.display} • ${organization.id}`}
      action={
        <ButtonGroup>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <PlusIcon />
                {"Add Member"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[300px]">
              {/*<DropdownMenuGroup>*/}
              {/*  <Input placeholder={"Search..."} />*/}
              {/*</DropdownMenuGroup>*/}
              {/*<DropdownMenuSeparator />*/}
              <DropdownMenuGroup>
                <div className={"flex flex-row items-center justify-between"}>
                  <div className={"flex flex-row gap-1"}>
                    <Button
                      size="icon"
                      variant="outline"
                      className="disabled:pointer-events-none disabled:opacity-50"
                      onClick={() => pgt.table.setPageIndex(0)}
                      disabled={pgt.isLoading || !pgt.canPreviousPage}
                      aria-label="Go to first page"
                    >
                      <ChevronFirstIcon aria-hidden="true" />
                    </Button>

                    <Button
                      size="icon"
                      variant="outline"
                      className="disabled:pointer-events-none disabled:opacity-50"
                      onClick={() => pgt.table.previousPage()}
                      disabled={pgt.isLoading || !pgt.canPreviousPage}
                      aria-label="Go to previous page"
                    >
                      <ChevronLeftIcon aria-hidden="true" />
                    </Button>
                  </div>

                  <div>
                    <p className={"text-sm text-muted-foreground"}>
                      {pgt.startRow}-{pgt.endRow} of {pgt.state.count}
                    </p>
                  </div>

                  <div className={"flex flex-row gap-1"}>
                    <Button
                      size="icon"
                      variant="outline"
                      className="disabled:pointer-events-none disabled:opacity-50"
                      onClick={() => pgt.table.nextPage()}
                      disabled={pgt.isLoading || !pgt.canNextPage}
                      aria-label="Go to next page"
                    >
                      <ChevronRightIcon aria-hidden="true" />
                    </Button>

                    <Button
                      size="icon"
                      variant="outline"
                      className="disabled:pointer-events-none disabled:opacity-50"
                      onClick={() => pgt.table.setPageIndex(pgt.pageCount - 1)}
                      disabled={pgt.isLoading || !pgt.canNextPage}
                      aria-label="Go to last page"
                    >
                      <ChevronLastIcon aria-hidden="true" />
                    </Button>
                  </div>
                </div>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                {pgt.state.rows.map((user) => {
                  const exists = !!members.find(
                    (member) => member.user_id === user.id
                  );
                  return (
                    <DropdownMenuItem
                      key={user.id}
                      disabled={exists}
                      onClick={async () => {
                        toast.promise(props.createMemberAction(user), {
                          loading: `Adding user to ${organization.display}`,
                          success: (member: Tables<"members">) => {
                            setMembers((members) => [...members, member]);
                            return {
                              message: `Added user to ${organization.display}`,
                            };
                          },
                          error: "An unexpected error occurred!",
                        });
                      }}
                    >
                      <Tooltip>
                        <TooltipContent side={"left"}>
                          {"Add User"}
                        </TooltipContent>
                        <TooltipTrigger asChild>
                          <div
                            className={
                              "flex w-full flex-row items-center justify-between gap-3 truncate"
                            }
                          >
                            <Avatar>
                              <AvatarImage
                                src={
                                  user.user_metadata?.picture ??
                                  user.user_metadata?.avatar_url
                                }
                              />
                              <AvatarFallback>
                                {(user.email ?? user.phone ?? user.id).at(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div
                              className={"flex flex-grow-1 flex-col truncate"}
                            >
                              {user.user_metadata.full_name && (
                                <p className={"truncate"}>
                                  {user.user_metadata.full_name}
                                </p>
                              )}

                              <p
                                className={
                                  user.user_metadata.full_name
                                    ? "truncate text-muted-foreground"
                                    : "truncate"
                                }
                              >
                                {user.email ?? user.phone ?? user.id}
                              </p>
                            </div>
                            <Checkbox disabled checked={exists} />
                          </div>
                        </TooltipTrigger>
                      </Tooltip>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" aria-label="More Options">
                <MoreHorizontalIcon />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[300px]">
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={async () => toast.promise(props.toggleMemberAutoAddAction(!organization.auto_add_members), {
                  loading: "Toggling auto-add members...",
                  success: (organization: Tables<"organizations">) => {
                    setOrganization(organization);
                    return ({ message: "Updated organization!" })
                  },
                  error: "Unable to update organization!"
                })}>
                  <div className={"flex w-full flex-col gap-1"}>
                    <div className={"flex w-full flex-row items-center gap-2"}>
                      <UserCogIcon />
                      <p>{"Automatically Add Members"}</p>
                      <span className={"flex flex-grow-1 justify-end"}>
                        <Checkbox checked={organization.auto_add_members} />
                      </span>
                    </div>
                    <p className={"text-muted-foreground"}>
                      {
                        "As users are created in ProjDocs, they will automatically be added to this organization."
                      }
                    </p>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </ButtonGroup>
      }
    >
      <PaginatedDataTable<DisplayColumn>
        columns={displayColumns}
        getData={props.getProfilesAction}
      />
    </ObjectPage>
  );
};
