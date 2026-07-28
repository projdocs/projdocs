"use client";

import { FileViewerProps } from "./types";
import { FolderFileBrowser } from "./viewer-folder";
import { FileBrowserPrimitive } from "./primitive";
import { ProjectFileBrowser } from "./viewer-project";
import { FileBrowserSkeleton } from "./skeleton";
import { ClientFileBrowser } from "./viewer-client";



export const FileBrowser = (props: FileViewerProps) => (
  <FileBrowserPrimitive {...props} />
);

FileBrowser.Primitive = FileBrowserPrimitive;

FileBrowser.Skeleton = FileBrowserSkeleton;

FileBrowser.Folder = FolderFileBrowser;

FileBrowser.Project = ProjectFileBrowser;

FileBrowser.Client = ClientFileBrowser;