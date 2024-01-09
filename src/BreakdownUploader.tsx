import { useState, useCallback } from "react";
import { useDropzone, FileRejection,  } from "react-dropzone";
import { HiArrowUpTray, HiMiniCheck, HiXMark } from "react-icons/hi2";
import type { breakdownContentType } from './assets/breakdown';

interface BreakdownFile extends File {
    preview: breakdownContentType;
}

const BreakdownUploader = ({className, sizeLimit, breakdownLoadedCallback}:{className?:string, sizeLimit?:number, breakdownLoadedCallback?: (breakdown : breakdownContentType)=> void}) => {
    const [files, setFiles] = useState<BreakdownFile[]>([]);
    const [rejected, setRejected] = useState<FileRejection[]>([]);

    const onDrop = useCallback(<BreakdownFile extends File>(acceptedFiles : BreakdownFile[] , rejectedFiles : FileRejection[] ) => {
        if (acceptedFiles?.length) {
            acceptedFiles.forEach(file => {
                try {
                    file.text().then((text) => {
                        setFiles( [
                            ...acceptedFiles.map((file) =>
                                Object.assign(file, { preview: JSON.parse(text)})
                            )]);
                    });
                } catch (error) {
                    console.log(error);
                }
            });
        }

        if (rejectedFiles?.length) {
            setRejected([...rejectedFiles]);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        accept: {
            'application/json': ['.bkdn', '.json']
        },
        maxSize: (sizeLimit??10) * 1024 * 1000,
        onDrop,
        multiple: false
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        console.log("submit");

        if (!files?.length) return;
        
        breakdownLoadedCallback?.(files[0].preview);
    };

    const removeFile = (name: string) => {
        setFiles((files) => files.filter((file) => file.name !== name));
    };

    const removeRejected = (name: string) => {
        setRejected((files) => files.filter(({ file } : FileRejection) => file.name !== name));
    };

    return (
        <>
            <h1 className='title text-[1.6rem]/8 font-semibold'>Upload Breakdown</h1>
            <form onSubmit={handleSubmit}>
                <div
                    {...getRootProps({
                        className: className,
                    })}
                >
                    <input {...getInputProps()} />
                    <div className='flex flex-col items-center justify-between'>
                        <HiArrowUpTray className='w-5 h-5 fill-current' />
                        {isDragActive ? (
                            <p>Drop the audio file here ...</p>
                        ) : (
                            <p>Drag & drop audio file here, or click to select file</p>
                        )}
                    </div>
                </div>

                {/* Preview */}
                <section className='mt-4 grow-0'>
                    <div className='flex gap-4 h-9'>
                        <button
                            type='submit'
                            className='ml-auto mt-0 text-[12px] uppercase tracking-wider font-bold border border-purple-400 rounded-md px-3 hover:bg-purple-400 hover:text-white transition-colors'
                        >
                            Upload
                        </button>
                    </div>
                    { files.length > 0 ? 
                    <>
                        <h3 className='title text-md font-semibold uppercase border-b pb-1 w-full text-left '>
                            Breakdown File 
                        </h3>
                        <ul className='mt-2 flex flex-col max-h-[6.6rem] min-h-10 overflow-y-scroll scrollbar-none'>
                            <li key={"bkdn-"+files[0].name} className='flex items-center justify-between'>
                                <div>
                                    <p className='mt-1 text-sm font-medium text-left'>
                                    {files[0].name}
                                    </p>
                                </div>
                                <div className='flex flex-row items-center gap-4'> 
                                <div className='mt-1 text-sm font-medium text-right text-green-300'>
                                        <HiMiniCheck className='w-5 h-5 fill-current' />
                                    </div>
                                    <button
                                        type='button'
                                        className='mt-1 py-1 text-[12px] uppercase tracking-wider font-bold border border-secondary-400 rounded-md px-3 hover:bg-secondary-400 hover:text-white transition-colors'
                                        onClick={() => removeFile(files[0].name)}
                                    >
                                        remove
                                    </button>
                                </div>
                            </li>
                        </ul>
                    </>
                    : null }
                    { rejected.length > 0 ? 
                    <>
                        <h3 className='title text-md font-semibold uppercase border-b pb-1 w-full text-left '>
                            Breakdown File 
                        </h3>
                        <ul className='mt-2 flex flex-col max-h-[6.6rem] min-h-10 overflow-y-scroll scrollbar-none'>
                            {rejected.map(({ file, errors }, index) => (
                                <li key={file.name+"-"+index} className='flex items-center justify-between'>
                                    <div>
                                        <p className='mt-1 text-sm font-medium text-left'>
                                            {file.name}
                                        </p>
                                        <ul className='text-[12px] opacity-60'>
                                            {errors.map(error => (
                                                <li key={error.code}>{error.code === "file-too-large" ? "File size exceeds "+(sizeLimit??1)+"MB limit":error.message}</li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className='flex flex-row items-center gap-4'>
                                    <div className='mt-1 text-sm font-medium text-right text-red-500'>
                                            <HiXMark className='w-5 h-5 fill-current' />
                                        </div>
                                        <button
                                            type='button'
                                            className='mt-1 py-1 text-[12px] uppercase tracking-wider font-bold border border-secondary-400 rounded-md px-3 hover:bg-secondary-400 hover:text-white transition-colors'
                                            onClick={() => removeRejected(file.name)}
                                        >
                                            remove
                                        </button>
                                    </div>
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

export default BreakdownUploader;