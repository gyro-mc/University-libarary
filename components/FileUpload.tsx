"use Client";
import { toast } from "@/hooks/use-toast";
import config from "@/lib/config";
import { IKImage, IKUpload, IKVideo, ImageKitProvider } from "imagekitio-next";
import { useRef, useState } from "react";
const { urlEndpoint, publicKey, privateKey } = config.env.imagekit;
const { apiEndPoint } = config.env;
import Image from "next/image";
import { cn } from "@/lib/utils";
const authenticator = async () => {
  try {
    const response = await fetch(`${apiEndPoint}/api/auth/imageKit`);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Request failed with status ${response.status}: ${errorText}`
      );
    }

    const data = await response.json();
    const { signature, expire, token } = data;
    return { signature, expire, token };
  } catch (error: any) {
    throw new Error(`Authentication request failed: ${error.message}`);
  }
};
interface Props {
  type: "image" | "video";
  accept: string;
  placeholder: string;
  folder: string;
  variant: "dark" | "light";
  onFileChange: (filePath: string) => void;
  value?: string;
}
const FileUpload = ({
  type,
  accept,
  placeholder,
  folder,
  variant,
  onFileChange,
  value,
}: Props) => {
  const ikUploadRef = useRef(null);
  const [file, setFile] = useState<{ filepath: string | null }>({
    filepath: value ?? null,
  });
  const [progress, setProgress] = useState(0);
  const styles = {
    button:
      variant === "dark"
        ? "bg-dark-300"
        : "bg-light-600 border-gray-100 border",
    placeholder: variant === "dark" ? "text-light-100" : "text-slate-500",
    text: variant === "dark" ? "text-light-100" : "text-dark-400",
  };
  const onError = (err: any) => {
    console.log(err);
    toast({
      title: `${type} upload failed`,
      description: `your ${type} could not be uploaded. Try again pls`,
      variant: "destructive",
    });
  };
  const onSuccess = (res: any) => {
    toast({
      title: `success`,
      description: `${type} is uploaded successfully`,
      variant: "default",
    });
  };
  const onValidate = (file: File) => {
    if (type === "image") {
      if (file.size > 20 * 1024 * 1024) {
        toast({
          title: "File size too large",
          description: "Please upload a file that is less than 20MB in size",
          variant: "destructive",
        });
        return false;
      }
    } else if (type === "video") {
      if (file.size > 50 * 1024 * 1024) {
        toast({
          title: "File size too large",
          description: "Please upload a file that is less than 50MB in size",
          variant: "destructive",
        });
        return false;
      }
    }
    return true;
  };
  return (
    <ImageKitProvider
      publicKey={publicKey}
      urlEndpoint={urlEndpoint}
      authenticator={authenticator}
    >
      <IKUpload
        ref={ikUploadRef}
        onError={onError}
        onSuccess={onSuccess}
        useUniqueFileName={true}
        validateFile={onValidate}
        onUploadStart={() => setProgress(0)}
        onUploadProgress={({ loaded, total }) => {
          const percent = Math.round((loaded / total) * 100);
          setProgress(percent);
        }}
        folder={folder}
        accept={accept}
        className="hidden"
      />
      <button
        className={cn("uploaded-btn", styles.button)}
        onClick={(e) => {
          e.preventDefault();
          if (ikUploadRef.current) {
            // @ts-ignore
            ikUploadRef.current?.click();
          }
        }}
      >
        <Image
          src="/icons/upload.svg"
          alt="upload-icon"
          width={20}
          height={20}
          className="object-contain"
        />
        <p className={cn("text-base", styles.placeholder)}>{placeholder}</p>
      </button>
      {progress > 0 && progress !== 100 && (
        <div className="w-full rounded-full bg-green-200">
          <div className="progress" style={{ width: `${progress}%` }}>
            {progress}%
          </div>
        </div>
      )}
      {file &&
        (type === "image" ? (
          <IKImage
            alt={file.filepath ? file.filepath : "error"}
            path={file.filepath ? file.filepath : "error"}
            width={500}
            height={500}
          />
        ) : type == "video" ? (
          <IKVideo
            path={file.filepath ? file.filepath : "error"}
            controls={true}
            className="h-96 w-full rounded-xl"
          />
        ) : null)}
    </ImageKitProvider>
  );
};
export default FileUpload