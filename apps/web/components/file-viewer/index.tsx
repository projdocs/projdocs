"use client";

import { FileViewerProps } from "@apps/web/components/file-viewer/types";
import { FolderFileViewer } from "@apps/web/components/file-viewer/viewer-folder";
import { FileViewerPrimitive } from "@apps/web/components/file-viewer/primitive";
import { ProjectFileViewer } from "@apps/web/components/file-viewer/viewer-project";
import { FileViewerSkeleton } from "@apps/web/components/file-viewer/skeleton";
import { ClientFileViewer } from "@apps/web/components/file-viewer/viewer-client";
import { MemberFileViewer } from "@apps/web/components/file-viewer/viewer-member";



export const FileViewer = (props: FileViewerProps) => (
  <FileViewerPrimitive {...props} />
);

FileViewer.Primitive = FileViewerPrimitive;

FileViewer.Skeleton = FileViewerSkeleton;

FileViewer.Folder = FolderFileViewer;

FileViewer.Project = ProjectFileViewer;

FileViewer.Client = ClientFileViewer;

FileViewer.Member = MemberFileViewer;