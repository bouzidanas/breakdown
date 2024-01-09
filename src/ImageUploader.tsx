import { useState, useEffect, useCallback, useRef } from "react";
import { useDropzone, FileRejection,  } from "react-dropzone";
import { HiArrowUpTray, HiMiniXMark } from "react-icons/hi2";
import md5 from "md5";

interface ImageFile extends File {
    preview: string;
    hash?: string;
}

const ImageUploader = ({className, sizeLimit, imagesLoadedCallback}:{className?:string, sizeLimit?:number, imagesLoadedCallback?:Function}) => {
    const [files, setFiles] = useState<ImageFile[]>([]);
    const [rejected, setRejected] = useState<FileRejection[]>([]);
    const imageSrcs = useRef<{[key:string]:string}>({});

    const onDrop = useCallback(<ImageFile extends File>(acceptedFiles : ImageFile[] , rejectedFiles : FileRejection[] ) => {
        if (acceptedFiles?.length) {
            setFiles((previousFiles) => [
                ...previousFiles,
                ...acceptedFiles.map((file) =>
                    Object.assign(file, { preview: URL.createObjectURL(file) })
                ).filter((file) => previousFiles.map((f) => f.name).indexOf(file.name) === -1),
            ]);
        }

        if (rejectedFiles?.length) {
            console.log(rejectedFiles);
            setRejected((previousFiles) => [...previousFiles, ...rejectedFiles]);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        accept: {
            'image/*': []
        },
        maxSize: (sizeLimit??1) * 1024 * 1000,
        onDrop,
    });

    useEffect(() => {
        // Add image ETAGs to each ImageFile object each time files changes
        files.forEach((file) => {
            setHash(file);
        });
        // Revoke the data uris to avoid memory leaks
        return () => files.forEach((file) => URL.revokeObjectURL(file.preview));
    }, [files]);

    const removeFile = (name: string) => {
        setFiles((files) => files.filter((file) => file.name !== name));
    };

    const removeAll = () => {
        setFiles([]);
        setRejected([]);
    };

    const removeRejected = (name: string) => {
        setRejected((files) => files.filter(({ file } : FileRejection) => file.name !== name));
    };
    // Hashing function
    const setHash = (file: ImageFile) => {
        const reader = new FileReader();
        reader.readAsArrayBuffer(file);
        reader.onload = () => {
            const arrayBuffer = reader.result as ArrayBuffer;
            const bytes = new Uint8Array(arrayBuffer);           // For some reason md5() accepts Uint8Array instead of ArrayBuffer
            const hash = md5(bytes);
            file.hash = hash;
        };
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const UP = import.meta.env.VITE_NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
        const URL = import.meta.env.VITE_NEXT_PUBLIC_CLOUDINARY_URL + '/image/upload';

        if (!files?.length) return;

        let responseCount = 0;
        const formData = new FormData();
        files.forEach((file) => {
            formData.append('file', file);
            UP ? formData.append('upload_preset', UP) : null;
            file.hash ? formData.append("public_id", file.name.slice(0, file.name.lastIndexOf('.')+1) + "~." + file.hash) : null;

            URL ? fetch(URL, {
                method: "POST",
                body: formData
            })
                .then((res) => res.json())
                .then((data) => {
                    responseCount++;
                    const name = data.public_id.split(".~.")[0];
                    
                    // Replace the current contents of the preview property with the secure_url when it is available.
                    // Doing so has the benefit of using the original object url as a backup in case the secure_url is
                    // unavailable and using the more performant secure_url when it is available.
                    // But using the original object urls for images in the breakdown can drastically impact performance
                    // and memory usage, so for that purpose, only secure_url's are loaded into the breakdown part of the app.
                    // The `imageSrcs` object is used to store only the secure_url's for use in the breakdown part of the app.
                    file.preview = data.secure_url;
                    imageSrcs.current[name] = data.secure_url;
                    if (responseCount === files.length) {
                        imagesLoadedCallback?.(imageSrcs.current);
                    }
                }) : null;
        });
    };

    return (
        <>
            <h1 className='title text-[1.6rem]/8 font-semibold'>Upload Images</h1>
            <form onSubmit={handleSubmit}>
                <div
                    {...getRootProps({
                        className: className,
                    })}
                >
                    <input {...getInputProps()} />
                    <div className='flex flex-col items-center justify-center gap-2'>
                        <HiArrowUpTray className='w-5 h-5 fill-current' />
                        {isDragActive ? (
                            <p>Drop the image files here ...</p>
                        ) : (
                            <p>Drag & drop image files here, or click to select files</p>
                        )}
                    </div>
                </div>

                {/* Preview */}
                <section className='mt-4 grow-0'>
                    <div className='flex gap-4 h-9'>
                        {files?.length ? <button
                            type='button'
                            onClick={removeAll}
                            className='mt-0 text-[12px] uppercase tracking-wider font-bold border border-secondary-400 rounded-md px-3 hover:bg-secondary-400 hover:text-white transition-colors'
                        >
                            Remove all
                        </button> : null}
                        <button
                            type='submit'
                            className='ml-auto mt-0 text-[12px] uppercase tracking-wider font-bold border border-purple-400 rounded-md px-3 hover:bg-purple-400 hover:text-white transition-colors'
                        >
                            Upload
                        </button>
                    </div>
                    {!files.length && !rejected.length ? 
                        <div className='flex flex-col items-center justify-center gap-3 mt-2 h-[29vh] text-left'>
                            <p>To function properly, Lyrix player requires a Breakdown file, an audio track and the corresponding LRC file</p>
                            <p>If the Breakdown file you upload makes use of images, you will need to upload those images as well</p>
                            <p>TIP: After uploading files, check the bottom right corner for checkmarks. Green checkmarks indicate success in loading the contents of the files into the player</p>
                        </div> 
                    : null}
                    {files.length > 0 ? 
                    <>
                    {/* Accepted files */}
                    <h3 className='title text-md font-semibold uppercase mt-4 border-b pb-1 w-full text-left'>
                    Accepted <span className="pl-1">({files.length})</span>
                    </h3>
                    <ul className='mt-3 flex flex-row justify-start gap-7 overflow-x-auto max-h-44 min-h-12 pt-4 w-full scrollbar-none [&:hover>li>button]:opacity-100'>
                    {files.map(file => (
                        <li key={file.name} className='relative py-2 w-28'>
                            <div className='flex justify-center items-center h-24 w-24 rounded-xl overflow-hidden shadow-xl'>
                                <img
                                    src={file.preview}
                                    alt={file.name}
                                    style={{width: "100%", minHeight: "100%", objectFit: "cover" }}
                                    onLoad={() => {
                                    URL.revokeObjectURL(file.preview)
                                    }}
                                    className="flex-1"
                                />
                            </div>
                            <button
                                type='button'
                                className='w-7 h-7 border border-secondary-400 opacity-0 hover:border-red-500 bg-secondary-400 rounded-full flex justify-center items-center absolute -top-3 -right-3 hover:bg-red-500 transition-colors'
                                onClick={() => removeFile(file.name)}
                            >
                                <HiMiniXMark  className='w-5 h-5 fill-white transition-colors' />
                            </button>
                            <p className='mt-2 text-[12px] font-medium'>
                                {file.name}
                            </p>
                        </li>
                    ))}
                    </ul>
                    </>
                    : null }
                    { rejected.length > 0 ? 
                    <>
                        <h3 className='title text-md font-semibold uppercase border-b pb-1 w-full text-left '>
                        Rejected <span className=" pl-1">({rejected.length})</span>
                        </h3>
                        <ul className='mt-2 flex flex-col max-h-[6.6rem] min-h-10 overflow-y-scroll scrollbar-none'>
                            {rejected.map(({ file, errors }, index) => (
                                <li key={file.name+"-"+index} className='flex items-center justify-between'>
                                <div>
                                    <p className='mt-2 text-sm font-medium text-left'>
                                    {file.name}
                                    </p>
                                    <ul className='text-[12px] opacity-60'>
                                    {errors.map(error => (
                                        <li key={error.code}>{error.code === "file-too-large" ? "File size exceeds "+(sizeLimit??1)+"MB limit":error.message}</li>
                                    ))}
                                    </ul>
                                </div>
                                <button
                                    type='button'
                                    className='mt-1 py-1 text-[12px] uppercase tracking-wider font-bold border border-secondary-400 rounded-md px-3 hover:bg-secondary-400 hover:text-white transition-colors'
                                    onClick={() => removeRejected(file.name)}
                                >
                                    remove
                                </button>
                                </li>
                            ))}
                        </ul>
                    </>
                    : null }
                </section>
            </form>
        </>
    )
}

export default ImageUploader;