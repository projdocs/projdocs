"use client";
import {
  ImageCrop,
  ImageCropApply,
  ImageCropContent,
  ImageCropReset,
} from "@workspace/ui/components/ui/shadcn-io/image-crop";
import Image from "next/image";
import { type ChangeEvent, useRef, useState } from "react";
import { Input } from "@workspace/ui/components/input";
import { Button } from "@workspace/ui/components/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from "@workspace/ui/components/empty";
import { ImageOffIcon, ImagePlusIcon, XIcon } from "lucide-react";
import { Avatar, AvatarImage } from "@workspace/ui/components/avatar";



const ImageCropper = (props: {
  title?: string;
  description?: string;
  file: File | null;
  setFile: (file: File | null) => void;
  croppedImage: string | null;
  setCroppedImage: (croppedImage: string | null) => void;
}) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      props.setFile(file);
      props.setCroppedImage(null);
    }
  };
  const handleReset = () => {
    props.setFile(null);
    props.setCroppedImage(null);
  };
  if (!props.file) {
    return (
      <div className={"w-full"}>
        <Input
          ref={fileRef}
          type={"file"}
          accept={"image/png, image/jpeg"}
          className={"hidden"}
          onChange={handleFileChange}
        />
        <Empty className="border border-dashed">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ImagePlusIcon/>
            </EmptyMedia>
            <EmptyTitle>{props.title ?? "No Image Uploaded"}</EmptyTitle>
            <EmptyDescription>
              {props.description ?? "Upload an image by clicking the button below."}
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileRef.current?.click()}
            >
              {"Upload Image"}
            </Button>
          </EmptyContent>
        </Empty>
      </div>
    );
  }
  if (props.croppedImage) {
    return (
      <div className="relative w-40 h-40">
        <Avatar className="w-40 h-40 outline-muted outline-solid outline-1">
          <AvatarImage src={props.croppedImage} />
        </Avatar>

        <Button
          onClick={handleReset}
          size="icon"
          variant="outline"
          className="absolute bottom-0 right-0 translate-x-[-10%] translate-y-[-10%] z-10 h-8 w-8 rounded-full"
        >
          <ImageOffIcon />
        </Button>
      </div>
    );
  }
  return (
    <div className={"flex flex-col"}>
      <ImageCrop
        aspect={1}
        file={props.file}
        maxImageSize={1024 * 1024} // 1MB
        onCrop={props.setCroppedImage}
      >
        <ImageCropContent className="max-w-md mb-4"/>
        <div className="flex flex-row items-center justify-center gap-2 w-full">
          <ImageCropApply asChild>
            <Button size="sm" variant="outline">
              Apply Crop
            </Button>
          </ImageCropApply>
          <ImageCropReset asChild>
            <Button size="sm" variant="outline">
              Reset
            </Button>
          </ImageCropReset>
          <Button
            onClick={handleReset}
            size="sm"
            type="button"
            variant="outline"
          >
            Start Over
          </Button>
        </div>
      </ImageCrop>
    </div>
  );
};
export default ImageCropper;